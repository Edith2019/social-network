const express = require("express");
const app = express();
const server = require("http").Server(app);
const port = process.env.PORT || 8080;
const io = require("socket.io")(server, {
    origins: "localhost:8080 192.168.0.123:8080 swork-berlin.herokuapp.com:*"
});
const compression = require("compression");
const db = require("./utils/db");
const csurf = require("csurf");
const { hash, compare } = require("./utils/db");
app.use(express.static("./public"));
app.use(compression());
app.use(express.json());
const ses = require("./utils/ses");
const cryptoRandomString = require("crypto-random-string");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const s3 = require("./s3");
const conf = require("./config");

let secrets;
if (process.env.SESSION_SECRET) {

    secrets = {
        cookieSession: {
            secret: process.env.SESSION_SECRET
        }
    };
} else {
    secrets = require("./utils/secrets");
}

app.use((req, res, next) => {
    res.set("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken;
    next();
});

// cookies //

const cookieSession = require("cookie-session");

const cookieSessionMiddleware = cookieSession({
    secret: "I am a cookie",
    maxAge: 1000 * 60 * 60 * 24 * 14
});

app.use(cookieSessionMiddleware);
io.use(function (socket, next) {
    cookieSessionMiddleware(socket.request, socket.request.res, next);
});

// csurf //
app.use(csurf());

app.use(function (req, res, next) {
    res.cookie("mytoken", req.csrfToken());
    next();
});

if (process.env.NODE_ENV !== "production") {
    app.use(
        "/bundle.js",
        require("http-proxy-middleware")({
            target: "http://localhost:8081/"
        })
    );
} else {
    app.use("/bundle.js", (req, res) => res.sendFile(`${__dirname}/bundle.js`));
}

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function (uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

// set hash pw and cookie //
app.post("/register", (req, res) => {
    const { first, last, email, pw } = req.body;
    hash(pw)
        .then(hPWresult => {
            db.addHashed(first, last, email, hPWresult )
                .then(result => {
                    req.session.profile = {};
                    req.session.userId = result.rows[0].id;
                    req.session.first = result.rows[0].first;
                    req.session.last = result.rows[0].last;
                    req.session.email = result.rows[0].email;
                    req.session.password = result.rows[0].password;
                    res.json({
                        success: true
                    });
                }).catch(err => {
                    console.error("error in post register", err);
                    res.json({
                        error: true
                    });
                });
        }).catch(err => {
            console.error("error in post register", err);
            res.json({
                error: true
            });
        });
});

// route for login identification //
app.post("/login", (req, res) => {
    const emailLog = req.body.email;
    const pwLog = req.body.pw;
    db.getHashed(emailLog).then(result => {
        const hashedPw = result.rows[0].password;
        compare(pwLog, hashedPw).then(response => {
            if (response === true) {
                req.session.userId = result.rows[0].id;
                req.session.first = result.rows[0].first;
                req.session.last = result.rows[0].last;
            }
            res.json({
                success: true
            });
        }).catch(err => {
            console.error("error in returning pw from compare", err);
            res.json({
                error: true
            });
        });
    }).catch(err => {
        console.error("error in gethashed", err);
        res.json({
            error: true
        });

    });
});

// route to identfy user  is logged in. If no user ID //
app.get("/welcome", function (req, res) {
    if (!req.session.userId) {
        res.sendFile(__dirname + "/index.html");
    } else {
        res.redirect("/");
    }
});

// resert pw //
app.post("/password/reset/start", (req, res) => {
    const emailRes = req.body.email;
    db.getEmailRes(emailRes)
        .then(result => {
            if (emailRes === result.rows[0].email) {
                const secretCode = cryptoRandomString({
                    length: 6
                });
                db.addCode(secretCode, emailRes).then(() => {
                });
                ses.sendEmail("edith.chevallier3000@gmail.com", "Your new password", secretCode);
            }
        }).then(() => {
            res.json({ success: true });
        }).catch(err => {
            console.error(err);
            res.json({ error: true });
        });
});

app.post("/password/reset/verify", (req, res) => {
    const { code, email, newPw } = req.body;
    db.selectCode(email)
        .then(result => {
            if (code === result.rows[0].code) {
                return hash(newPw);
            } else {
                throw new Error("invalid code");
            }
        })
        .then(hPWresult => db.addNewPw(email, hPWresult))
        .then(() => res.json({ success: true }))
        .catch(err => {
            console.error(err);
            res.json({
                error: true
            });
        });
});

// app.post("/password/reset/verify", (req, res) => {
//     const codeConf = req.body.code;
//     const emailConf = req.body.email;
//     var newPw = req.body.newPw;
//     db.selectCode(emailConf).then(result => {
//         if (codeConf == result.rows[0].code) {
//             hash(newPw).then(hPWresult => {
//                 db.addNewPw(emailConf, hPWresult).then(() => {
//                     res.json({
//                         success: true
//                     });
//                 }).catch(err => {
//                     console.error("there is an error in rendergin pw", err);
//                     res.json({
//                         error: true
//                     });
//                 });
//             }).catch(err => {
//                 console.error("error in rendering the code", err);
//                 res.json({
//                     error: true
//                 });
//             });
//         }
//     }).catch(err => {
//         console.error("error in rendering the code", err);
//         res.json({
//             error: true
//         });
//     });
// })

app.get("/getloggeddata", (req, res) => {
    const userId = req.session.userId;
    db.getUserPic(userId).then(result => {
        const data = {
            id: result.rows[0].id,
            first: result.rows[0].first,
            last: result.rows[0].last,
            email: result.rows[0].email,
            biography: result.rows[0].biography,
            url: result.rows[0].url_profile
        };
        res.json(data);
    }).catch(err => {
        console.error(err);
        res.json({
            error: true
        });
    });

});

app.post("/upload/image", uploader.single("file"), s3.upload, (req, res) => {
    var addUrl = conf.s3Url + req.file.filename;
    const userId = req.session.userId;
    db.addUrl(userId, addUrl).then(result => {
        const data = result.rows[0];
        res.json(data);
    }).catch(err => {
        console.error(err);
        res.json({
            error: true
        });
    });
});

app.post("/upload/biography", (req, res) => {
    const biography = req.body.biography;
    const userId = req.session.userId;
    db.addBiography(userId, biography).then(result => {
        const data = result.rows[0];
        res.json(data);
    }).catch(err => {
        console.error(err);
        res.json({
            error: true
        });
    });
});

app.get("/user/:id.json", (req, res) => {
    const userId = req.params.id;
    if (req.params.id == req.session.userId) {
        res.json({
            redirect: true
        });
    } else {
        db.getOtherUser(userId).then(result => {
            const data = result.rows[0];
            res.json({ data });
        }).catch(err => {
            console.error(err);
            res.json({ error: true });
        });
    }
});

app.get("/users.json", (req, res) => {
    db.getThreeUsers().then(result => {
        const data = result.rows;
        res.json(data);
    }).catch(err => {
        console.error(err);
        res.json({
            error: true
        });
    });
});

app.get("/findprofile/:usersearch", (req, res) => {
    const input = req.params.usersearch;
    db.getProfilesMatch(input).then(result => {
        const data = result.rows;
        res.json(data);
    }).catch(err => {
        console.error(err);
        res.json({
            error: true
        });
    });
});

app.get("/initial-friendship-status/:otherUserId", (req, res) => {
    const senderId = req.session.userId;
    const receiverId = req.params.otherUserId;
    db.getCurrentStatus(receiverId, senderId).then(result => {
        if (result.rows.length === 0) {
            res.json({
                data: true,
                addFriend: true
            });
        } else if (result.rows[0]) {
            if (result.rows[0].accepted == true) {
                res.json({
                    data: true,
                    unfriend: true
                });
            } else if (result.rows[0].accepted == false) {
                if (result.rows[0].receiver_id == req.session.userId) {
                    res.json({
                        data: true,
                        acceptFrequest: true
                    });
                } else {
                    res.json({
                        data: true,
                        cancelFrequest: true
                    });
                }
            }
        }
    }).catch(err => {
        console.error(err);
        res.json({
            error: true
        });
    });

});

app.post("/make-friend-request/:otherUserId", (req, res) => {
    const senderId = req.session.userId;
    const receiverId = req.params.otherUserId;
    db.postFriendRequest(senderId, receiverId).then(() => {
        res.json({
            data: true
        });
    }).catch(err => {
        console.error(err);
        res.json({
            error: true
        });
    });
});

app.post("/end-friendship/:otherUserId", (req, res) => {
    const senderId = req.session.userId;
    const receiverId = req.params.otherUserId;
    db.postEndFriendship(senderId, receiverId).then(() => {
        res.json({
            data: true
        });
    }).catch(err => {
        console.error(err);
        res.json({
            error: true
        });
    });
});

app.post("/add-friendship/:otherUserId", (req, res) => {
    const senderId = req.session.userId;
    const receiverId = req.params.otherUserId;
    const accepted = true;
    db.postAddFriendship(senderId, receiverId, accepted).then(() => {
        res.json({
            data: true
        });
    }).catch(err => {
        console.error(err);
        res.json({ error: true });
    });

});

app.get("/friends.json", (req, res) => {
    const userId = req.session.userId;
    db.getFriends(userId).then(data => {
        res.json(
            data.rows
        );
    }).catch(err => {
        console.error(err);
        res.json({
            error: true
        });
    });
});

app.post("/acceptFriendRequest/:otherId", (req, res) => {
    const senderId = req.params.otherId;
    const receiverId = req.session.userId;
    const accepted = true;
    db.postAcceptFriendList(senderId, receiverId, accepted).then(() => {
        res.json({
            accepted: true
        });
    }).catch(err => {
        console.error(err);
        res.json({ error: true });
    });

});

app.post("/declineFriendRequest/:otherId", (req, res) => {
    const senderId = req.session.userId;
    const receiverId = req.params.otherId;
    db.postDeclineFriendList(senderId, receiverId).then(() => {
        res.json({
            accepted: true
        });
    }).catch(err => {
        console.error(err);
        res.json({
            error: true
        });
    });
});

app.post("/deleteFriendRequest/:otherId", (req, res) => {
    const senderId = req.session.userId;
    const receiverId = req.params.otherId;
    db.postDeleteFriendship(senderId, receiverId).then(() => {
        res.json({
            accepted: true
        });
    }).catch(err => {
        console.error(err);
        res.json({
            error: true
        });
    });
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.json({ success: true });
});

app.post("/delete", s3.deleteAWS, (req, res) => {
    const userId = req.session.userId;
    db.postDeleteAccountProfile(userId)
        .then(() => {
            res.json({ success: true });
        }).catch(err => {
            console.error(err);
            res.json({ error: true });
        });
    db.postDeleteAccountFriends(userId).then(() => {
        res.json({ success: true });
    }).catch(err => {
        console.error(err);
        res.json({ error: true });
    });
    db.postDeleteAccountChat(userId).then(() => {
        res.json({ success: true });
    }).catch(err => {
        console.error(err);
        res.json({ error: true });
    });
    req.session = null;
});

app.get("/otherChatterData/:otherChatterId", (req, res) => {
    const userId = req.params.otherChatterId;
    db.getOtherUser(userId).then(result => {
        res.json([result.rows[0]]);
    }).catch(err => {
        console.error(err);
        res.json({ error: true });
    });
});

// has to be the really last route
app.get("*", function (req, res) {
    if (req.session.userId) {
        res.sendFile(__dirname + "/index.html");
    } else {
        res.redirect("/welcome");
    }
});

server.listen(port, function () {
    console.log(`I'm listening on port: ${port}`);
});

// sockets //
let onlineUsers = [];
io.on("connection", function (socket) {
    if (!socket.request.session.userId) {
        return socket.disconnect(true);
    }
    // allow us to access the cookie session, we only want to use socket if the user is logged in //
    const userId = socket.request.session.userId;
    db.getLastTenMessages().then(data => {
        const dataReverse = data.rows.reverse();
        io.sockets.emit("chatMessages", dataReverse);
    });

    socket.on("chatMessage", newMsg => {
        db.postMessage(newMsg, userId).then(result => {
            const senderId = result.rows[0].sender_id;
            db.selectMessageData(senderId).then(result => {
                const msg = result.rows;
                io.sockets.emit("chatMessage", msg);
            });
        });
    });

    onlineUsers.push({
        socketId: socket.id,
        userId
    });

    for (var i = 0; i < onlineUsers.length; i++) {
        if (onlineUsers[i].userId !== userId) {
            db.sendSocketdata(userId).then(result => {
                const newUser = result.rows;
                socket.broadcast.emit("newUserJoined", newUser);
            });

        } else {
            const onlineIds = onlineUsers.map((user) => user.userId);
            const onlineId = Array.from(new Set(onlineIds));
            db.sendOneSocketdata(onlineId).then(result => {
                const otherUserOnline = result.rows;
                io.sockets.sockets[socket.id].emit("onlineusers", otherUserOnline);
            });
        }
    }

    socket.on("chatPrivateMessage", newPmsg => {
        db.postPMessage(newPmsg, userId).then(result => {
            const senderId = result.rows[0].sender_id;
            db.selectPMessageData(senderId).then(result => {
                const Pmsg = result.rows;
                io.sockets.emit("chatPrivateMessage", Pmsg);
            });
        });
    });

    socket.on("disconnect", () => {
        delete onlineUsers[socket.id];
    });
});