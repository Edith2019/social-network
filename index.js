const express = require('express');
const app = express();
const server = require('http').Server(app);
const port = process.env.PORT || 8080;
const io = require('socket.io')(server, {
    origins: 'localhost:8080 192.168.0.123:8080 swork-berlin.herokuapp.com:*',
});
const compression = require('compression');
const db = require('./utils/db');
const csurf = require('csurf');
const { hash, compare } = require('./utils/db');
app.use(express.static('./public'));
app.use(compression());
app.use(express.json());
const ses = require('./utils/ses');
const cryptoRandomString = require('crypto-random-string');
const multer = require('multer');
const uidSafe = require('uid-safe');
const path = require('path');
const s3 = require('./s3');
const conf = require('./config');


let secrets;
if (process.env.SESSION_SECRET) {
    secrets = {
        cookieSession: {
            secret: process.env.SESSION_SECRET
        }
    };
} else {
    secrets = require('./utils/secrets');
}

app.use((req, res, next) => {
    res.set('x-frame-options', 'DENY');
    res.locals.csrfToken = req.csrfToken;
    next();
});

//cookies //

const cookieSession = require('cookie-session');

const cookieSessionMiddleware = cookieSession({
    secret: 'I am a cookie',
    maxAge: 1000 * 60 * 60 * 24 * 14
});

app.use(cookieSessionMiddleware);
io.use(function (socket, next) {
    cookieSessionMiddleware(socket.request, socket.request.res, next);
});

////csurf
app.use(csurf());

app.use(function (req, res, next) {
    res.cookie('mytoken', req.csrfToken());
    next();
    console.log("req.csrf", req.csrfToken);
});

if (process.env.NODE_ENV != 'production') {
    app.use(
        '/bundle.js',
        require('http-proxy-middleware')({
            target: 'http://localhost:8081/'
        })
    );
} else {
    app.use('/bundle.js', (req, res) => res.sendFile(`${__dirname}/bundle.js`));
}

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
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

//set hash pw and cookie
app.post('/register', (req, res) => {
    console.log("made it to register");
    const first = req.body.first;
    const last = req.body.last;
    const email = req.body.email;
    const pw = req.body.pw;
    hash(pw).then(hPWresult => {
        db.addHashed(first, last, email, hPWresult).then(result => {
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
            console.log("error in post register", err);
            res.json({
                error: true
            });
        });
    }).catch(err => {
        console.log("error in post register", err);
        res.json({
            error: true
        });
    });

});

// route for login identification
app.post('/login', (req, res) => {
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
            console.log("req.session", req.session.userId);
            res.json({
                success: true
            });
        }).catch(err => {
            console.log("error in returning pw from compare", err);
            res.json({
                error: true
            });
        });
    }).catch(err => {
        console.log("error in gethashed", err);
        res.json({
            error: true
        });

    });
});

// route to identfy user  is logged in. If no user ID 
app.get('/welcome', function (req, res) {
    // console.log("mde it to welcome route");
    if (!req.session.userId) {
        res.sendFile(__dirname + '/index.html');
    } else {
        res.redirect('/');
    }
});


app.post('/password/reset/start', (req, res) => {
    // console.log("made it to enter email");
    const emailRes = req.body.email;
    db.getEmailRes(emailRes).then(result => {
        if (emailRes == result.rows[0].email) {
            // console.log("true");
            // console.log("made it to testemail");
            const secretCode = cryptoRandomString({
                length: 6
            }); console.log("secret Code", secretCode);
            db.addCode(secretCode, emailRes).then(result => {
                // console.log("result in add code", result);
            }).catch(err => {
                console.log("error in testemail", err);
                res.json({
                    error: true
                });
            });
            ses.sendEmail('edith.chevallier3000@gmail.com', 'Im the subject of an email!', secretCode)
                .then(() => {
                    res.json({
                        success: true
                    });
                    // console.log("it works weell");
                })
                .catch(err => {
                    // something went wrong
                    console.log("error in testemail", err);
                    res.json({
                        error: true
                    });
                });
        }
    }).catch(err => {
        console.log("error inreset pw enter email", err);
        res.json({
            error: true
        });
    });
});

app.post('/password/reset/verify', (req, res) => {
    // console.log("made it to password code entered");
    const codeConf = req.body.code;
    const emailConf = req.body.email;
    var newPw = req.body.newPw;
    db.selectCode(emailConf).then(result => {
        if (codeConf == result.rows[0].code) {
            hash(newPw).then(hPWresult => {
                db.addNewPw(emailConf, hPWresult).then(() => {
                    res.json({
                        success: true
                    });
                }).catch(err => {
                    console.log('there is an error in rendergin pw', err);
                    res.json({
                        error: true
                    });
                });
            }).catch(err => {
                console.log("error in rendering the code", err);
                res.json({
                    error: true
                });
            });
        }
    }).catch(err => {
        console.log("error in rendering the code", err);
        res.json({
            error: true
        });
    });
});

