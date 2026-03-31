const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

console.log('Testing email transport for:', process.env.EMAIL_USER);
console.log('Using pass (last 4):', process.env.EMAIL_PASS.slice(-4));

const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'kandekedonald@gmail.com',
    subject: 'Test KasS Suite',
    text: 'This is a test email.'
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.log('Error occurred:', error.message);
        process.exit(1);
    } else {
        console.log('Email sent successfully!');
        console.log('Response:', info.response);
        process.exit(0);
    }
});
