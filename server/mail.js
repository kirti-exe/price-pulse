import nodemailer from "nodemailer"

let transporter = null

async function getTransporter() {
    if(transporter) return transporter

    if(process.env.SMTP_HOST) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        })
    }else{
        const account = await nodemailer.createTestAccount()
        transporter = nodemailer.createTransport({
            host: account.smtp.host,
            port: account.smtp.port,
            secure: account.smtp.secure,
            auth: { user: account.user, pass: account.pass },
        })
        console.log("No SMTP settings found: using Ethereal test mailbox (emails are not really delivered)")
    }

    return transporter
}

export async function sendMail({ to, subject, text }){
    const t = await getTransporter()

    const info = await t.sendMail({
        from: process.env.MAIL_FROM || '"Price Pulse" <alert@pricepulse.local>',
        to, 
        subject,
        text,
    })

    const previewUrl = nodemailer.getTestMessageUrl(info)
    if(previewUrl) console.log("Preview email:", previewUrl)
}