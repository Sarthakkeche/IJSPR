// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';
// import { FaFileUpload, FaFileAlt, FaDownload, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

// const PaperManagement = () => {
//   const { id } = useParams();
//   const [papers, setPapers] = useState([]);
//   const [title, setTitle] = useState('');
//   const [Author , setAuthor] = useState('');
//   const [Date , setDate]= useState('');
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [uniqueCode, setUniqueCode] = useState('');


//   useEffect(() => {
//     fetchPapers();
//   }, [id]);

//   const fetchPapers = async () => {
//     try {
//       const res = await axios.get(`https://ijspr.onrender.com/api/papers/${id}`);
//       setPapers(res.data);
//     } catch (err) {
//       setError("Failed to load papers.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const uploadPaper = async () => {
//     if (!title.trim() || !file) return alert("Please enter a title and select a file.");
//     const formData = new FormData();
//     formData.append('title', title);
//     formData.append('Author',Author);
//     formData.append('Date',Date);
//     formData.append('file', file);
//      formData.append('uniqueCode', uniqueCode);

//     try {
//       await axios.post(`https://ijspr.onrender.com/api/papers/${id}`, formData);
//       setTitle('');
//       setAuthor('');
//       setDate('');
//        setUniqueCode('');
//       setFile(null);
//       fetchPapers();
//     } catch (err) {
//       alert("Upload failed. Try again.");
//     }
//   };

//   return (
//     <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-slate-900 to-black text-slate-100 flex flex-col items-center p-4 sm:p-8 font-sans">
//       <div className="w-full max-w-6xl mx-auto flex flex-col items-center">

//         {/* Header */}
//         <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-center mb-10 flex items-center gap-3 relative group">
//           <FaFileAlt className="text-pink-400 group-hover:scale-110 transition-transform duration-300" />
//           <span className="group-hover:text-pink-400 transition-colors duration-300">Paper Management</span>
//         </h1>

//         {/* Upload Form */}
//         <div className="flex flex-wrap gap-3 justify-center items-center mb-10 w-full max-w-3xl">
//           <input
//             value={title}
//             onChange={e => setTitle(e.target.value)}
//             placeholder="Paper Title"
//             className="flex-grow px-5 py-3 bg-slate-800 border border-slate-700 rounded-lg shadow-inner placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300"
//           />
//            <input
//             value={Author}
//             onChange={e => setAuthor(e.target.value)}
//             placeholder="Author"
//             className="flex-grow px-5 py-3 bg-slate-800 border border-slate-700 rounded-lg shadow-inner placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300"
//           />
//            <input
//             value={Date}
//             onChange={e => setDate(e.target.value)}
//             placeholder="Date"
//             className="flex-grow px-5 py-3 bg-slate-800 border border-slate-700 rounded-lg shadow-inner placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300"
//           />
//           <input
//             type="file"
//             onChange={e => setFile(e.target.files[0])}
//             className="px-3 py-3 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 cursor-pointer focus:outline-none"
//           />
//           <input
//   value={uniqueCode}
//   onChange={e => setUniqueCode(e.target.value)}
//   placeholder="Unique Code (from manuscript)"
//   className="flex-grow px-5 py-3 bg-slate-800 border border-slate-700 rounded-lg shadow-inner placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300"
// />

//           <button
//             onClick={uploadPaper}
//             className="flex items-center gap-2 bg-pink-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-pink-500/20 disabled:bg-gray-500 disabled:cursor-not-allowed"
//             disabled={!title.trim() || !file}
//           >
//             <FaFileUpload />
//             Upload
//           </button>
//         </div>

//         {/* Papers List */}
//         <div className="w-full max-w-4xl">
//           {loading ? (
//             <div className="flex justify-center items-center gap-3 text-lg text-slate-400">
//               <FaSpinner className="animate-spin text-2xl" />
//               <span>Loading Papers...</span>
//             </div>
//           ) : error ? (
//             <div className="flex flex-col items-center gap-3 text-red-400 bg-red-900/20 p-4 rounded-lg">
//               <FaExclamationTriangle className="text-3xl" />
//               <p className="font-semibold">{error}</p>
//             </div>
//           ) : papers.length === 0 ? (
//             <div className="text-center text-slate-500 py-10">
//               <p className="text-lg">No papers uploaded yet.</p>
//               <p>Use the form above to upload one.</p>
//             </div>
//           ) : (
//             <ul className="space-y-4">
//               {papers.map(p => (
//                 <li
//                   key={p._id}
//                   className="flex justify-between items-center bg-slate-800/50 border border-slate-700 rounded-xl px-6 py-4 hover:border-pink-400/50 transition-all duration-300"
//                 >
//                   <span className="text-lg font-medium text-slate-200">{p.title}</span>
//                   <a
//                     href={p.fileUrl}
//                     target="_blank"
//                     rel="noreferrer"
//                     download
//                     className="flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors"
//                   >
//                     <FaDownload />
//                     Download
//                   </a>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaperManagement;
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// --- SVG Icons to replace the react-icons library ---
const IconFileUpload = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);
const IconFileAlt = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
const IconDownload = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);
const IconExclamationTriangle = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
const IconSpinner = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.75V6.25m0 11.5v1.5M17.25 6.75l-1.06-1.06M7.81 17.25l-1.06-1.06M20.25 12h-1.5M5.25 12h-1.5M17.25 17.25l-1.06 1.06M7.81 6.75l-1.06 1.06" />
  </svg>
);
const IconTrash = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
// --- End of SVG Icons ---

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://ijspr.onrender.com" // <- change to your backend URL in production
    : "http://localhost:5000";


