
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Setup __dirname for ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"], credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Static file serving

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ijrws", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// ✅ Schemas
const volumeSchema = new mongoose.Schema({ name: String });
const Volume = mongoose.model("Volume", volumeSchema);

const issueSchema = new mongoose.Schema({
  name: String,
  volumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Volume" }
});
const Issue = mongoose.model("Issue", issueSchema);

const paperSchema = new mongoose.Schema({
  title: { type: String, required: true },
  Author: { type: String }, // ✅ Include Author field
  Date: { type: String },   // ✅ Include Date field
  fileUrl: { type: String, required: true },
  issueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', required: true },
 uniqueCode: { type: String, index: true } // keep non-unique in case of legacy data
}, { timestamps: true });
const Paper = mongoose.model("Paper", paperSchema);

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext;
    cb(null, filename);
  }
});
const upload = multer({ storage });

// ✅ API Routes

// Volume routes
app.get("/api/volumes", async (req, res) => {
  try {
    const volumes = await Volume.find();
    res.json(volumes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create volume
app.post("/api/volumes", async (req, res) => {
  try {
    const volume = new Volume({ name: req.body.name });
    await volume.save();
    res.json(volume);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create volume" });
  }
});
// Add this in your backend
app.get('/api/papers/latest', async (req, res) => {
  try {
    const latestPapers = await Paper.find().sort({ createdAt: -1 }).limit(10);
    res.json(latestPapers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching latest papers" });
  }
});

// Issue routes
app.get("/api/issues/:volumeId", async (req, res) => {
  const issues = await Issue.find({ volumeId: req.params.volumeId });
  res.json(issues);
});
app.post("/api/issues/:volumeId", async (req, res) => {
  const issue = new Issue({ name: req.body.name, volumeId: req.params.volumeId });
  await issue.save();
  res.json(issue);
});

// Paper routes
app.get("/api/papers/:issueId", async (req, res) => {
  const papers = await Paper.find({ issueId: req.params.issueId });
  res.json(papers);
});
app.post("/api/papers/:issueId", upload.single('file'), async (req, res) => {
  const paper = new Paper({
    title: req.body.title,
    Author:req.body.Author,
    Date:req.body.Date,
    fileUrl: `/uploads/${req.file.filename}`,
    issueId: req.params.issueId,
     uniqueCode: req.body.uniqueCode
  });
  await paper.save();
  res.json(paper);
});
// ✅ Add this route to get all issues
app.get("/api/issues", async (req, res) => {
  try {
    const issues = await Issue.find();
    res.json(issues);
  } catch (err) {
    console.error("Failed to fetch issues:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Get single issue by ID
app.get("/api/issues/:issueId", async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.issueId);
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: "Issue not found" });
  }
});

// Get all issues
app.get("/api/issues/all", async (req, res) => {
  try {
    const issues = await Issue.find();
    res.json(issues);
  } catch (err) {
    console.error("Error fetching all issues:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Existing mail route
app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_USER,
      subject: `New message from ${name}`,
      html: `
        <h3>Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json("Your message has been sent successfully!");
  } catch (error) {
    console.error("❌ Error sending mail:", error);
    res.status(500).json("Failed to send message. Please try again later.");
  }
});

// ✅ Root route
app.get("/", (req, res) => {
  res.send("✅ IJRWS backend is running!");
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


///////status and the submit backend


// =================== Manuscript Submission Schema ===================
const manuscriptSchema = new mongoose.Schema({
  authorName: { type: String, required: true },
  paperTitle: { type: String, required: true },
  paperFile: { type: String, required: true }, // file path
  uniqueCode: { type: String, required: true, unique: true }
}, { timestamps: true });

const Manuscript = mongoose.model("Manuscript", manuscriptSchema);

// =================== Multer for Manuscripts ===================
const manuscriptStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext;
    cb(null, filename);
  }
});
const manuscriptUpload = multer({ storage: manuscriptStorage });
app.use("/uploads", express.static("uploads"));

// =================== Routes ===================

// Submit Manuscript
app.post("/api/manuscripts/submit", manuscriptUpload.single("paperfile"), async (req, res) => {
  try {
    const { authorName, paperTitle } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Paper file is required" });
    }

    // Generate unique tracking code
    const uniqueCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const manuscript = new Manuscript({
      authorName,
      paperTitle,
      paperFile: `/uploads/${req.file.filename}`,
      uniqueCode
    });

    await manuscript.save();

    res.json({
      success: true,
      message: "✅ Manuscript submitted successfully",
      uniqueCode
    });
  } catch (error) {
    console.error("❌ Manuscript submission error:", error);
    res.status(500).json({ success: false, message: "Failed to submit manuscript" });
  }
});

// Check Manuscript Status
app.get("/api/papers/status/:code", async (req, res) => {
  try {
    const paper = await Paper.findOne({ uniqueCode: req.params.code })
    
    if (paper) {
      return res.json({
        status: "Completed",
        
      });
    }

    // Not published under Papers yet → Pending
    return res.json({
      status: "Pending",
      message: "Your paper has not been published yet."
    });
  } catch (error) {
    console.error("❌ Status check error:", error);
    res.status(500).json({ status: "Error", message: "Server error" });
  }
});

// Get all Manuscripts (for Admin Panel)
// ======= ALL manuscripts (unchanged) =======
// GET pending manuscripts (all fields returned)
app.get("/api/manuscripts/pending", async (req, res) => {
  try {
    // 1) get published codes and normalize
    const publishedRaw = await Paper.find().distinct("uniqueCode");
    const publishedCodes = publishedRaw
      .filter(Boolean)
      .map((c) => (typeof c === "string" ? c.trim().toUpperCase() : c));

    // 2) fetch all manuscripts (all fields)
    const allManuscripts = await Manuscript.find().sort({ createdAt: -1 }).lean();

    // 3) filter out ones already published (normalize manuscript codes too)
    const pending = allManuscripts.filter((m) => {
      const code = (m.uniqueCode || "").toString().trim().toUpperCase();
      return !publishedCodes.includes(code);
    });

    return res.json(pending);
  } catch (err) {
    console.error("❌ Fetch pending manuscripts error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});
