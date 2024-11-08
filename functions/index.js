const { onRequest } = require('firebase-functions/https')
const nodemailer = require('nodemailer')
const express = require('express')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
})

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/', (req, res) => {
    const mailOptions = {
        from: req.body.email,
        to: process.env.EMAIL,
        subject: `Portfolio Email - ${req.body.name}`,
        text: req.body.message,
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email: ' + error.message)
            res.send('Failed to send email')
        } else {
            console.log('Email sent: ' + info.response)
            res.send('Email sent successfully')
        }
    })
})

exports.sendEmail = onRequest(
    { cors: [/portfolio-225f1\.web\.app$/, /portfolio\-225f1\.firebaseapp\.com/], timeoutSeconds: 10 },
    app
)
