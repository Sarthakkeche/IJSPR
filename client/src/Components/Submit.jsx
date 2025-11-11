import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import paperImg from "../assets/paper.jpg";
import uploadBg from "../assets/uplaod.jpg";

// ===== ENV =====
const OJS_API_URL =
  import.meta.env.VITE_OJS_API_URL || import.meta.env.VITE_API_URL;
const OJS_API_KEY = import.meta.env.VITE_OJS_API_KEY;
const OJS_SECTION_ID = Number(import.meta.env.VITE_OJS_SECTION_ID ?? 1);
const OJS_AUTHOR_GROUP_ID = Number(
  import.meta.env.VITE_OJS_AUTHOR_GROUP_ID ?? 14
);

// File stage constants used by OJS internally
const FILE_STAGE_MAP = {
  SUBMISSION_FILE: 2, // safest default for manuscript upload
};

const SubmitManuscriptPage = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const [form, setForm] = useState({ paperTitle: "", abstract: "" });
  const [authors, setAuthors] = useState([{ name: "", email: "" }]);
  const [paperFile, setPaperFile] = useState(null);
  const [uniqueCode, setUniqueCode] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleAuthorChange = (index, e) => {
    const updated = [...authors];
    updated[index][e.target.name] = e.target.value;
    setAuthors(updated);
  };

  const addAuthor = () => setAuthors((arr) => [...arr, { name: "", email: "" }]);
  const removeAuthor = (index) => {
    if (authors.length > 1) setAuthors((arr) => arr.filter((_, i) => i !== index));
  };
  const handleFileChange = (e) => setPaperFile(e.target.files[0]);

  const parseOjsError = (err) => {
    if (err?.response?.data) {
      const d = err.response.data;
      if (typeof d === "string") return d;
      if (d.errorMessage) return d.errorMessage;
      if (d.error?.message) return d.error.message;
      if (d.message) return d.message;
      const k = Object.keys(d)[0];
      if (k && Array.isArray(d[k]) && d[k][0]) return `${k}: ${d[k][0]}`;
      try {
        return JSON.stringify(d);
      } catch {
        return "Unknown server error";
      }
    }
    return err?.message || "Unknown error";
  };

  // Build the submission JSON payload OJS expects
  const buildSubmissionData = () => ({
    locale: "en_US",
    sectionId: OJS_SECTION_ID,
    title: { en_US: form.paperTitle.trim() },
    abstract: { en_US: form.abstract.trim() },
    authors: authors.map((a, i) => ({
      givenName: { en_US: a.name.trim() },
      email: a.email.trim(),
      country: "IN",
      userGroupId: OJS_AUTHOR_GROUP_ID, // “Author” group id
      primaryContact: i === 0,
    })),
  });

  // Upload file once; send both fileStageId (numeric) and fileStage (string)
  // Include a genreId (1 = Article Text on most installs). Auto-retry with 2 if needed.
  const uploadManuscript = async (submissionId) => {
    const tryUpload = async (genreId) => {
      const fd = new FormData();
      fd.append("file", paperFile, paperFile.name);
      fd.append("name", paperFile.name);
      fd.append("fileStageId", String(FILE_STAGE_MAP.SUBMISSION_FILE)); // numeric
      fd.append("fileStage", "SUBMISSION_FILE"); // string (covers both expectations)
      fd.append("genreId", String(genreId)); // “Article Text” is commonly 1

      const res = await axios.post(
        `${OJS_API_URL}/submissions/${submissionId}/files`,
        fd,
        {
          headers: {
            Authorization: `Bearer ${OJS_API_KEY}`,
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
        }
      );
      return res;
    };

    try {
      return await tryUpload(1);
    } catch (err) {
      // If server complains about genre or stage, try a second common genre id
      const msg = parseOjsError(err) || "";
      if (
        /genre/i.test(msg) ||
        /noGenre/i.test(msg) ||
        /file stage/i.test(msg) ||
        /noFileStage/i.test(msg)
      ) {
        return await tryUpload(2);
      }
      throw err;
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (isSubmitting) return;

  if (!OJS_API_URL || !OJS_API_KEY) {
    setStatus("❌ Missing OJS API configuration.");
    return;
  }
  if (!paperFile) {
    setStatus("❌ Please select a file.");
    return;
  }

  setIsSubmitting(true);
  setStatus("Submitting... please wait.");

  try {
    // Step 1: Create submission
    setStatus("Step 1/2: Creating submission...");
    const submissionData = {
      locale: "en_US",
      sectionId: OJS_SECTION_ID,
      title: { en_US: form.paperTitle.trim() },
      abstract: { en_US: form.abstract.trim() },
      authors: authors.map((a, i) => ({
        givenName: { en_US: a.name.trim() },
        email: a.email.trim(),
        country: "IN",
        userGroupId: OJS_AUTHOR_GROUP_ID,
        primaryContact: i === 0,
      })),
    };

    const submissionResponse = await axios.post(
      `${OJS_API_URL}/submissions`,
      submissionData,
      {
        headers: {
          Authorization: `Bearer ${OJS_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const submissionId = submissionResponse.data.id;
    console.log("✅ Submission created:", submissionId);

    // Step 2: Upload file
    setStatus("Step 2/2: Uploading manuscript file...");

    const fileData = new FormData();
    fileData.append("file", paperFile, paperFile.name);
    fileData.append("name", paperFile.name);
    fileData.append("genreId", "1"); // usually required
    fileData.append("mimetype", paperFile.type || "application/octet-stream");

    const uploadUrl = `${OJS_API_URL}/submissions/${submissionId}/files?fileStage=SUBMISSION_FILE`;

    const uploadResponse = await axios.post(uploadUrl, fileData, {
      headers: {
        "X-Api-Key": OJS_API_KEY,
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    });

    console.log("✅ File uploaded successfully:", uploadResponse.data);

    setUniqueCode(submissionId);
    setStatus("✅ Paper submitted successfully!");

    // Reset form
    setForm({ paperTitle: "", abstract: "" });
    setAuthors([{ name: "", email: "" }]);
    setPaperFile(null);
    e.target.reset();
  } catch (error) {
    console.error("❌ Submission failed:", error.response?.data || error.message);
    const msg =
      error.response?.data?.errorMessage ||
      error.response?.data?.message ||
      error.message;
    setStatus(`❌ Failed: ${msg}`);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 text-gray-800">
      <Navbar />

      {/* Hero */}
      <section
        className="relative bg-blue-900 mt-33 text-white py-20 px-4 md:px-20 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(14, 12, 12, 0.85), rgba(36, 33, 33, 0.85)), url(${uploadBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold">
            Submit Your <span className="text-orange-400">Manuscript</span>
          </h1>
          <p className="mt-4 text-lg max-w-2xl mx-auto">
            Upload your research paper and get a unique tracking code to check its status anytime.
          </p>
        </div>
      </section>

      {/* Info */}
      <section className="px-6 md:px-20 py-10">
        <div className="relative bg-white text-gray-800 p-6 rounded-xl shadow-lg border-4">
          <h2 className="text-xl font-bold text-red-600 mb-3">
            ⚠️ Important Submission Guidelines
          </h2>
          <p className="mb-4">
            Use the official <b>IJRWS</b> template. Submissions not following the format will be{" "}
            <span className="font-bold text-red-600">rejected</span>.
          </p>
          <a
            href="/IJRWS_Template.docx"
            download
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-purple-700 transition"
          >
            ⬇️ Download Template
          </a>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 bg-white px-6 md:px-20">
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <h2 className="text-3xl font-bold text-blue-800">Upload Manuscript</h2>

            {/* Title */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-600">
                Paper Title
              </label>
              <input
                type="text"
                name="paperTitle"
                value={form.paperTitle}
                onChange={handleChange}
                placeholder="Enter paper title"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Authors */}
            <div className="space-y-4 rounded-lg border border-gray-300 p-4">
              <label className="block text-lg font-semibold text-gray-700">
                Authors
              </label>
              {authors.map((author, index) => (
                <div key={index} className="p-2 border rounded-md relative">
                  <p className="font-medium text-sm text-gray-500 mb-2">
                    Author #{index + 1} {index === 0 && "(Primary Contact)"}
                  </p>
                  <div className="mb-2">
                    <label className="block mb-1 text-xs font-semibold text-gray-600">
                      Author Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={author.name}
                      onChange={(e) => handleAuthorChange(index, e)}
                      placeholder="Enter full name"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-semibold text-gray-600">
                      Author Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={author.email}
                      onChange={(e) => handleAuthorChange(index, e)}
                      placeholder="Enter author's email"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                      required
                    />
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeAuthor(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addAuthor}
                className="w-full mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
              >
                + Add Another Author
              </button>
            </div>

            {/* Abstract */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-600">
                Abstract
              </label>
              <textarea
                name="abstract"
                value={form.abstract}
                onChange={handleChange}
                placeholder="Paste your paper's abstract here"
                rows="5"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* File */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-600">
                Upload Paper (PDF or .docx)
              </label>
              <input
                type="file"
                name="paperFile"
                onChange={handleFileChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`w-full text-white px-6 py-3 rounded-lg transition font-semibold ${
                isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Paper"}
            </button>

            <p className="text-sm text-gray-600 mt-2">{status}</p>

            {uniqueCode && (
              <p className="mt-4 text-green-700 font-semibold">
                🎉 Your tracking code is:{" "}
                <span className="text-blue-800">{uniqueCode}</span>
                <br />
                <span className="text-gray-700 text-sm">
                  Please copy this — it’s your official Submission ID for tracking your paper.
                </span>
              </p>
            )}
          </form>

          <img
            src={paperImg}
            alt="Upload Illustration"
            className="w-full max-w-md mx-auto"
          />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SubmitManuscriptPage;
