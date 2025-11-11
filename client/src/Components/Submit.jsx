import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import paperImg from "../assets/paper.jpg";
import uploadBg from "../assets/uplaod.jpg";

const OJS_API_URL = import.meta.env.VITE_OJS_API_URL;
const OJS_API_KEY = import.meta.env.VITE_OJS_API_KEY;
const OJS_SECTION_ID = Number(import.meta.env.VITE_OJS_SECTION_ID ?? 1);
const OJS_AUTHOR_GROUP_ID = Number(import.meta.env.VITE_OJS_AUTHOR_GROUP_ID ?? 14);

const SubmitManuscriptPage = () => {
  useEffect(() => { AOS.init({ duration: 1000 }); }, []);

  const [form, setForm] = useState({ paperTitle: "", abstract: "" });
  const [authors, setAuthors] = useState([{ name: "", email: "" }]);
  const [paperFile, setPaperFile] = useState(null);
  const [uniqueCode, setUniqueCode] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleAuthorChange = (i, e) => {
    const copy = [...authors]; copy[i][e.target.name] = e.target.value; setAuthors(copy);
  };
  const addAuthor = () => setAuthors((a) => [...a, { name: "", email: "" }]);
  const removeAuthor = (i) => { if (authors.length > 1) setAuthors((a) => a.filter((_, idx) => idx !== i)); };
  const handleFileChange = (e) => setPaperFile(e.target.files[0]);

  const submissionPayload = () => ({
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
  });

  const msgFrom = (err) => {
    const d = err?.response?.data;
    if (!d) return err?.message || "Unknown error";
    if (typeof d === "string") return d;
    return d.errorMessage || d.message || JSON.stringify(d);
  };

  // --- Create submission: try Bearer first, fallback to X-Api-Key ---
  const createSubmission = async (data) => {
    const url = `${OJS_API_URL}/submissions`;
    try {
      const r = await axios.post(url, data, {
        headers: { Authorization: `Bearer ${OJS_API_KEY}`, "Content-Type": "application/json", Accept: "application/json" },
      });
      return r.data.id;
    } catch (e1) {
      // Typical 403 “You may have been logged out…” -> retry with X-Api-Key
      const r = await axios.post(url, data, {
        headers: { "X-Api-Key": OJS_API_KEY, "Content-Type": "application/json", Accept: "application/json" },
      });
      return r.data.id;
    }
  };

  // --- Upload file: try X-Api-Key first (your server’s preference), fallback to Bearer ---
  const uploadFile = async (submissionId) => {
    const tryUpload = async (genreId, headers) => {
      const fd = new FormData();
      fd.append("file", paperFile, paperFile.name);
      fd.append("name", paperFile.name);
      fd.append("genreId", String(genreId));
      const url = `${OJS_API_URL}/submissions/${submissionId}/files?fileStage=SUBMISSION_FILE`;
      return axios.post(url, fd, { headers });
    };

    const headersKey = { "X-Api-Key": OJS_API_KEY, "Content-Type": "multipart/form-data", Accept: "application/json" };
    const headersBearer = { Authorization: `Bearer ${OJS_API_KEY}`, "Content-Type": "multipart/form-data", Accept: "application/json" };

    try {
      // try “Article Text” genreId=1 first
      return await tryUpload(1, headersKey);
    } catch (e1) {
      // if stage/genre complains, retry with different combos
      try { return await tryUpload(2, headersKey); } catch (e2) {
        try { return await tryUpload(1, headersBearer); } catch (e3) {
          return await tryUpload(2, headersBearer);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!OJS_API_URL || !OJS_API_KEY) { setStatus("❌ Missing OJS API configuration."); return; }
    if (!paperFile) { setStatus("❌ Please choose a file to upload."); return; }

    setIsSubmitting(true);
    setStatus("Submitting...");

    try {
      // Step 1: create submission
      setStatus("Step 1/2: Creating submission...");
      const payload = submissionPayload();
      const submissionId = await createSubmission(payload);
      if (!submissionId) throw new Error("Submission created but ID missing.");
      console.log("✅ Submission created:", submissionId);

      // Step 2: upload manuscript
      setStatus("Step 2/2: Uploading manuscript file...");
      await uploadFile(submissionId);

      setUniqueCode(submissionId);
      setStatus("✅ Paper submitted successfully!");
      setForm({ paperTitle: "", abstract: "" });
      setAuthors([{ name: "", email: "" }]);
      setPaperFile(null);
      e.target.reset();
    } catch (err) {
      console.error("❌ Submission failed:", err?.response?.data || err);
      setStatus(`❌ Failed: ${msgFrom(err)}`);
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
          <h1 className="text-4xl md:text-5xl font-bold">
            Submit Your <span className="text-orange-400">Manuscript</span>
          </h1>
          <p className="mt-4 text-lg max-w-2xl mx-auto">
            Upload your research paper and get a unique tracking code to check its status anytime.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white px-6 md:px-20">
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <h2 className="text-3xl font-bold text-blue-800">Upload Manuscript</h2>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-600">Paper Title</label>
              <input
                type="text" name="paperTitle" value={form.paperTitle} onChange={handleChange}
                placeholder="Enter paper title"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500" required
              />
            </div>

            <div className="space-y-4 rounded-lg border border-gray-300 p-4">
              <label className="block text-lg font-semibold text-gray-700">Authors</label>
              {authors.map((a, i) => (
                <div key={i} className="p-2 border rounded-md relative">
                  <p className="font-medium text-sm text-gray-500 mb-2">Author #{i + 1} {i === 0 && "(Primary Contact)"}</p>
                  <div className="mb-2">
                    <label className="block mb-1 text-xs font-semibold text-gray-600">Author Name</label>
                    <input
                      type="text" name="name" value={a.name} onChange={(e) => handleAuthorChange(i, e)}
                      placeholder="Enter full name" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-semibold text-gray-600">Author Email</label>
                    <input
                      type="email" name="email" value={a.email} onChange={(e) => handleAuthorChange(i, e)}
                      placeholder="Enter author's email" className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" required
                    />
                  </div>
                  {i > 0 && (
                    <button type="button" onClick={() => removeAuthor(i)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold">×</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addAuthor}
                className="w-full mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium">
                + Add Another Author
              </button>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-600">Abstract</label>
              <textarea
                name="abstract" value={form.abstract} onChange={handleChange}
                placeholder="Paste your paper's abstract here" rows="5"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500" required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-600">Upload Paper (PDF or .docx)</label>
              <input
                type="file" name="paperFile" onChange={handleFileChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required
              />
            </div>

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
                🎉 Your tracking code is: <span className="text-blue-800">{uniqueCode}</span>
                <br />
                <span className="text-gray-700 text-sm">Keep this Submission ID to track your paper.</span>
              </p>
            )}
          </form>

          <img src={paperImg} alt="Upload Illustration" className="w-full max-w-md mx-auto" />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SubmitManuscriptPage;
