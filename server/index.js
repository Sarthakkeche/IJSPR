// import express from "express";
// import cors from "cors";
// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// import mongoose from "mongoose";
// import multer from "multer";
// import slugify from "slugify";
// import path from "path";
// import { fileURLToPath } from "url";
// import AWS from "aws-sdk";

// // Setup __dirname for ES Module
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config();
// const app = express();
// const PORT = process.env.PORT || 5000;

// // ✅ CORS
// const corsOptions = {
//   origin: [
//     "https://ijrws.com",
//     "http://localhost:5174",
//     "https://ijrwsadmin.vercel.app"
//   ],
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// };
// app.use(cors(corsOptions));
// app.use(express.json());
// app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // still here (legacy)

// // ✅ MongoDB
// mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ijrws", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => console.log("✅ MongoDB connected"))
//   .catch(err => console.error("❌ MongoDB error:", err));

// // ✅ AWS S3

// const manuscriptUpload = multer({ storage: multer.memoryStorage() });
// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION || "ap-south-1"
// });

// // ✅ Schemas
// const volumeSchema = new mongoose.Schema({ name: String });
// const Volume = mongoose.model("Volume", volumeSchema);

// const issueSchema = new mongoose.Schema({
//   name: String,
//     volumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Volume", index: true } // Speeds up GET /api/issues/:volumeId
// });
// const Issue = mongoose.model("Issue", issueSchema);

// const paperSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   Author: { type: String },
//   Date: { type: String },
//   fileUrl: { type: String, required: true },
//    slug: { type: String, unique: true, index: true }, // unique already creates an index, but being explicit is fine
//     issueId: { type: mongoose.Schema.Types.ObjectId, ref: "Issue", required: true, index: true }, // Speeds up GET /api/papers/:issueId
//   uniqueCode: { type: String, index: true }
// }, { timestamps: true });
// paperSchema.index({ createdAt: -1 });
// const Paper = mongoose.model("Paper", paperSchema);

// const manuscriptSchema = new mongoose.Schema({
//   authorName: { type: String, required: true },
//   paperTitle: { type: String, required: true },
//   paperFile: { type: String, required: true },
//   uniqueCode: { type: String, required: true, unique: true }
// }, { timestamps: true });
// manuscriptSchema.index({ createdAt: -1 });
// const Manuscript = mongoose.model("Manuscript", manuscriptSchema);

// // ✅ Multer (memory for S3 uploads)
// const upload = multer({ storage: multer.memoryStorage() });

// // =================== ROUTES ===================

// // Volumes
// app.get("/api/volumes", async (req, res) => {
//   try {
//     const volumes = await Volume.find();
//     res.json(volumes);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });
// app.post("/api/volumes", async (req, res) => {
//   try {
//     const volume = new Volume({ name: req.body.name });
//     await volume.save();
//     res.json(volume);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to create volume" });
//   }
// });

// // Issues
// app.get("/api/issues/:volumeId", async (req, res) => {
//   const issues = await Issue.find({ volumeId: req.params.volumeId });
//   res.json(issues);
// });
// app.post("/api/issues/:volumeId", async (req, res) => {
//   const issue = new Issue({ name: req.body.name, volumeId: req.params.volumeId });
//   await issue.save();
//   res.json(issue);
// });
// app.get("/api/issues", async (req, res) => {
//   try {
//     const issues = await Issue.find();
//     res.json(issues);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });
// app.get("/api/issues/:issueId", async (req, res) => {
//   try {
//     const issue = await Issue.findById(req.params.issueId);
//     res.json(issue);
//   } catch (err) {
//     res.status(500).json({ message: "Issue not found" });
//   }
// });
// app.get("/api/issues/all", async (req, res) => {
//   try {
//     const issues = await Issue.find();
//     res.json(issues);
//   } catch (err) {
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// // Papers
// app.get("/api/papers/latest", async (req, res) => {
//  try {
//   const latestPapers = await Paper.find()
//         .sort({ createdAt: -1 })
//         .limit(10)
//         .select('title Author slug Date'); // Select only the fields you need to display in the list res.json(latestPapers);
//  } catch {
//     res.status(500).json({ message: "Error fetching latest papers" });
//   }
// });
// app.get("/api/papers/:issueId", async (req, res) => {
//   const papers = await Paper.find({ issueId: req.params.issueId });
//   res.json(papers);
// });
// app.post("/api/papers/:issueId", upload.single("file"), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: "❌ File required" });
//   }

