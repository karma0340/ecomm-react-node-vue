const nodemailer = require('nodemailer');

// Create nodemailer transporter from your SMTP .env config
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Controller for POST /api/contact
exports.sendContactMessage = async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "Name, email, and message are required." });
  }

  // Build email options
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: process.env.CONTACT_RECEIVER_EMAIL || process.env.SMTP_USER, // goes to support email, or your smtp user if unset
    subject: subject ? `Contact Form: ${subject}` : "Contact Form Message",
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      `Subject: ${subject || '(None)'}`,
      `Message:`,
      message
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif">
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Subject:</b> ${subject || "(None)"}</p>
        <p><b>Message:</b><br/>${message.replace(/\n/g, '<br/>')}</p>
      </div>
    `
  };

  // Try to send the email
  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    console.error("Contact email failed:", err);
    res.status(500).json({ success: false, message: "Failed to send message." });
  }
};
