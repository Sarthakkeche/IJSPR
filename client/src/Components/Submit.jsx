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

  // State for the main form (title, abstract)
  const [form, setForm] = useState({
    paperTitle: "",
    abstract: "",
  });
  
  // State for the dynamic list of authors
  const [authors, setAuthors] = useState([
    { name: "", email: "" } // Start with one author object
  ]);

  const [paperFile, setPaperFile] = useState(null);
  const [uniqueCode, setUniqueCode] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent double-clicks

  // Handles changes for the main form (title, abstract)
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Handles changes for the dynamic author inputs
  const handleAuthorChange = (authorIndex, event) => {
    const newAuthors = authors.map((author, i) => {
      if (authorIndex === i) {
        return { ...author, [event.target.name]: event.target.value };
      }
      return author;
    });
    setAuthors(newAuthors);
  };

  // Adds a new, empty author object to the list
  const addAuthor = () => {
    setAuthors([...authors, { name: "", email: "" }]);
  };

  // Removes an author from the list
  const removeAuthor = (authorIndex) => {
    if (authors.length <= 1) return; // Don't remove the last author
    const newAuthors = authors.filter((_, i) => i !== authorIndex);
    setAuthors(newAuthors);
  };

  // Handles the file input
  const handleFileChange = (e) => setPaperFile(e.target.files[0]);

  // Handles the complete submission process
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; 

    if (!OJS_API_URL || !OJS_API_KEY) {
      console.error('OJS API URL or Key is not configured.');
      setStatus("❌ Configuration error. Please contact site admin.");
      return;
    }

    setIsSubmitting(true);
    setStatus("Submitting... please wait.");

    try {
      // Step 1: Create the submission with ALL metadata
      setStatus("Step 1/2: Submitting all article data...");

      // Create the list of authors for the API
      // This includes the 'primaryContact' fix
      const authorsForApi = authors.map((author, authorIndex) => ({
        name: author.name,
        email: author.email,
        country: "IN",
        includeInBrowse: true,
        userGroupId: 14, // We confirmed this is 14 (Author)
        primaryContact: (authorIndex === 0) // FIX: Makes the first author the primary contact
      }));
      
      const submissionData = {
        title: { en_US: form.paperTitle },
        abstract: { en_US: form.abstract },
        sectionId: 1, // We confirmed this is 1
        authors: authorsForApi // Use the new array
      };

      const submissionResponse = await axios.post(
        `${OJS_API_URL}/submissions`,
        submissionData,
        { headers: { 'Authorization': `Bearer ${OJS_API_KEY}` } }
      );

      const submissionId = submissionResponse.data.id;

      // Step 2: Upload the manuscript file
      setStatus("Step 2/2: Uploading manuscript file...");
      
      const fileData = new FormData();
      fileData.append('file', paperFile);
      fileData.append('fileStage', '2'); // '2' = Submission File

      await axios.post(
        `${OJS_API_URL}/submissions/${submissionId}/files`,
        fileData,
        { headers: { 'Authorization': `Bearer ${OJS_API_KEY}`, 'Content-Type': 'multipart/form-data' } }
      );

      // All steps done!
      setUniqueCode(submissionId);
      setStatus("✅ Paper submitted successfully!");
      setForm({ paperTitle: "", abstract: "" });
      setAuthors([{ name: "", email: "" }]);
      setPaperFile(null);
      e.target.reset(); // Resets the file input field
      setIsSubmitting(false);

    } catch (error) {
      console.error("Submission failed:", error.response ? error.response.data : error.message);
      
      let ojsErrorMessage = "Check console for details.";
      if (error.response && error.response.data) {
         const errorData = error.response.data;
         if (errorData.errorMessage) {
            ojsErrorMessage = errorData.errorMessage;
         } else {
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

      {/* Hero Section */}
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

      {/* Important Info Section */}
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
            href="/IJRWS_Template.docx"
            download
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-purple-700 transition"
          >
            ⬇️ Download Template
          </a>
        </div>
      </section>

      {/* Form Section */}
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

            {/* --- DYNAMIC AUTHOR SECTION --- */}
            <div className="space-y-4 rounded-lg border border-gray-300 p-4">
              <label className="block text-lg font-semibold text-gray-700">
                Authors
              </label>
              {authors.map((author, authorIndex) => (
                <div key={authorIndex} className="p-2 border rounded-md relative">
                  <p className="font-medium text-sm text-gray-500 mb-2">Author #{authorIndex + 1} {authorIndex === 0 && "(Primary Contact)"}</p>
                  {/* Author Name Input */}
                  <div className="mb-2">
                    <label className="block mb-1 text-xs font-semibold text-gray-600">
                      Author Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={author.name}
                      onChange={(e) => handleAuthorChange(authorIndex, e)}
                      placeholder="Enter full name"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                      required
                    />
                  </div>
                  {/* Author Email Input */}
                  <div>
                    <label className="block mb-1 text-xs font-semibold text-gray-600">
                      Author Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={author.email}
                      onChange={(e) => handleAuthorChange(authorIndex, e)}
                      placeholder="Enter author's email (required)"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                      required
                    />
                  </div>
                  {/* Remove Button (only show if not the first author) */}
                  {authorIndex > 0 && (
                    <button
                      type="button"
                      onClick={() => removeAuthor(authorIndex)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
              {/* Add Author Button */}
              <button
                type="button"
                onClick={addAuthor}
                className="w-full mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
              >
                + Add Another Author
              </button>
            </div>
            {/* --- END DYNAMIC AUTHOR SECTION --- */}


            {/* Abstract Textarea */}
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