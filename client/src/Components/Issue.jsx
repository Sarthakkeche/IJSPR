import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import Foot from '../Components/Footer';

// Get the API URL and Key from Vercel's Environment Variables
const OJS_API_URL = import.meta.env.VITE_OJS_API_URL;
const OJS_API_KEY = import.meta.env.VITE_OJS_API_KEY;

const CurrentIssuePage = () => {
  const [papers, setPapers] = useState([]);
  const [issueTitle, setIssueTitle] = useState('Current Issue');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentIssue = async () => {
      if (!OJS_API_URL || !OJS_API_KEY) {
        console.error('OJS API URL or Key is not configured.');
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `${OJS_API_URL}/issues/current`, 
          {
            headers: { 'Authorization': `Bearer ${OJS_API_KEY}` }
          }
        );

        // --- HERE ARE THE FIXES ---
        // FIX 1: Check if publications exists. If not, use an empty array [].
        // This stops the "undefined.length" error.
        setPapers(res.data.publications || []);
        
        // FIX 2: Safely access the title.
        setIssueTitle((res.data.title && res.data.title.en) || 'Current Issue');
        
        setLoading(false);
        
      } catch (err) {
        console.error('Error fetching current issue:', err);
        setLoading(false);
        if (err.response && err.response.status === 404) {
          console.warn('No current issue found. Please publish an issue in OJS.');
        }
      }
    };

    fetchCurrentIssue();
  }, []);

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 text-gray-800 min-h-screen flex flex-col">
      <Navbar />

      <section className="relative bg-gray-800 text-white py-20 px-4 md:px-20 mt-20">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold">{issueTitle}</h1>
          <p className="text-lg mt-2">All Papers from the Latest Published Issue</p>
        </div>
      </section>

      <section className="flex-grow py-12 px-4 md:px-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <p className="col-span-full text-center text-gray-500">Loading...</p>
          ) : papers.length > 0 ? (
            papers.map(paper => {
              // FIX 3: Safely check for galleys.
              const pdfGalley = (paper.galleys || []).find(
                galley => galley.label === 'PDF' || galley.fileType === 'application/pdf'
              );
              const fileUrl = pdfGalley ? pdfGalley.urlPublished : null;

              return (
                <div key={paper.id} className="bg-white p-4 rounded shadow">
                  {/* FIX 4: Safely check for fullTitle */}
                  <h2 className="text-lg font-semibold mb-2">{(paper.fullTitle && paper.fullTitle.en) || "Title not available"}</h2>
                  <p className="text-sm text-gray-600 mb-2">{paper.authorsString || "Unknown Author"}</p>
                  <p className="text-sm text-gray-700 mb-3">
                    {paper.datePublished ? new Date(paper.datePublished).toLocaleDateString() : "Date not provided"}
                  </j>
                  
                  {fileUrl ? (
                    <a
                      href={fileUrl}
                      className="inline-block mt-auto bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download PDF
                    </a>
                  ) : (
                    <span className="inline-block mt-auto bg-gray-300 text-gray-600 px-3 py-1 rounded cursor-not-allowed">
                      PDF not available
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <p className="col-span-full text-center text-gray-500">
              No papers found in the current issue.
            </p>
          )}
        </div>
      </section>

      <Foot />
    </div>
  );
};

export default CurrentIssuePage;