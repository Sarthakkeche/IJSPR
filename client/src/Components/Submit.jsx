import { useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";

const SubmitManuscriptPage = () => {
  const OJS_API_URL = import.meta.env.VITE_OJS_API_URL;
  const OJS_API_KEY = import.meta.env.VITE_OJS_API_KEY;
  const OJS_SECTION_ID = Number(import.meta.env.VITE_OJS_SECTION_ID ?? 1);
  const OJS_AUTHOR_GROUP_ID = Number(import.meta.env.VITE_OJS_AUTHOR_GROUP_ID ?? 14);

  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [submissionId, setSubmissionId] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!file) {
      setStatus("❌ Please select a file before submitting.");
      return;
    }

    setLoading(true);
    setStatus("⏳ Creating submission...");

    try {
      // 1️⃣ Create a submission
      const createRes = await axios.post(
        `${OJS_API_URL}/submissions`,
        {
          sectionId: OJS_SECTION_ID,
          locale: "en_US",
          publications: [
            {
              title: { en_US: title },
              abstract: { en_US: abstract },
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${OJS_API_KEY}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const submissionId = createRes.data.id;
      console.log("✅ Submission created:", submissionId);
      setSubmissionId(submissionId);
      setStatus("✅ Submission created. Uploading file...");

      // 2️⃣ Upload manuscript file
      const formData = new FormData();
      formData.append("fileStage", "2");
      formData.append("name", file.name);
      formData.append("file", file);

      const fileRes = await axios.post(
        `${OJS_API_URL}/submissions/${submissionId}/files`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${OJS_API_KEY}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("✅ File uploaded:", fileRes.data);
      setStatus("🎉 Paper submitted successfully!");
    } catch (error) {
      console.error("❌ Error submitting:", error);
      setStatus(
        `❌ Submission failed: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white text-gray-800">
      <Navbar />
      <div className="max-w-3xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold text-center mb-6">
          Submit Your Manuscript
        </h1>
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 p-6 rounded-xl shadow-md space-y-4"
        >
          <div>
            <label className="block font-semibold mb-1">Paper Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Abstract</label>
            <textarea
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              rows={4}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Upload Paper</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded text-white font-semibold ${
              loading ? "bg-gray-400" : "bg-blue-700 hover:bg-blue-800"
            }`}
          >
            {loading ? "Submitting..." : "Submit Paper"}
          </button>

          <p className="text-sm text-center mt-2">{status}</p>

          {submissionId && (
            <p className="text-green-700 text-center mt-3">
              ✅ Submission ID: <b>{submissionId}</b>
            </p>
          )}
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default SubmitManuscriptPage;
