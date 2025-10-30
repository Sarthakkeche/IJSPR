import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Helmet } from "react-helmet";
import Navbar from "./Navbar";
import Foot from "./Footer";

// Get the API URL and Key from Vercel's Environment Variables
const OJS_API_URL = import.meta.env.VITE_OJS_API_URL;
const OJS_API_KEY = import.meta.env.VITE_OJS_API_KEY;

export default function IssueView() {
  // We use issueId, which matches our new route: /issue/:issueId
  const { issueId } = useParams();
  const [issue, setIssue] = useState(null);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!issueId) return;

    const fetchIssueDetails = async () => {
      if (!OJS_API_URL || !OJS_API_KEY) {
        console.error('OJS API URL or Key is not configured.');
        setLoading(false);
        return;
      }
      
      try {
        // New API call: Get a single issue by its ID
        const res = await axios.get(
          `${OJS_API_URL}/issues/${issueId}`, 
          {
            headers: { 'Api-Key': OJS_API_KEY }
          }
        );
        
        // Save the issue data (like title)
        setIssue(res.data);
        // Save the list of papers (called "publications" in OJS)
        setPapers(res.data.publications || []);
        setLoading(false);

      } catch (err) {
        console.error("Error fetching issue:", err);
        setLoading(false);
      }
    };

    fetchIssueDetails();
  }, [issueId]); // Run this effect when the issueId from the URL changes

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center mt-20">Loading...</div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center mt-20">Issue not found.</div>
      </div>
    );
  }

  // Helper function to get the PDF URL from a paper's "galleys"
  const getPdfUrl = (paper) => {
    const pdfGalley = paper.galleys.find(
      (galley) => galley.label === 'PDF' || galley.fileType === 'application/pdf'
    );
    return pdfGalley ? pdfGalley.urlPublished : null;
  };

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 min-h-screen text-gray-800 flex flex-col justify-between">
      <Navbar />
      <div className="max-w-5xl mx-auto mt-40 py-16 px-4 w-full">
        <Helmet>
          <title>{issue.title.en || 'Issue'} | IJRWS Journal</title>
          <meta name="description" content={`View all articles from ${issue.title.en || 'this issue'} of the IJRWS Journal.`} />
          <link rel="canonical" href={`https://ijrws.com/issue/${issue.id}`} />
        </Helmet>

        {/* Issue Header */}
        <h1 className="text-3xl font-bold mb-2 text-center">{issue.title.en || 'Issue'}</h1>
        {issue.description.en && (
           <div 
             className="text-center text-gray-600 mb-10 prose" 
             dangerouslySetInnerHTML={{ __html: issue.description.en }} 
           />
        )}
       
        {/* List of Papers */}
        <div className="space-y-6">
          {papers.length > 0 ? (
            papers.map((paper) => {
              const fileUrl = getPdfUrl(paper);
              return (
                <div key={paper.id} className="bg-white p-6 rounded shadow-lg border border-gray-200">
                  <h2 className="text-xl font-semibold mb-2 text-blue-800">{paper.fullTitle.en || "Title not available"}</h2>
                  <p className="text-sm text-gray-600 mb-2"><strong>Authors:</strong> {paper.authorsString || "Unknown Author"}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    <strong>Published:</strong> {paper.datePublished ? new Date(paper.datePublished).toLocaleDateString() : "Date not provided"}
                  </p>
                  
                  {/* Collapsible Abstract */}
                  {paper.abstract.en && (
                    <details className="mb-4">
                      <summary className="text-sm font-medium text-blue-600 cursor-pointer">View Abstract</summary>
                      <div 
                        className="text-sm text-gray-700 mt-2 prose" 
                        dangerouslySetInnerHTML={{ __html: paper.abstract.en }} 
                      />
                    </details>
                  )}

                  {/* Download Button */}
                  {fileUrl ? (
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                    >
                      Download Full Paper
                    </a>
                  ) : (
                    <span className="inline-block bg-gray-300 text-gray-600 px-6 py-2 rounded cursor-not-allowed">
                      PDF not available
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <p className="col-span-full text-center text-gray-500">
              No papers have been published in this issue yet.
            </p>
          )}
        </div>
        
      </div>
      <Foot />
    </div>
  );
}