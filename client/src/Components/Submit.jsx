import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import axios from "axios";
import paperImg from "../assets/paper.jpg";
import uploadBg from "../assets/uplaod.jpg";

const OJS_API_URL = import.meta.env.VITE_OJS_API_URL;
const OJS_API_KEY = import.meta.env.VITE_OJS_API_KEY;

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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAuthorChange = (index, e) => {
    setAuthors((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [e.target.name]: e.target.value } : a))
    );
  };

  const addAuthor = () => setAuthors((prev) => [...prev, { name: "", email: "" }]);
  const removeAuthor = (index) => {
    if (authors.length <= 1) return;
    setAuthors((prev) => prev.filter((_, i) => i !== index));
  };
  const handleFileChange = (e) => setPaperFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!OJS_API_URL || !OJS_API_KEY) {
      setStatus("❌ Configuration error. Please contact site admin.");
      return;
    }
    if (!paperFile) {
      setStatus("❌ Please choose a file.");
      return;
    }

    setIsSubmitting(true);
    setStatus("Starting submission...");

    try {
      // STEP 1 — Create submission (no contextId here)
      setStatus("Step 1/4: Creating submission...");
      const createSubmissionRes = await axios.post(
        `${OJS_API_URL}/submissions`,
        { sectionId: 1, locale: "en_US" },
        {
          headers: {
            Authorization: `Bearer ${OJS_API_KEY}`,
            Accept: "application/json",
          },
        }
      );
      const submissionId = createSubmissionRes.data.id;
const publicationId = createSubmissionRes.data.currentPublicationId;

// ✅ Add admin as a participant before upload
try {
  await axios.post(
    `${OJS_API_URL}/submissions/${submissionId}/participants`,
    {
      userId: 3, // 👈 replace with your admin user_id from OJS database
      userGroupId: 14, // Author group ID
    },
    {
      headers: {
        Authorization: `Bearer ${OJS_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
  console.log("Admin added as participant.");
} catch (err) {
  console.warn("Participant add failed (may already exist):", err.message);
}

      console.log("✅ Submission created:", submissionId);

      // STEP 2 — Upload manuscript file
      // IMPORTANT: do NOT set Content-Type for FormData (browser adds boundary)
      setStatus("Step 2/4: Uploading manuscript file...");
      const formData = new FormData();
      formData.append("file", paperFile, paperFile.name);
      // OJS expects fileStage in the body. Use the canonical string constant.
      formData.append("fileStage", "SUBMISSION_FILE");

      await axios.post(
        `${OJS_API_URL}/submissions/${submissionId}/files`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${OJS_API_KEY}`,
            Accept: "application/json",
            // NOTE: no "Content-Type" here on purpose
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      // STEP 3 — Title & abstract on the publication
      setStatus("Step 3/4: Adding title and abstract...");
      await axios.put(
        `${OJS_API_URL}/submissions/${submissionId}/publications/${publicationId}`,
        {
          title: { en_US: form.paperTitle },
          abstract: { en_US: form.abstract },
        },
        {
          headers: {
            Authorization: `Bearer ${OJS_API_KEY}`,
            Accept: "application/json",
          },
        }
      );

      // STEP 4 — Add contributors (authors)
      setStatus("Step 4/4: Adding author details...");
      for (let i = 0; i < authors.length; i++) {
        const author = authors[i];
        const parts = (author.name || "").trim().split(/\s+/);
        const givenName = parts.length > 1 ? parts.slice(0, -1).join(" ") : author.name;
        const familyName = parts.length > 1 ? parts.slice(-1).join(" ") : "";

        const payload = {
          ["givenName[en_US]"]: givenName,
          ["familyName[en_US]"]: familyName,
          ["preferredPublicName[en_US]"]: author.name,
          email: author.email,
          country: "IN",
          ["affiliation[en_US]"]: "Independent Researcher",
          userGroupId: 14,
          includeInBrowse: true,
          primaryContact: i === 0,
        };

        await axios.post(
          `${OJS_API_URL}/submissions/${submissionId}/publications/${publicationId}/contributors`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${OJS_API_KEY}`,
              Accept: "application/json",
            },
          }
        );
      }

      // Done
      setUniqueCode(submissionId);
      setStatus("✅ Paper submitted successfully!");
      setForm({ paperTitle: "", abstract: "" });
      setAuthors([{ name: "", email: "" }]);
      setPaperFile(null);
      e.target.reset();
    } catch (error) {
      console.error("Submission failed:", error.response || error.message);
      let msg = "Check console for details.";
      const data = error.response?.data;
      if (data?.errorMessage) msg = data.errorMessage;
      if (data?.fileStage?.[0]) msg = data.fileStage[0];
      setStatus(`❌ Failed to submit paper. OJS said: "${msg}"`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 text-gray-800">
      <Navbar />
      <section
        className="relative bg-blue-900 mt-33 text-white py-20 px-4 md:px-20 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(14, 12, 12, 0.85), rgba(36, 33, 33, 0.85)), url(${uploadBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold" data-aos="fade-down">
            Submit Your <span className="text-orange-400">Manuscript</span>
          </h1>
          <p className="mt-4 text-lg max-w-2xl mx-auto" data-aos="fade-up">
            Upload your research paper and get a unique tracking code to check its status anytime.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white px-6 md:px-20">
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
          <form className="space-y-6" data-aos="fade-right" onSubmit={handleSubmit}>
            <h2 className="text-3xl font-bold text-blue-800">Upload Manuscript</h2>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-600">Paper Title</label>
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

            <div className="space-y-4 rounded-lg border border-gray-300 p-4">
              <label className="block text-lg font-semibold text-gray-700">Authors</label>
              {authors.map((author, index) => (
                <div key={index} className="p-2 border rounded-md relative">
                  <p className="font-medium text-sm text-gray-500 mb-2">
                    Author #{index + 1} {index === 0 && "(Primary Contact)"}
                  </p>
                  <div className="mb-2">
                    <label className="block mb-1 text-xs font-semibold text-gray-600">Name</label>
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
                    <label className="block mb-1 text-xs font-semibold text-gray-600">Email</label>
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
                      &times;
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

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-600">Abstract</label>
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

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-600">
                Upload Paper (PDF or .docx)
              </label>
              <input
                type="file"
                name="paperfile"
                onChange={handleFileChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300"
                accept=".pdf,.doc,.docx"
                required
              />
            </div>

            <button
              type="submit"
              className={`w-full text-white px-6 py-3 rounded-lg transition font-semibold ${
                isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting, Please Wait..." : "Submit Paper"}
            </button>

            <p className="text-sm text-gray-600 mt-2">{status}</p>

            {uniqueCode && (
              <p className="mt-4 text-green-700 font-semibold">
                🎉 Your tracking code is: <span className="text-blue-800">{uniqueCode}</span>
                <br />
                <span className="text-gray-700 text-sm">
                  Please copy this. It is your official Submission ID for tracking your paper.
                </span>
              </p>
            )}
          </form>

          <img src={paperImg} alt="Upload Illustration" className="w-full max-w-md mx-auto" data-aos="fade-left" />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SubmitManuscriptPage;
