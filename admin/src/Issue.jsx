// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { FaPlus, FaBook, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

// const IssueManagement = () => {
//   const { id } = useParams();
//   const [issues, setIssues] = useState([]);
//   const [newIssue, setNewIssue] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchIssues();
//   }, [id]);

//   const fetchIssues = async () => {
//     try {
//       const res = await axios.get(`https://ijspr.onrender.com/api/issues/${id}`);
//       setIssues(res.data);
//     } catch (err) {
//       setError("Failed to load issues. Check your server.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const createIssue = async () => {
//     if (!newIssue.trim()) return;
//     try {
//       const res = await axios.post(`https://ijspr.onrender.com/api/issues/${id}`, { name: newIssue });
//       setIssues(prev => [...prev, res.data]);
//       setNewIssue('');
//     } catch (err) {
//       alert("Failed to create issue.");
//     }
//   };

//   return (
//     <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-slate-900 to-black text-slate-100 flex flex-col items-center p-4 sm:p-8 font-sans">
//       <div className="w-full max-w-6xl mx-auto flex flex-col items-center">

//         {/* Header */}
//         <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-center mb-10 flex items-center gap-3 relative group">
//           <FaBook className="text-purple-400 group-hover:scale-110 transition-transform duration-300" />
//           <span className="group-hover:text-purple-400 transition-colors duration-300">Issue Management</span>
//         </h1>

//         {/* Input Form */}
//         <div className="flex flex-wrap gap-3 justify-center items-center mb-12 w-full max-w-xl">
//           <input
//             value={newIssue}
//             onChange={e => setNewIssue(e.target.value)}
//             placeholder="Enter New Issue Name"
//             className="flex-grow px-5 py-3 bg-slate-800 border border-slate-700 rounded-lg shadow-inner placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
//           />
//           <button
//             onClick={createIssue}
//             disabled={!newIssue.trim()}
//             className="flex items-center gap-2 bg-purple-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/20 disabled:bg-gray-500 disabled:shadow-none disabled:cursor-not-allowed"
//           >
//             <FaPlus />
//             Create
//           </button>
//         </div>

//         {/* Issues Display */}
//         <div className="w-full">
//           {loading ? (
//             <div className="flex justify-center items-center gap-3 text-lg text-slate-400">
//               <FaSpinner className="animate-spin text-2xl" />
//               <span>Loading Issues...</span>
//             </div>
//           ) : error ? (
//             <div className="flex flex-col items-center gap-3 text-red-400 bg-red-900/20 p-4 rounded-lg">
//               <FaExclamationTriangle className="text-3xl" />
//               <p className="font-semibold">{error}</p>
//             </div>
//           ) : issues.length === 0 ? (
//             <div className="text-center text-slate-500 py-10">
//               <p className="text-lg">No issues found.</p>
//               <p>Use the form above to create your first one.</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//               {issues.map(issue => (
//                 <div
//                   key={issue._id}
//                   onClick={() => navigate(`/paper/${issue._id}`)}
//                   className="group cursor-pointer bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 text-center transform hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-500/20 hover:border-purple-400/50 transition-all duration-300 ease-in-out flex flex-col items-center justify-center h-48"
//                 >
//                   <FaBook className="text-4xl text-slate-500 mb-4 group-hover:text-purple-400 transition-colors duration-300" />
//                   <h2 className="text-lg font-semibold text-slate-200 group-hover:text-white transition-colors duration-300">
//                     {issue.name}
//                   </h2>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default IssueManagement;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- SVG Icons to replace the react-icons library ---
const IconPlus = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);
const IconBook = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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

const IssueManagement = () => {
  const { id } = useParams(); // This is the volumeId
  const [issues, setIssues] = useState([]);
  const [newIssue, setNewIssue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchIssues();
  }, [id]);

  const fetchIssues = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/issues/${id}`);
      setIssues(res.data);
    } catch (err) {
      setError("Failed to load issues. Check your server.");
    } finally {
      setLoading(false);
    }
  };

  const createIssue = async () => {
    if (!newIssue.trim()) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/api/issues/${id}`, { name: newIssue });
      setIssues(prev => [...prev, res.data]);
      setNewIssue('');
    } catch (err) {
      alert("Failed to create issue.");
    }
  };

  // --- NEW: Function to handle deleting an issue ---
  const handleDelete = async (issueId, event) => {
    event.stopPropagation(); // Prevents navigating to the paper page when clicking the delete button

    if (!window.confirm("Are you sure? Deleting an issue will also delete ALL papers published within it. This cannot be undone.")) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/issues/${issueId}`);
      if (response.data.success) {
        setIssues(prevIssues => prevIssues.filter(issue => issue._id !== issueId));
        alert("Issue and all its papers were deleted successfully.");
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("An error occurred while deleting the issue.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-slate-900 to-black text-slate-100 flex flex-col items-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-center mb-10 flex items-center gap-3 relative group">
          <IconBook className="w-10 h-10 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
          <span className="group-hover:text-purple-400 transition-colors duration-300">Issue Management</span>
        </h1>

        <div className="flex flex-wrap gap-3 justify-center items-center mb-12 w-full max-w-xl">
          <input value={newIssue} onChange={e => setNewIssue(e.target.value)} placeholder="Enter New Issue Name" className="flex-grow px-5 py-3 bg-slate-800 border border-slate-700 rounded-lg shadow-inner placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
          <button onClick={createIssue} disabled={!newIssue.trim()} className="flex items-center gap-2 bg-purple-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/20 disabled:bg-gray-500 disabled:shadow-none disabled:cursor-not-allowed">
            <IconPlus className="w-5 h-5" />
            Create
          </button>
        </div>

        <div className="w-full">
          {loading ? (
            <div className="flex justify-center items-center gap-3 text-lg text-slate-400">
              <IconSpinner className="w-8 h-8 animate-spin" />
              <span>Loading Issues...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 text-red-400 bg-red-900/20 p-4 rounded-lg">
              <IconExclamationTriangle className="w-10 h-10" />
              <p className="font-semibold">{error}</p>
            </div>
          ) : issues.length === 0 ? (
            <div className="text-center text-slate-500 py-10">
              <p className="text-lg">No issues found.</p>
              <p>Use the form above to create your first one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {issues.map(issue => (
                <div
                  key={issue._id}
                  className="relative group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 text-center transform hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-500/20 hover:border-purple-400/50 transition-all duration-300 ease-in-out flex flex-col items-center justify-center h-48"
                >
                  <div onClick={() => navigate(`/paper/${issue._id}`)} className="absolute inset-0 z-0 cursor-pointer"></div>
                  
                  {/* --- NEW: Delete button --- */}
                  <button
                    onClick={(e) => handleDelete(issue._id, e)}
                    className="absolute top-2 right-2 z-10 p-2 text-slate-500 hover:text-red-400 transition-colors opacity-50 group-hover:opacity-100"
                    title="Delete Issue"
                  >
                    <IconTrash className="w-5 h-5" />
                  </button>

                  <IconBook className="text-4xl text-slate-500 mb-4 group-hover:text-purple-400 transition-colors duration-300" />
                  <h2 className="text-lg font-semibold text-slate-200 group-hover:text-white transition-colors duration-300 z-10">
                    {issue.name}
                  </h2>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueManagement;

