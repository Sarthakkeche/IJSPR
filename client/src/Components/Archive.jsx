import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import Foot from '../Components/Footer';

// Get the API URL and Key from Vercel's Environment Variables
const OJS_API_URL = import.meta.env.VITE_OJS_API_URL;
const OJS_API_KEY = import.meta.env.VITE_OJS_API_KEY;

const ArchivePage = () => {
  const [groupedIssues, setGroupedIssues] = useState([]);
  const [loading, setLoading] = useState(true); // Added a loading state

  useEffect(() => {
    const fetchAllIssues = async () => {
      if (!OJS_API_URL || !OJS_API_KEY) {
        console.error('OJS API URL or Key is not configured.');
        setLoading(false);
        return;
      }
      
      try {
        const res = await axios.get(
          `${OJS_API_URL}/issues`, 
          {
            headers: { 'Authorization': `Bearer ${OJS_API_KEY}` }, // Your correct fix is here
            params: {
              isPublished: true, // This makes sure we only get published issues
              orderBy: 'volume',
              orderDirection: 'DESC' // Newest volumes first
            }
          }
        );

        // --- Grouping Logic ---
        const groups = new Map();
        
        // Use res.data.items (which is the correct array from OJS)
        res.data.items.forEach(issue => {
          // We can remove the 'isPublished' check here because we filtered in the API call
          const volume = issue.volume || 0; 
          
          if (!groups.has(volume)) {
            groups.set(volume, []);
          }
          groups.get(volume).push(issue);
        });

        const groupedArray = Array.from(groups.entries()).sort((a, b) => b[0] - a[0]);
        
        setGroupedIssues(groupedArray);
        setLoading(false);

      } catch (err) {
        console.log("Error loading issues from OJS:", err);
        setLoading(false);
      }
    };

    fetchAllIssues();
  }, []);

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 text-gray-800 min-h-screen">
      <Navbar />
      
      <section className="relative bg-gray-800 text-white py-20 px-4 md:px-20">
        <div className="max-w-5xl mx-auto mt-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold" data-aos="fade-down">
            <span className="text-orange-400">Archive</span>
          </h1>
        </div>
      </section>

      <section className="py-12 px-4 md:px-20">
        {/* Added the loading state check */}
        {loading ? (
          <p className="col-span-full text-center text-gray-500">Loading issues...</p>
        ) : groupedIssues.length > 0 ? (
          groupedIssues.map(([volumeNumber, issuesArray]) => (
            <div key={volumeNumber} className="mb-12">
              <h2 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2">
                VOLUME {volumeNumber} – {issuesArray[0].year}
              </h2>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {issuesArray.map((issue) => (
                  <Link
                    key={issue.id}
                    to={`/issue/${issue.id}`} // This matches your new IssueView.jsx
                    className="bg-blue-400 text-white py-2 px-4 rounded shadow hover:bg-blue-500 text-center"
                  >
                    {/* This shows the full issue title, e.g., "Volume 1, Issue 1" */}
                    {(issue.title && issue.title.en) || `Issue ${issue.number}`}
                  </Link>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No archived issues found.
          </p>
        )}
      </section>

      <Foot />
    </div>
  );
};

export default ArchivePage;