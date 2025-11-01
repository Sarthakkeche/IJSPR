import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Components/Navbar';
import Foot from '../Components/Footer';

// Get the API URL and Key from Vercel's Environment Variables
const OJS_API_URL = import.meta.env.VITE_OJS_API_URL;
const OJS_API_KEY = import.meta.env.VITE_OJS_API_KEY;

const ArchivePage = () => {
  // We only need one state: an array to hold the issues grouped by volume.
  // The structure will be: [ [volumeNumber, [issue1, issue2]], [volumeNumber, [issue3]] ]
  const [groupedIssues, setGroupedIssues] = useState([]);

  useEffect(() => {
    const fetchAllIssues = async () => {
      if (!OJS_API_URL || !OJS_API_KEY) {
        console.error('OJS API URL or Key is not configured.');
        return;
      }
      
      try {
        // This is the new API call. We fetch ALL issues.
        const res = await axios.get(
          `${OJS_API_URL}/issues`, 
          {
            headers: { 'Authorization': `Bearer ${OJS_API_KEY}` } ,
            params: {
              // We can add parameters to ask OJS to pre-order them for us
              orderBy: 'volume',
              orderDirection: 'DESC' // Newest volumes first
            }
          }
        );

        // --- Grouping Logic ---
        // We will group the flat list of issues by their "volume" number
        const groups = new Map();
        
        res.data.items.forEach(issue => {
          // We only want to show issues that are published
          if (issue.isPublished) {
            const volume = issue.volume || 0; // Group issues with no volume under "0"
            
            if (!groups.has(volume)) {
              groups.set(volume, []);
            }
            groups.get(volume).push(issue);
          }
        });

        // Convert the Map into an array, sorted by volume (descending)
        const groupedArray = Array.from(groups.entries()).sort((a, b) => b[0] - a[0]);
        
        setGroupedIssues(groupedArray);

      } catch (err) {
        console.log("Error loading issues from OJS:", err);
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
        {groupedIssues.length > 0 ? (
          groupedIssues.map(([volumeNumber, issuesArray]) => (
            <div key={volumeNumber} className="mb-12">
              <h2 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2">
                {/* Get the year from the first issue in the group */}
                VOLUME {volumeNumber} – {issuesArray[0].year}
              </h2>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {/* Now map over the issues within this volume's array */}
                {issuesArray.map((issue) => (
                  <Link
                    key={issue.id}
                    // We change this link to point to an "issue" page
                    // We will need to create a route in your App.js for: /issue/:issueId
                    to={`/issue/${issue.id}`}
                    className="bg-blue-400 text-white py-2 px-4 rounded shadow hover:bg-blue-500"
                  >
                    {/* OJS provides a full title, but we can just use the number */}
                    Issue {issue.number}
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