app.get('/getloggeddata', (req, res) => {
    // console.log("made it to res data");
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
        console.log("error in getttin data for pic", err);
        res.json({
            error: true
        });
    });

});


app.post('/upload/image', uploader.single('file'), s3.upload, (req, res) => {
    // console.log("made it to  upload image post");
    var addUrl = conf.s3Url + req.file.filename;
    const userId = req.session.userId;
    db.addUrl(userId, addUrl).then(result => {
        const data = result.rows[0];
        res.json(data);
    }).catch(err => {
        console.log("error in upload image", err);
        res.json({
            error: true
        });
    });
});

app.post('/upload/biography', (req, res) => {
    // console.log("made it to route upload biography");
    const biography = req.body.biography;
    const userId = req.session.userId;
    db.addBiography(userId, biography).then(result => {
        const data = result.rows[0];
        res.json(data);
    }).catch(err => {
        console.log("error in upload bio", err);
        res.json({
            error: true
        });
    });
});

app.get(`/user/:id.json`, (req, res) => {
    // console.log("made it to route profile/id/json");
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
            console.log("error in rendergin other profile", err);
            res.json({ error: true });
        });
    }
});

app.get('/users.json', (req, res) => {
    // console.log("made it to route user json");

    db.getThreeUsers().then(result => {
        const data = result.rows;
        res.json(data);
    }).catch(err => {
        console.log("error in gettin three users", err);
        res.json({
            error: true
        });
    });
});

app.get('/findprofile/:usersearch', (req, res) => {
    // console.log("made it to route usersearch);
    const input = req.params.usersearch;
    db.getProfilesMatch(input).then(result => {
        const data = result.rows;
        res.json(data);
    }).catch(err => {
        console.log("error in bd", err);
        res.json({
            error: true
        });
    });
});


app.get('/initial-friendship-status/:otherUserId', (req, res) => {
    // console.log("made it to initial friendship status");
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
                    // console.log("usermakefriend req to you");
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
        console.log("error in initial frienship status", err);
        res.json({
            error: true
        });
    });

});

app.post('/make-friend-request/:otherUserId', (req, res) => {
    // console.log("made it to post make friend request");
    const senderId = req.session.userId;
    const receiverId = req.params.otherUserId;
    db.postFriendRequest(senderId, receiverId).then(result => {
        // console.log("result", result);
        res.json({
            data: true
        });
    }).catch(err => {
        console.log("error in db", err);
        res.json({
            error: true
        });
    });
});

app.post('/end-friendship/:otherUserId', (req, res) => {
    // console.log("made it to delete");
    const senderId = req.session.userId;
    const receiverId = req.params.otherUserId;
    db.postEndFriendship(senderId, receiverId).then(result => {
        // console.log("results in deleting", result);
        res.json({
            data: true
        });
    }).catch(err => {
        console.log("error in ending friendship", err);
        res.json({
            error: true
        });
    });
});

app.post('/add-friendship/:otherUserId', (req, res) => {
    // console.log("made it to accept route");
    const senderId = req.session.userId;
    console.log("sender id", senderId);
    const receiverId = req.params.otherUserId;
    console.log("receiver ID", receiverId);
    const accepted = true;
    db.postAddFriendship(senderId, receiverId, accepted).then(result => {
        console.log("result in accepting friends", result);
        res.json({
            data: true
        });
    }).catch(err => {
        console.log("error in accepting friendhsip", err);
        res.json({ error: true });
    });

});

app.get('/friends.json', (req, res) => {
    // console.log("made it to wannabe route");
    const userId = req.session.userId;
    db.getFriends(userId).then(data => {
        console.log("data row0", data.rows);
        res.json(
            data.rows
        );
    }).catch(err => {
        console.log("error in wannabees", err);
        res.json({
            error: true
        });
    });
});


app.post('/acceptFriendRequest/:otherId', (req, res) => {
    // console.log("made if accept friend request route");
    const senderId = req.params.otherId;
    const receiverId = req.session.userId;
    const accepted = true;
    db.postAcceptFriendList(senderId, receiverId, accepted).then(accepted => {
        // console.log("data in list post", accepted);
        res.json({
            accepted: true
        });
    }).catch(err => {
        console.log("error in accept friend list pot", err);
        res.json({ error: true });
    });

});