//   const params = {
//     Bucket: process.env.S3_BUCKET,  // ✅ match with .env key
//     Key: `papers/${Date.now()}-${req.file.originalname}`,
//     Body: req.file.buffer,
//     ContentType: req.file.mimetype
//   };

//   try {
//     const data = await s3.upload(params).promise();
// const slug = slugify(req.body.title, { lower: true, strict: true });
//     const paper = new Paper({
//       title: req.body.title,
//       Author: req.body.Author,
//        slug,
//       Date: req.body.Date,
//       fileUrl: data.Location,       // ✅ S3 URL
//       issueId: req.params.issueId,
//       uniqueCode: req.body.uniqueCode
//     });

//     await paper.save();

//     res.json({
//       success: true,
//       message: "✅ Paper uploaded successfully",
//       paper,
//     });
//   } catch (err) {
//     console.error("❌ Paper upload error:", err); // ✅ log real error
//     res.status(500).json({ message: "Failed to upload file", error: err.message });
//   }
// });



// // Manuscripts
// app.post("/api/manuscripts/submit", manuscriptUpload.single("paperfile"), async (req, res) => {
//   try {
//     const { authorName, paperTitle } = req.body;

//     if (!req.file) {
//       return res.status(400).json({ success: false, message: "❌ No file received. Use field name 'paperfile'" });
//     }

//     const fileName = `manuscripts/${Date.now()}-${req.file.originalname}`;

//     const params = {
//       Bucket: process.env.S3_BUCKET,
//       Key: fileName,
//       Body: req.file.buffer,
//       ContentType: req.file.mimetype
//     };

//     const uploadResult = await s3.upload(params).promise();

//     // Generate unique tracking code
//     const uniqueCode = Math.random().toString(36).substring(2, 10).toUpperCase();

//     const manuscript = new Manuscript({
//       authorName,
//       paperTitle,
//       paperFile: uploadResult.Location,  // Public URL
//       uniqueCode,
//     });

//     await manuscript.save();

//     res.json({
//       success: true,
//       message: "✅ Manuscript submitted successfully",
//       uniqueCode,
//       fileUrl: uploadResult.Location,
//     });
//   } catch (error) {
//     console.error("❌ Manuscript submission error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });


// app.get("/api/papers/status/:code", async (req, res) => {
//   try {
//     const paper = await Paper.findOne({ uniqueCode: req.params.code });
//     if (paper) return res.json({ status: "Completed" });
//     return res.json({ status: "Pending", message: "Your paper has not been published yet." });
//   } catch {
//     res.status(500).json({ status: "Error", message: "Server error" });
//   }
// });

// app.get("/api/manuscripts/pending", async (req, res) => {
//   try {
//     const publishedCodes = (await Paper.find().distinct("uniqueCode")).map(c => c?.trim().toUpperCase());
//     const allManuscripts = await Manuscript.find().sort({ createdAt: -1 }).lean();
//     const pending = allManuscripts.filter(m => !publishedCodes.includes(m.uniqueCode?.trim().toUpperCase()));
//     res.json(pending);
//   } catch {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Mail
// app.post("/send", async (req, res) => {
//   const { name, email, message } = req.body;
//   try {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
//     });
//     await transporter.sendMail({
//       from: `"${name}" <${email}>`,
//       to: process.env.EMAIL_USER,
//       subject: `New message from ${name}`,
//       html: `<h3>Contact Form Submission</h3>
//         <p><strong>Name:</strong> ${name}</p>
//         <p><strong>Email:</strong> ${email}</p>
//         <p><strong>Message:</strong></p>
//         <p>${message}</p>`
//     });
//     res.status(200).json("Message sent!");
//   } catch (err) {
//     res.status(500).json("Failed to send message.");
//   }
// });
// app.get("/api/statistics", async (req, res) => {
//   try {
//     // 1. Total Issues
//     const totalIssues = await Issue.countDocuments();

//     // 2. Unique Authors
//     const papers = await Paper.find({}, "Author"); // fetch Author field
//     const authorsSet = new Set();

