import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "https://ijspr-sarthakkeches-projects.vercel.app"
];
app.use(cors({
  origin: "*", // allow any frontend
  methods: ["GET", "POST"],
  credentials: true
}));
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());


// ⚡ Allow all origins (CORS for deployment)



dotenv.config();
// POST route to send mail
app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Transporter configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,      // ✅ Environment variable for your Gmail
        pass: process.env.EMAIL_PASS,      // ✅ Environment variable for your app password
      },
    });

    // Email details
    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_USER, // ✅ Receiver email (your Gmail)
      subject: `New message from ${name}`,
      html: `
        <h3>Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    // Send mail
    await transporter.sendMail(mailOptions);

    res.status(200).json("Your message has been sent successfully!");
  } catch (error) {
    console.error("❌ Error sending mail:", error);
    res.status(500).json("Failed to send message. Please try again later.");
  }
});

// Root route for testing
app.get("/", (req, res) => {
  res.send("✅ Mail server is running!");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
