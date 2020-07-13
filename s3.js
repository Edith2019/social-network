const aws = require("aws-sdk");
const fs = require("fs");

let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require("./utils/secrets"); // in dev they are in secrets.json which is listed in .gitignore
}
const s3 = new aws.S3({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET
});

exports.upload = function (req, res, next) {
    if (!req.file) {
        req.sendStatus(500);
        return;
    }
    const { filename, mimetype, size, path } = req.file;
    s3.putObject({
        Bucket: "vegetaimagebucket",
        ACL: "public-read",
        Key: filename,
        Body: fs.createReadStream(path),
        ContentType: mimetype,
        ContentLength: size
    }).promise().then(() => { next();
        fs.unlink(path, () => { });
    }).catch(err => {
        console.error("error in s3", err);
        res.sendStatus(500);
    });
};

exports.deleteAWS = (req, res, next) => {
    let objectKey;
    if (req.body.url.includes("https://s3.amazonaws.com/vegetaimagebucket/")) {
        objectKey = req.body.url.replace("https://s3.amazonaws.com/vegetaimagebucket/", "");
    }
    const params = {
        Bucket: "vegetaimagebucket",
        Key: objectKey
    };
    const promise = s3
        .deleteObject(params)
        .promise();
    promise.then(() => {
        next();
    })
        .catch(err => {
            console.error("Error in deleteObject (S3)", err);
            res.sendStatus(500);
        });
};