//     papers.forEach(paper => {
//       if (paper.Author) {
//         // if multiple authors stored in one string like "A, B, C"
//         paper.Author.split(",").forEach(author => {
//           authorsSet.add(author.trim());
//         });
//       }
//     });

//     const totalAuthors = authorsSet.size;

//     res.json({
//       totalIssues,
//       totalAuthors
//     });
//   } catch (err) {
//     console.error("❌ Error fetching statistics:", err);
//     res.status(500).json({ message: "Error fetching statistics" });
//   }
// });

// app.get("/api/sitemap.xml", async (req, res) => {
//   try {
//     const papers = await Paper.find({}, "slug updatedAt");
//     const baseUrl = "https://ijrws.com";

//     const staticUrls = [
//       { loc: `${baseUrl}/`, priority: 1.0 },
//       { loc: `${baseUrl}/about`, priority: 1.0 },
//       { loc: `${baseUrl}/contact`, priority: 0.8 },
//     ];

//     const staticUrlXml = staticUrls.map(url => `
//       <url>
//         <loc>${url.loc}</loc>
//         <lastmod>${new Date().toISOString()}</lastmod>
//         <changefreq>weekly</changefreq>
//         <priority>${url.priority}</priority>
//       </url>`).join("");

//     const paperUrlsXml = papers.map(p => `
//       <url>
//         <loc>${baseUrl}/paper/view/${p.slug}</loc>
//         <lastmod>${p.updatedAt.toISOString()}</lastmod>
//         <changefreq>monthly</changefreq>
//         <priority>0.8</priority>
//       </url>`).join("");

//     const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
//       <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
//         ${staticUrlXml}
//         ${paperUrlsXml}
//       </urlset>`;

//     res.header("Content-Type", "application/xml");
//     res.send(sitemap);
//   } catch (err) {
//     console.error("❌ Error generating sitemap:", err);
//     res.status(500).send("Error generating sitemap");
//   }
// });


// app.get("/api/papers/slug/:slug", async (req, res) => {
//   try {
//     const paper = await Paper.findOne({ slug: req.params.slug });
//     if (!paper) return res.status(404).json({ message: "Paper not found" });
//     res.json(paper);
//   } catch (err) {
//     console.error("Error fetching paper by slug:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });


// // =================== DELETE ROUTES (ADMIN) ===================

// // ✅ 1. Delete a single published Paper by its ID
// app.delete("/api/papers/:paperId", async (req, res) => {
//   try {
//     const { paperId } = req.params;
//     const deletedPaper = await Paper.findByIdAndDelete(paperId);

//     if (!deletedPaper) {
//       return res.status(404).json({ message: "Paper not found" });
//     }

//     // You might also want to delete the associated file from AWS S3 here (optional)

//     res.json({ success: true, message: "Paper deleted successfully" });
//   } catch (err) {
//     console.error("❌ Error deleting paper:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ✅ 2. Delete a single Issue by its ID (and all Papers within it)
// app.delete("/api/issues/:issueId", async (req, res) => {
//   try {
//     const { issueId } = req.params;

//     // First, find and delete all Papers associated with this Issue
//     await Paper.deleteMany({ issueId: issueId });

//     // Then, delete the Issue itself
//     const deletedIssue = await Issue.findByIdAndDelete(issueId);

//     if (!deletedIssue) {
//       return res.status(404).json({ message: "Issue not found" });
//     }

//     res.json({ success: true, message: "Issue and all its papers have been deleted" });
//   } catch (err) {
//     console.error("❌ Error deleting issue:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // ✅ 3. Delete a single Volume by its ID (and all Issues and Papers within it)
// app.delete("/api/volumes/:volumeId", async (req, res) => {
//   try {
//     const { volumeId } = req.params;

//     // Step 1: Find all Issues belonging to this Volume
//     const issuesToDelete = await Issue.find({ volumeId: volumeId }, '_id');
//     const issueIds = issuesToDelete.map(issue => issue._id);

//     // Step 2: Delete all Papers that belong to any of those Issues
//     if (issueIds.length > 0) {
//       await Paper.deleteMany({ issueId: { $in: issueIds } });
//     }

//     // Step 3: Delete all the Issues themselves
//     await Issue.deleteMany({ volumeId: volumeId });

//     // Step 4: Finally, delete the Volume
//     const deletedVolume = await Volume.findByIdAndDelete(volumeId);

