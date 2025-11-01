import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import axios from "axios";
import paperImg from "../assets/paper.jpg";
import uploadBg from "../assets/uplaod.jpg";

// Get the API URL and Key from Vercel's Environment Variables
const OJS_API_URL = import.meta.env.VITE_OJS_API_URL;
const OJS_API_KEY = import.meta.env.VITE_OJS_API_KEY;

const SubmitManuscriptPage = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  // OJS requires more fields, so we must add authorEmail and abstract
  const [form, setForm] = useState({
    authorName: "",
    authorEmail: "", // OJS requires an email to create an author
    paperTitle: "",
    abstract: "", // OJS submissions should have an abstract
  });
  const [paperFile, setPaperFile] = useState(null);
  const [uniqueCode, setUniqueCode] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent double-clicks

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setPaperFile(e.target.files[0]);

 const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Stop if already submitting

    // Check for API keys
    if (!OJS_API_URL || !OJS_API_KEY) {
      console.error('OJS API URL or Key is not configured.');
      setStatus("❌ Configuration error. Please contact site admin.");
      return;
    }

    setIsSubmitting(true);
    setStatus("Submitting... please wait.");

    try {
      // --- New 2-Step Process (v2) ---
      // Step 1: Create the submission with ALL metadata
      setStatus("Step 1/2: Submitting all article data...");

      const submissionData = {
        title: { en_US: form.paperTitle },
        abstract: { en_US: form.abstract },
        sectionId: 1, // We confirmed this is 1
        authors: [
          {
            name: form.authorName,
            email: form.authorEmail,
            country: "IN",
            includeInBrowse: true,
            userGroupId: 14, // We confirmed this is 14 (Author)
          }
        ]
      };

      const submissionResponse = await axios.post(
        `${OJS_API_URL}/submissions`,
        submissionData,
        { headers: { 'Authorization': `Bearer ${OJS_API_KEY}` } }
      );

      const submissionId = submissionResponse.data.id;

      // Step 2: Upload the manuscript file to the new submission
      setStatus("Step 2/2: Uploading manuscript file...");
      
      const fileData = new FormData();
      fileData.append('file', paperFile);
      
      // -----------------------------------------------------------------
      // **THIS IS THE FINAL FIX:**
      // We must tell OJS what "stage" this file belongs to.
      // '2' is the standard ID for the main "Submission File" (the article manuscript).
      fileData.append('fileStage', '2');
      // -----------------------------------------------------------------

      await axios.post(
        `${OJS_API_URL}/submissions/${submissionId}/files`,
        fileData,
        { headers: { 'Authorization': `Bearer ${OJS_API_KEY}`, 'Content-Type': 'multipart/form-data' } }
      );

      // All steps done!
      setUniqueCode(submissionId); // Use the OJS submission ID as the tracking code
      setStatus("✅ Paper submitted successfully!");
      setForm({ authorName: "", authorEmail: "", paperTitle: "", abstract: "" });
      setPaperFile(null);
      e.target.reset(); // Resets the file input field
      setIsSubmitting(false);

    } catch (error) {
      // This is where we will see the new error if it fails
      console.error("Submission failed:", error.response ? error.response.data : error.message);
      
      let ojsErrorMessage = "Check console for details.";
      if (error.response && error.response.data) {
         const errorData = error.response.data;
         if (errorData.errorMessage) {
            // This is the error we see now: {error: '...', errorMessage: '...'}
            ojsErrorMessage = errorData.errorMessage;
         } else {
            // This handles other validation errors: { "abstract": ["The abstract is required."] }
            const errorFields = Object.keys(errorData);
            if (errorFields.length > 0) {
              const firstErrorField = errorFields[0];
              ojsErrorMessage = `${firstErrorField}: ${errorData[firstErrorField][0]}`;
            }
         }
      }

      setStatus(`❌ Failed to submit paper. OJS said: "${ojsErrorMessage}"`);
      setIsSubmitting(false);
    }
  };
  return (
    <div className="bg-gradient-to-b from-white to-blue-50 text-gray-800">
      <Navbar />

      {/* Hero Section (no changes) */}
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
            Upload your research paper and get a unique tracking code to
            check its status anytime.
          </p>
        </div>
      </section>

      {/* ⚠️ Important Info Section (no changes) */}
      <section className="px-6 md:px-20 py-10">
        <div
          className="relative bg-white text-gray-800 p-6 rounded-xl shadow-lg border-4 animate-borderGlow"
          data-aos="zoom-in"
        >
          <h2 className="text-xl font-bold text-red-600 mb-3">
            ⚠️ Important Submission Guidelines
          </h2>
          <p className="mb-4">
            For publishing your paper in <b>IJRWS</b>, you must submit your
            manuscript strictly in the{" "}
            <span className="font-semibold text-blue-700">
              official journal template
            </span>
            . Submissions not following the format will be{" "}
            <span className="font-bold text-red-600">rejected</span>.
             <a href="#" className="text-green-400"> Click here for more Information</a>
          </p>
          <a
            href="/IJRWS_Template.docx" // put your real template file path here
            download
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-purple-700 transition"
          >
            ⬇️ Download Template
          </a>
        </div>
      </section>

      {/* Form Section (MODIFIED) */}
      <section className="py-16 bg-white px-6 md:px-20">
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
          {/* Submit Form */}
          <form
            className="space-y-6"
            data-aos="fade-right"
            onSubmit={handleSubmit}
          >
            <h2 className="text-3xl font-bold text-blue-800">
              Upload Manuscript
            </h2>

            {/* Paper Title Input */}
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

            {/* Author Name Input */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-600">
                Author Name
              </label>
              <input
                type="text"
                name="authorName"
                value={form.authorName}
                onChange={handleChange}
                placeholder="Enter full name of the corresponding author"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* NEW: Author Email Input */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-600">
                Author Email
              </label>
              <input
                type="email"
                name="authorEmail"
                value={form.authorEmail}
                onChange={handleChange}
                placeholder="Enter author's email (required by OJS)"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* NEW: Abstract Textarea */}
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

            {/* File Input */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-600">
                Upload Paper (PDF or .docx)
              </label>
              <input
                type="file"
                name="paperfile"
                onChange={handleFileChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                required
              />
            </div>

            <button
              type="submit"
              className={`w-full text-white px-6 py-3 rounded-lg transition font-semibold ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800'}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting, Please Wait...' : 'Submit Paper'}
            </button>

            <p className="text-sm text-gray-600 mt-2">{status}</p>

            {uniqueCode && (
              <p className="mt-4 text-green-700 font-semibold">
                🎉 Your tracking code is:{" "}
                <span className="text-blue-800">{uniqueCode}</span>
                <br />
                <span className="text-gray-700 text-sm">
                  Please copy this. It is your official Submission ID for tracking your paper.
                </span>
              </p>
            )}
          </form>

          <img
            src={paperImg}
            alt="Upload Illustration"
            className="w-full max-w-md mx-auto"
            data-aos="fade-left"
          />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SubmitManuscriptPage;