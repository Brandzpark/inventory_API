const nodemailer = require("nodemailer");
const { mail } = require('../../config')

const { getTemplate } = require('./EmailTemplateEngineService')
const EmailLogService = require('./EmailLogService')

const transporter = nodemailer.createTransport({
    host: mail.host,
    port: mail.port,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: mail.user,
        pass: mail.password,
    },
});


async function sendEmail({ sendTo, subject, source, data }) {
    const template = await getTemplate({ source, data })

    transporter.sendMail({
        from: `${mail.fromName} <${mail.fromAddress}>`,
        to: sendTo,
        subject: subject,
        html: template
    }).then(response => {
        EmailLogService.createLog({
            email: sendTo,
            template,
            subject,
            response,
            isSuccess: true
        })
    })
        .catch(error => {
            EmailLogService.createLog({
                email: sendTo,
                template,
                subject,
                response: error,
                isSuccess: false
            })
        })
}

module.exports = {
    sendEmail
}