//     if (!deletedVolume) {
//       return res.status(404).json({ message: "Volume not found" });
//     }

//     res.json({ success: true, message: "Volume and all its issues and papers have been deleted" });
//   } catch (err) {
//     console.error("❌ Error deleting volume:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });


// // ✅ 4. Delete a single pending Manuscript by its ID
// app.delete("/api/manuscripts/:manuscriptId", async (req, res) => {
//   try {
//     const { manuscriptId } = req.params;
//     const deletedManuscript = await Manuscript.findByIdAndDelete(manuscriptId);

//     if (!deletedManuscript) {
//       return res.status(404).json({ message: "Manuscript not found" });
//     }
    
//     // You might also want to delete the associated file from AWS S3 here (optional)

//     res.json({ success: true, message: "Manuscript deleted successfully" });
//   } catch (err) {
//     console.error("❌ Error deleting manuscript:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Root
// app.get("/", (req, res) => res.send("✅ IJRWS backend is running!"));

// // Start
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import mongoose from "mongoose";
import multer from "multer";
import slugify from "slugify";
import path from "path";
import { fileURLToPath } from "url";
import AWS from "aws-sdk";
import mcache from "memory-cache"; // <-- 1. Import memory-cache

// Setup __dirname for ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ... (your existing CORS, MongoDB, AWS S3 setup remains the same)
// ✅ CORS
const corsOptions = {
  origin: [
    "https://ijrws.com",
    "http://localhost:5174",
    "https://ijrwsadmin.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // still here (legacy)

// ✅ MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ijrws", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// ✅ AWS S3

const manuscriptUpload = multer({ storage: multer.memoryStorage() });
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "ap-south-1"
});


// ✅ Schemas
const volumeSchema = new mongoose.Schema({ name: String });
const Volume = mongoose.model("Volume", volumeSchema);

const issueSchema = new mongoose.Schema({
  name: String,
    volumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Volume", index: true } // Speeds up GET /api/issues/:volumeId
});
const Issue = mongoose.model("Issue", issueSchema);

const paperSchema = new mongoose.Schema({
  title: { type: String, required: true },
  Author: { type: String },
  Date: { type: String },
  fileUrl: { type: String, required: true },
   slug: { type: String, unique: true, index: true }, // unique already creates an index, but being explicit is fine
    issueId: { type: mongoose.Schema.Types.ObjectId, ref: "Issue", required: true, index: true }, // Speeds up GET /api/papers/:issueId
  uniqueCode: { type: String, index: true }
}, { timestamps: true });
paperSchema.index({ createdAt: -1 });
const Paper = mongoose.model("Paper", paperSchema);

const manuscriptSchema = new mongoose.Schema({
  authorName: { type: String, required: true },
  paperTitle: { type: String, required: true },
  paperFile: { type: String, required: true },
  uniqueCode: { type: String, required: true, unique: true }
}, { timestamps: true });
manuscriptSchema.index({ createdAt: -1 });
const Manuscript = mongoose.model("Manuscript", manuscriptSchema);

// ✅ Multer (memory for S3 uploads)
const upload = multer({ storage: multer.memoryStorage() });


// --- 2. Caching Middleware ---
const cache = (duration) => {
  return (req, res, next) => {
    let key = '__express__' + req.originalUrl || req.url;
    let cachedBody = mcache.get(key);
    if (cachedBody) {
      res.send(cachedBody);
      return;
    } else {
      res.sendResponse = res.send;
      res.send = (body) => {
        mcache.put(key, body, duration * 1000); // duration is in seconds
        res.sendResponse(body);
      };
      next();
    }
  };
};

// =================== ROUTES ===================

// Volumes
// --- 3. Apply cache for 10 minutes ---
app.get("/api/volumes", cache(600), async (req, res) => {
  try {
    const volumes = await Volume.find();
    res.json(volumes);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/volumes", async (req, res) => {
  try {
    mcache.clear(); // Clear cache when new data is added
    const volume = new Volume({ name: req.body.name });
    await volume.save();
    res.json(volume);
  } catch (err) {
    res.status(500).json({ message: "Failed to create volume" });
  }
});

// Issues
app.get("/api/issues/:volumeId", async (req, res) => {
  const issues = await Issue.find({ volumeId: req.params.volumeId });
  res.json(issues);
});

app.post("/api/issues/:volumeId", async (req, res) => {
  mcache.clear(); // Clear cache
  const issue = new Issue({ name: req.body.name, volumeId: req.params.volumeId });
  await issue.save();
  res.json(issue);
});

app.get("/api/issues", async (req, res) => {
  try {
    const issues = await Issue.find();
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/issues/:issueId", async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.issueId);
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: "Issue not found" });
  }
});