app.post('/declineFriendRequest/:otherId', (req, res) => {
    // console.log("made if decline friend request route");
    const senderId = req.session.userId;
    const receiverId = req.params.otherId;
    db.postDeckineFriendList(senderId, receiverId).then(data => {
        // console.log("data in declining", data);
        res.json({
            accepted: false
        });
    }).catch(err => {
        console.log("error in declining friendship", err);
        res.json({
            error: true
        });
    });
});

app.post('/deleteFriendRequest/:otherId', (req, res) => {
    // console.log("made it to delete route ");
    const senderId = req.session.userId;
    const receiverId = req.params.otherId;
    db.postDeleteFriendship(senderId, receiverId).then(data => {
        // console.log("data", data);
        res.json(
            data
        );
    }).catch(err => {
        console.log("error in decletings friendship", err);
        res.json({
            error: true
        });
    });
});

app.get("/logout", (req, res) => {
    req.session = null;
    res.json({ success: true });
});

app.post('/delete', s3.deleteAWS, (req, res) => {
    // console.log("made it to delete route");
    const urlProfile = req.body.url_profile;
    const userId = req.session.userId;
    console.log("filename", urlProfile);
    console.log("userID in delete", userId);
    db.postDeleteAccountProfile(userId).then(result => {
        console.log("resuls in deleteaccount", result);
        res.json({ success: true });
    }).catch(err => {
        res.json({ error: true });
    });
    db.postDeleteAccountFriends(userId).then(result => {
        console.log("resuls in deletefriends", result);
        res.json({ success: true });
    }).catch(err => {
        res.json({ error: true });
    });
    db.postDeleteAccountChat(userId).then(result => {
        console.log("resuls in deletefriends", result);
        res.json({ success: true });
    }).catch(err => {
        res.json({ error: true });
    });

    req.session = null;
});

app.get('/otherChatterData/:otherChatterId', (req, res) => {
    // console.log("made it to otherchatter route");
    const userId = req.params.otherChatterId;
    db.getOtherUser(userId).then(result => {
        // console.log("result in otherchatter", result);
        res.json([result.rows[0]]);
    }).catch(err => {
        console.log("error in rendering otherchattter", err);
        res.json({ error: true });
    });
});

//has to be the really last route
app.get('*', function (req, res) {
    console.log("made to star route");
    if (req.session.userId) {
        res.sendFile(__dirname + '/index.html');
    } else {
        res.redirect('/welcome');
    }
});

server.listen(port, function () {
    console.log(`I'm listening on port: ${port}`);
});

////sockets /////
let onlineUsers = [];
io.on('connection', function (socket) {
    // console.log(`socket with the id ${socket.id} is now connected`);
    if (!socket.request.session.userId) {
        return socket.disconnect(true);
    }
    // allow us to access the cookie session, we only want to use socket if the user is logged in
    const userId = socket.request.session.userId;
    db.getLastTenMessages().then(data => {
        const dataReverse = data.rows.reverse();
        io.sockets.emit('chatMessages', dataReverse);
    });

    socket.on('chatMessage', newMsg => {
        // console.log('this message came from js', newMsg);
        db.postMessage(newMsg, userId).then(result => {
            const senderId = result.rows[0].sender_id;
            db.selectMessageData(senderId).then(result => {
                const msg = result.rows;
                io.sockets.emit('chatMessage', msg);
            });
        });

    });

    onlineUsers.push({
        socketId: socket.id,
        userId
    });

    for (var i = 0; i < onlineUsers.length; i++) {
        if (onlineUsers[i].userId != userId) {
            db.sendSocketdata(userId).then(result => {
                const newUser = result.rows;
                socket.broadcast.emit('newUserJoined', newUser);
            });

        } else {
            const onlineIds = onlineUsers.map((user) => user.userId);
            const onlineId = Array.from(new Set(onlineIds));
            db.sendOneSocketdata(onlineId).then(result => {
                const otherUserOnline = result.rows;
                io.sockets.sockets[socket.id].emit('onlineusers', otherUserOnline);
            });
        }
    }

    socket.on('chatPrivateMessage', newPmsg => {
        console.log("socket in private message");
        db.postPMessage(newPmsg, userId).then(result => {
            const senderId = result.rows[0].sender_id;
            db.selectPMessageData(senderId).then(result => {
                const Pmsg = result.rows;
                io.sockets.emit('chatPrivateMessage', Pmsg);
            });
        });

    });

    socket.on("disconnect", () => {
        delete onlineUsers[socket.id];
        // console.log(`socket with the id ${socket.id} is now discconnected`);
    });
});