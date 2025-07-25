import nodemailer from 'nodemailer';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const router = express.Router();

router.post('/send-email', async (req, res) => {
  const { user_name, user_email, user_message } = req.body;

  if (!user_name || !user_email || !user_message) {
    return res.status(400).send({ error: "Missing required fields." });
  }

  try {
    console.log("GMAIL_USER:", process.env.GMAIL_USER);
    console.log("GMAIL_PASS:", process.env.GMAIL_PASS ? "exists" : "missing");
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const mailOptions = {
      from: user_email,
      to: 'shanebasham28@gmail.com',
      subject: `New message from ${user_name}`,
      text: user_message
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send({ success: "Email sent successfully!" });
  } catch (err) {
    console.error("Email failed:", err);
    res.status(500).send({ error: "Failed to send email." });
  }
});

export default router;