const PaperManagement = () => {
  const { id } = useParams(); // This is the issueId
  const [papers, setPapers] = useState([]);
  const [title, setTitle] = useState('');
  const [Author, setAuthor] = useState('');
  const [Date, setDate] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uniqueCode, setUniqueCode] = useState('');

  useEffect(() => {
    fetchPapers();
  }, [id]);

  const fetchPapers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/papers/${id}`);
      setPapers(res.data);
    } catch (err) {
      setError("Failed to load papers.");
    } finally {
      setLoading(false);
    }
  };

  const uploadPaper = async () => {
    if (!title.trim() || !file) return alert("Please enter a title and select a file.");
    const formData = new FormData();
    formData.append('title', title);
    formData.append('Author', Author);
    formData.append('Date', Date);
    formData.append('file', file);
    formData.append('uniqueCode', uniqueCode);

    try {
      await axios.post(`${API_BASE_URL}/api/papers/${id}`, formData);
      setTitle('');
      setAuthor('');
      setDate('');
      setUniqueCode('');
      setFile(null);
      fetchPapers(); // Refresh the list after upload
    } catch (err) {
      alert("Upload failed. Try again.");
    }
  };

  // --- NEW: Function to handle deleting a paper ---
  const handleDelete = async (paperId) => {
    if (!window.confirm("Are you sure you want to delete this published paper? This cannot be undone.")) {
      return;
    }
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/papers/${paperId}`);
      if (response.data.success) {
        // Remove the deleted paper from the UI instantly
        setPapers(prevPapers => prevPapers.filter(p => p._id !== paperId));
        alert("Paper deleted successfully!");
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("An error occurred while deleting the paper.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-slate-900 to-black text-slate-100 flex flex-col items-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-center mb-10 flex items-center gap-3 relative group">
          <IconFileAlt className="w-10 h-10 text-pink-400 group-hover:scale-110 transition-transform duration-300" />
          <span className="group-hover:text-pink-400 transition-colors duration-300">Paper Management</span>
        </h1>

        {/* Upload Form */}
        <div className="flex flex-wrap gap-3 justify-center items-center mb-10 w-full max-w-3xl">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Paper Title" className="flex-grow px-5 py-3 bg-slate-800 border border-slate-700 rounded-lg shadow-inner placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-300" />
          <input value={Author} onChange={e => setAuthor(e.target.value)} placeholder="Author" className="flex-grow px-5 py-3 bg-slate-800 border border-slate-700 rounded-lg shadow-inner placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-300" />
          <input value={Date} onChange={e => setDate(e.target.value)} placeholder="Date" className="flex-grow px-5 py-3 bg-slate-800 border border-slate-700 rounded-lg shadow-inner placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-300" />
          <input type="file" onChange={e => setFile(e.target.files[0])} className="px-3 py-3 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 cursor-pointer focus:outline-none" />
          <input value={uniqueCode} onChange={e => setUniqueCode(e.target.value)} placeholder="Unique Code (from manuscript)" className="flex-grow px-5 py-3 bg-slate-800 border border-slate-700 rounded-lg shadow-inner placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-300" />
          <button onClick={uploadPaper} className="flex items-center gap-2 bg-pink-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-pink-500/20 disabled:bg-gray-500 disabled:cursor-not-allowed" disabled={!title.trim() || !file}>
            <IconFileUpload className="w-5 h-5" />
            Upload
          </button>
        </div>

        {/* Papers List */}
        <div className="w-full max-w-4xl">
          {loading ? (
            <div className="flex justify-center items-center gap-3 text-lg text-slate-400">
              <IconSpinner className="w-8 h-8 animate-spin" />
              <span>Loading Papers...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 text-red-400 bg-red-900/20 p-4 rounded-lg">
              <IconExclamationTriangle className="w-10 h-10" />
              <p className="font-semibold">{error}</p>
            </div>
          ) : papers.length === 0 ? (
            <div className="text-center text-slate-500 py-10">
              <p className="text-lg">No papers uploaded for this issue yet.</p>
              <p>Use the form above to publish one.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {papers.map(p => (
                <li
                  key={p._id}
                  className="flex justify-between items-center bg-slate-800/50 border border-slate-700 rounded-xl px-6 py-4 hover:border-pink-400/50 transition-all duration-300"
                >
                  <span className="text-lg font-medium text-slate-200">{p.title}</span>
                  <div className="flex items-center gap-4">
                    <a href={p.fileUrl} target="_blank" rel="noreferrer" download className="flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors">
                      <IconDownload className="w-5 h-5" />
                      Download
                    </a>
                    {/* --- NEW: Delete Button for each paper --- */}
                    <button
                        onClick={() => handleDelete(p._id)}
                        className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                        <IconTrash className="w-5 h-5" />
                        Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaperManagement;