const spicedPg = require("spiced-pg");
const bcrypt = require('bcryptjs');
let { genSalt, hash, compare } = bcrypt; //those function are asynchronus
const { promisify } = require('util');
genSalt = promisify(genSalt);
hash = promisify(hash);
compare = promisify(compare);


let db;
let secrets;
if (process.env.DATABASE_URL) {
    db = spicedPg(process.env.DATABASE_URL);
} else {
    secrets = require('./secrets');
    db = spicedPg(`postgres:${secrets.users.user}:${secrets.users.pwreg}@localhost:5432/profiles`);

}

module.exports.compare = compare;
module.exports.hash = hPWresult => genSalt().then(salt => hash(hPWresult, salt));
module.exports.hash = newhPWresult => genSalt().then(salt => hash(newhPWresult, salt));

module.exports.addHashed = (first, last, email, hPWresult) => {
    const q = `
    INSERT INTO profiles (first, last, email, password)
    VALUES ($1, $2, $3, $4)
    RETURNING * 
    `;
    const params = [first, last, email, hPWresult];
    return db.query(q, params);
};

module.exports.getHashed = (emailLog) => {
    const q = `SELECT profiles.email, profiles.first, profiles.last, profiles.password, profiles.id
    FROM profiles
    WHERE email = $1
    `;
    const params = [emailLog];
    return db.query(q, params);
};

module.exports.getEmailRes = (emailRes) => {
    const q = `SELECT profiles.email, profiles.first, profiles.last, profiles.password, profiles.id
    FROM profiles
    WHERE email = $1
    `;
    const params = [emailRes];
    return db.query(q, params);
};

module.exports.addCode = (secretCode, emailRes) => {
    const q = `INSERT INTO pw_codes (code, email)
    VALUES ($1, $2)
    RETURNING *
    `;
    const params = [secretCode, emailRes];
    return db.query(q, params);
};

module.exports.selectCode = (emailConf) => {
    const q = ` 
    SELECT * FROM pw_codes
    WHERE CURRENT_TIMESTAMP - created_at < INTERVAL '10 minutes'
    AND email = $1
    ORDER BY id DESC LIMIT 1
   `;
    const params = [emailConf];
    return db.query(q, params);
};




module.exports.addNewPw = (emailConf, hPWresult) => {
    const q = ` UPDATE profiles SET password = $2
    WHERE email = $1
    `;
    const params = [emailConf, hPWresult];
    return db.query(q, params);
};

module.exports.getUserPic = (userId) => {
    const q = ` SELECT * from profiles 
    WHERE id= $1
    `;
    const params = [userId];
    return db.query(q, params);
};

module.exports.addUrl = (userId, addUrl) => {
    const q = ` UPDATE profiles SET url_profile = $2
    WHERE id = $1
    RETURNING *
    `;
    const params = [userId, addUrl];
    return db.query(q, params);
};

module.exports.addBiography = (userId, biography) => {
    const q = ` UPDATE profiles SET biography = $2
    WHERE id = $1
    RETURNING *
    `;
    const params = [userId, biography];
    return db.query(q, params);
};

module.exports.getOtherUser = (userId) => {
    const q = `SELECT * FROM profiles 
    WHERE id = $1
    `;
    const params = [userId];
    return db.query(q, params);
};

module.exports.getThreeUsers = () => {
    const q = `SELECT *
    FROM profiles
    ORDER BY id DESC
    LIMIT 3
    `;
    return db.query(q);
};


module.exports.getProfilesMatch = (input) => {
    const q = `SELECT id, first, last, url_profile
    FROM profiles
    WHERE first ILIKE $1
    ORDER BY first DESC
    `;
    const params = [input + "%"];
    return db.query(q, params);
};

module.exports.getCurrentStatus = (receiverId, senderId) => {
    const q = `
    SELECT * FROM friendships 
    WHERE (receiver_id = $1 AND sender_id = $2)
    OR (receiver_id = $2 AND sender_id = $1);
    `;
    const params = [receiverId, senderId];
    return db.query(q, params);
};

module.exports.postFriendRequest = (senderId, receiverId) => {
    const q = ` INSERT INTO friendships (sender_id, receiver_id)
    VALUES ($1, $2)
    RETURNING *
    `;
    const params = [senderId, receiverId];
    return db.query(q, params);
};

module.exports.postEndFriendship = (senderId, receiverId) => {
    const q = ` DELETE FROM friendships
    WHERE (receiver_id = $1 AND sender_id = $2)
    OR (receiver_id = $2 AND sender_id = $1);
    `;
    const params = [senderId, receiverId];
    return db.query(q, params);
};

