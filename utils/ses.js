const aws = require("aws-sdk");

let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require("./secrets"); // in dev they are in secrets.json which is listed in .gitignore
}

const ses = new aws.SES({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET,
    region: "eu-west-1"
});

const createEmail = (to, subject, message) => ({

    Source: "Edith <edith.chevallier3000@gmail.com>",
    Destination: {
        ToAddresses: [to]
    },
    Message: {
        Body: {
            Text: {
                Data: message
            }
        },
        Subject: {
            Data: subject
        }
    }
});

exports.sendEmail = function (to, subject, message) {
    return ses
        .sendEmail(createEmail(to, subject, message)).promise()
        .catch(err => console.error(err));
};