app.get("/api/issues/all", async (req, res) => {
  try {
    const issues = await Issue.find();
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Papers
// --- 3. Apply cache for 5 minutes ---
app.get("/api/papers/latest", cache(300), async (req, res) => {
 try {
  const latestPapers = await Paper.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title Author slug Date');
   res.json(latestPapers);
 } catch (err) { // Added err parameter
    res.status(500).json({ message: "Error fetching latest papers" });
  }
});

app.get("/api/papers/:issueId", async (req, res) => {
  const papers = await Paper.find({ issueId: req.params.issueId });
  res.json(papers);
});

app.post("/api/papers/:issueId", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "❌ File required" });
  }

  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: `papers/${Date.now()}-${req.file.originalname}`,
    Body: req.file.buffer,
    ContentType: req.file.mimetype
  };

  try {
    mcache.clear(); // Clear cache when a new paper is published
    const data = await s3.upload(params).promise();
    const slug = slugify(req.body.title, { lower: true, strict: true });
    const paper = new Paper({
      title: req.body.title,
      Author: req.body.Author,
       slug,
      Date: req.body.Date,
      fileUrl: data.Location,
      issueId: req.params.issueId,
      uniqueCode: req.body.uniqueCode
    });

    await paper.save();

    res.json({
      success: true,
      message: "✅ Paper uploaded successfully",
      paper,
    });
  } catch (err) {
    console.error("❌ Paper upload error:", err);
    res.status(500).json({ message: "Failed to upload file", error: err.message });
  }
});

// ... (Your other routes like manuscript submission, status check, etc. remain the same)
// Manuscripts
app.post("/api/manuscripts/submit", manuscriptUpload.single("paperfile"), async (req, res) => {
  try {
    const { authorName, paperTitle } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "❌ No file received. Use field name 'paperfile'" });
    }

    const fileName = `manuscripts/${Date.now()}-${req.file.originalname}`;

    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };

    const uploadResult = await s3.upload(params).promise();

    // Generate unique tracking code
    const uniqueCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const manuscript = new Manuscript({
      authorName,
      paperTitle,
      paperFile: uploadResult.Location,  // Public URL
      uniqueCode,
    });

    await manuscript.save();

    res.json({
      success: true,
      message: "✅ Manuscript submitted successfully",
      uniqueCode,
      fileUrl: uploadResult.Location,
    });
  } catch (error) {
    console.error("❌ Manuscript submission error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


app.get("/api/papers/status/:code", async (req, res) => {
  try {
    const paper = await Paper.findOne({ uniqueCode: req.params.code });
    if (paper) return res.json({ status: "Completed" });
    return res.json({ status: "Pending", message: "Your paper has not been published yet." });
  } catch {
    res.status(500).json({ status: "Error", message: "Server error" });
  }
});

app.get("/api/manuscripts/pending", async (req, res) => {
  try {
    const publishedCodes = (await Paper.find().distinct("uniqueCode")).map(c => c?.trim().toUpperCase());
    const allManuscripts = await Manuscript.find().sort({ createdAt: -1 }).lean();
    const pending = allManuscripts.filter(m => !publishedCodes.includes(m.uniqueCode?.trim().toUpperCase()));
    res.json(pending);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// Mail
app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_USER,
      subject: `New message from ${name}`,
      html: `<h3>Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>`
    });
    res.status(200).json("Message sent!");
  } catch (err) {
    res.status(500).json("Failed to send message.");
  }
});
app.get("/api/statistics", async (req, res) => {
  try {
    // 1. Total Issues
    const totalIssues = await Issue.countDocuments();

    // 2. Unique Authors
    const papers = await Paper.find({}, "Author"); // fetch Author field
    const authorsSet = new Set();

    papers.forEach(paper => {
      if (paper.Author) {
        // if multiple authors stored in one string like "A, B, C"
        paper.Author.split(",").forEach(author => {
          authorsSet.add(author.trim());
        });
      }
    });

    const totalAuthors = authorsSet.size;

    res.json({
      totalIssues,
      totalAuthors
    });
  } catch (err) {
    console.error("❌ Error fetching statistics:", err);
    res.status(500).json({ message: "Error fetching statistics" });
  }
});