module.exports.postAddFriendship = (senderId, receiverId, accepted) => {
    const q = `UPDATE friendships SET accepted = $3
    WHERE (receiver_id = $1 AND sender_id = $2);
    `;
    const params = [senderId, receiverId, accepted];
    return db.query(q, params);
};

module.exports.getFriends = (userId) => {
    const q = `
    SELECT profiles.id, profiles.first, profiles.last, profiles.url_profile, friendships.accepted
    FROM friendships
    JOIN profiles
    ON (accepted = false AND receiver_id = $1 AND sender_id = profiles.id)
    OR (accepted = true AND receiver_id = $1 AND sender_id = profiles.id)
    OR (accepted = true AND sender_id = $1 AND receiver_id = profiles.id)
    `;
    const params = [userId];
    return db.query(q, params);
};


module.exports.postAcceptFriendList = (senderId, receiverId, accepted) => {
    const q = ` 
    UPDATE friendships SET accepted = $3
    WHERE ( sender_id = $1 AND receiver_id = $2);
    `;
    const params = [senderId, receiverId, accepted];
    return db.query(q, params);
};

module.exports.postDeckineFriendList = (senderId, receiverId) => {
    const q = ` DELETE FROM friendships
    WHERE (receiver_id = $1 AND sender_id = $2)
    OR (receiver_id = $2 AND sender_id = $1);
    `;
    const params = [senderId, receiverId];
    return db.query(q, params);
};

module.exports.postDeleteFriendship = (senderId, receiverId) => {
    const q = ` DELETE FROM friendships
    WHERE (receiver_id = $1 AND sender_id = $2)
    OR (receiver_id = $2 AND sender_id = $1);
    `;
    const params = [senderId, receiverId];
    return db.query(q, params);
};

module.exports.getLastTenMessages = () => {
    const q = `
    SELECT profiles.first, profiles.last, profiles.url_profile, profiles.id, chat.message, chat.id, chat.sender_id
    FROM chat
    JOIN profiles
    ON chat.sender_id = profiles.id
    ORDER BY 
    chat.created_at DESC
    LIMIT 10
    `;
    return db.query(q);
};

module.exports.postMessage = (newMsg, userId) => {
    const q = ` INSERT INTO chat (message, sender_id)
    VALUES ($1, $2)
    RETURNING *
    `;
    const params = [newMsg, userId];
    return db.query(q, params);
};

module.exports.selectMessageData = (senderId) => {
    const q = ` SELECT profiles.id, profiles.first, profiles.last, profiles.url_profile, chat.message, chat.id
    FROM chat
    JOIN profiles
    ON profiles.id = $1
    ORDER BY 
    chat.created_at DESC
    LIMIT 1;
    `;
    const params = [senderId];
    return db.query(q, params);
};

module.exports.postDeleteAccountProfile = (userId) => {
    const q = ` DELETE FROM profiles
    WHERE id = $1
    `;
    const params = [userId];
    return db.query(q, params);
};

module.exports.postDeleteAccountFriends = (userId) => {
    const q = ` DELETE FROM friendships
     WHERE (receiver_id =$1)
    OR (sender_id = $1);
    `;
    const params = [userId];
    return db.query(q, params);
};

module.exports.postDeleteAccountChat = (userId) => {
    const q = ` DELETE FROM chat
     WHERE 
    sender_id = $1
    `;
    const params = [userId];
    return db.query(q, params);
};


module.exports.sendSocketdata = (userId) => {
    const q = ` SELECT * FROM profiles
    WHERE id = $1
    `;
    const params = [userId];
    return db.query(q, params);
};

module.exports.sendOneSocketdata = (onlineId) => {
    const q = ` SELECT * FROM profiles
    WHERE id = ANY($1)
    `;
    const params = [onlineId];
    return db.query(q, params);
};

module.exports.getLastTenMessages = () => {
    const q = `
    SELECT profiles.first, profiles.last, profiles.url_profile, profiles.id, chat.message, chat.id, chat.sender_id
    FROM chat
    JOIN profiles
    ON chat.sender_id = profiles.id
    ORDER BY 
    chat.created_at DESC
    LIMIT 10
    `;
    return db.query(q);
};

module.exports.postPMessage = (newPMsg, userId) => {
    const q = ` INSERT INTO privateChat (message, sender_id)
    VALUES ($1, $2)
    RETURNING *
    `;
    const params = [newPMsg, userId];
    return db.query(q, params);
};

module.exports.selectPMessageData = (senderId) => {
    const q = ` SELECT profiles.id, profiles.first, profiles.last, profiles.url_profile, privateChat.message, privateChat.id
    FROM privateChat
    JOIN profiles
    ON profiles.id = $1
    ORDER BY 
    privateChat.created_at DESC
    LIMIT 1;
    `;
    const params = [senderId];
    return db.query(q, params);
};

