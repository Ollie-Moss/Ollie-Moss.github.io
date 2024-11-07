const { onCall } = require('firebase-functions/https')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
})
exports.sendEmail = onCall((request) => {
    const mailOptions = {
        from: request.data.email,
        to: process.env.EMAIL,
        subject: `Portfolio Email - ${request.data.name}`,
        text: request.data.message,
    }
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error)
            res.send('Error sending email')
        } else {
            console.log('Email sent: ' + info.response)
            res.send('Email sent successfully')
        }
    })
})
