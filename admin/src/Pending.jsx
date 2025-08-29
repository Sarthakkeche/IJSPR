import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaFileAlt,
  FaDownload,
  FaExclamationTriangle,
  FaSpinner,
} from "react-icons/fa";

const PendingManuscripts = () => {
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchManuscripts();
  }, []);

  const fetchManuscripts = async () => {
    try {
      const res = await axios.get("https://ijspr.onrender.com/api/manuscripts");
      setManuscripts(res.data);
    } catch (err) {
      setError("Failed to load manuscripts.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-slate-900 to-black text-slate-100 flex flex-col items-center p-6 sm:p-10 font-sans">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Header */}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-center mb-10 flex items-center gap-3 relative group">
          <FaFileAlt className="text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
          <span className="group-hover:text-yellow-400 transition-colors duration-300">
            Pending Manuscripts
          </span>
        </h1>

        {/* Manuscripts List */}
        <div className="w-full max-w-5xl">
          {loading ? (
            <div className="flex justify-center items-center gap-3 text-lg text-slate-400">
              <FaSpinner className="animate-spin text-2xl" />
              <span>Loading Manuscripts...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 text-red-400 bg-red-900/20 p-4 rounded-lg">
              <FaExclamationTriangle className="text-3xl" />
              <p className="font-semibold">{error}</p>
            </div>
          ) : manuscripts.length === 0 ? (
            <div className="text-center text-slate-500 py-10">
              <p className="text-lg">No pending manuscripts found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {manuscripts.map((m) => (
                <div
                  key={m._id}
                  className="flex flex-col justify-between bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-yellow-400/50 transition-all duration-300 shadow-lg"
                >
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-slate-100">
                      {m.paperTitle}
                    </h2>
                    <p className="text-sm text-slate-400">
                      <span className="font-medium text-slate-200">
                        Author:
                      </span>{" "}
                      {m.authorName}
                    </p>
                    <p className="text-sm text-slate-400">
                      <span className="font-medium text-slate-200">Email:</span>{" "}
                      {m.email}
                    </p>
                    <p className="text-sm text-slate-400">
                      <span className="font-medium text-slate-200">
                        Unique Code:
                      </span>{" "}
                      {m.uniqueCode}
                    </p>
                  </div>

                  {m.fileUrl && (
                    <a
                      href={`https://ijspr.onrender.com${m.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="mt-4 inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      <FaDownload />
                      Download Manuscript
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingManuscripts;
