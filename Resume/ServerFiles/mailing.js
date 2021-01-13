const { env } = require('process');
const nodemailer = require("nodemailer");


const personalEmail = process.env.PERSONAL_MAIL;
const password = process.env.MAIL_PASSWORD;

function sendMail(contactForm) {

    var transporter = nodemailer.createTransport({
        service: "hotmail",
        auth: {
            user: personalEmail,
            pass: password
        }
    });

    var mailOptions = {
        from: '"New contact from CasaRol.site" <Alexander-Rol@hotmail.com>',
        to: personalEmail,
        subject: "New contact",
        text: JSON.stringify(contactForm)
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            return console.log(error);
        }

        console.log("Message sent: " + info.response);

    })

}

module.exports = { sendMail }