// --- 3. Apply cache for 1 hour ---
app.get("/api/sitemap.xml", cache(3600), async (req, res) => {
  try {
    const papers = await Paper.find({}, "slug updatedAt");
    const baseUrl = "https://ijrws.com";

    const staticUrls = [
      { loc: `${baseUrl}/`, priority: 1.0 },
      { loc: `${baseUrl}/about`, priority: 1.0 },
      { loc: `${baseUrl}/contact`, priority: 0.8 },
    ];

    const staticUrlXml = staticUrls.map(url => `
      <url>
        <loc>${url.loc}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>${url.priority}</priority>
      </url>`).join("");

    const paperUrlsXml = papers.map(p => `
      <url>
        <loc>${baseUrl}/paper/view/${p.slug}</loc>
        <lastmod>${p.updatedAt.toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
      </url>`).join("");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${staticUrlXml}
        ${paperUrlsXml}
      </urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(sitemap);
  } catch (err) {
    console.error("❌ Error generating sitemap:", err);
    res.status(500).send("Error generating sitemap");
  }
});


app.get("/api/papers/slug/:slug", async (req, res) => {
  try {
    const paper = await Paper.findOne({ slug: req.params.slug });
    if (!paper) return res.status(404).json({ message: "Paper not found" });
    res.json(paper);
  } catch (err) {
    console.error("Error fetching paper by slug:", err);
 res.status(500).json({ message: "Server error" });
 }
});

// ... (Your DELETE routes and other routes remain the same)
// =================== DELETE ROUTES (ADMIN) ===================

// ✅ 1. Delete a single published Paper by its ID
app.delete("/api/papers/:paperId", async (req, res) => {
  try {
    mcache.clear(); // Clear cache
    const { paperId } = req.params;
    const deletedPaper = await Paper.findByIdAndDelete(paperId);

    if (!deletedPaper) {
      return res.status(404).json({ message: "Paper not found" });
    }
    res.json({ success: true, message: "Paper deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting paper:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ 2. Delete a single Issue by its ID (and all Papers within it)
app.delete("/api/issues/:issueId", async (req, res) => {
  try {
    mcache.clear(); // Clear cache
    const { issueId } = req.params;
    await Paper.deleteMany({ issueId: issueId });
    const deletedIssue = await Issue.findByIdAndDelete(issueId);

    if (!deletedIssue) {
      return res.status(404).json({ message: "Issue not found" });
    }
    res.json({ success: true, message: "Issue and all its papers have been deleted" });
  } catch (err) {
    console.error("❌ Error deleting issue:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ 3. Delete a single Volume by its ID (and all Issues and Papers within it)
app.delete("/api/volumes/:volumeId", async (req, res) => {
  try {
    mcache.clear(); // Clear cache
    const { volumeId } = req.params;
    const issuesToDelete = await Issue.find({ volumeId: volumeId }, '_id');
    const issueIds = issuesToDelete.map(issue => issue._id);
    if (issueIds.length > 0) {
      await Paper.deleteMany({ issueId: { $in: issueIds } });
    }
    await Issue.deleteMany({ volumeId: volumeId });
    const deletedVolume = await Volume.findByIdAndDelete(volumeId);

    if (!deletedVolume) {
      return res.status(404).json({ message: "Volume not found" });
    }
    res.json({ success: true, message: "Volume and all its issues and papers have been deleted" });
  } catch (err) {
    console.error("❌ Error deleting volume:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ 4. Delete a single pending Manuscript by its ID
app.delete("/api/manuscripts/:manuscriptId", async (req, res) => {
  try {
    const { manuscriptId } = req.params;
    const deletedManuscript = await Manuscript.findByIdAndDelete(manuscriptId);

    if (!deletedManuscript) {
      return res.status(404).json({ message: "Manuscript not found" });
    }
    res.json({ success: true, message: "Manuscript deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting manuscript:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Root
app.get("/", (req, res) => res.send("✅ IJRWS backend is running!"));

// Start
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));