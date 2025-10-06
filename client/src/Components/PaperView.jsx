import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Helmet } from "react-helmet";
import Navbar from "./Navbar";
import Foot from "./Footer";

export default function PaperView() {
  const { slug } = useParams();
  const [paper, setPaper] = useState(null);

  useEffect(() => {
    axios.get(`https://ijspr.onrender.com/api/papers/slug/${slug}`)
      .then(res => setPaper(res.data))
      .catch(err => console.error("Error fetching paper:", err));
  }, [slug]);

  if (!paper) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 min-h-screen text-gray-800 flex flex-col justify-between">
      <Navbar />
      <div className="max-w-3xl mx-auto mt-40 py-16 px-4">
        <Helmet>
          <title>{paper.title} | IJRWS Journal</title>
          <meta name="description" content={`Research paper by ${paper.Author}`} />
          <meta name="keywords" content={`${paper.title}, ${paper.Author}, IJRWS, Research`} />
          <link rel="canonical" href={`https://ijrws.com/paper/view/${paper.slug}`} />
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ScholarlyArticle",
              "headline": paper.title,
              "author": paper.Author,
              "url": `https://ijrws.com/paper/view/${paper.slug}`,
              "publisher": "IJRWS Journal",
              "datePublished": new Date(paper.createdAt).toISOString()
            })}
          </script>
        </Helmet>

        <h1 className="text-2xl font-bold mb-2 text-center">{paper.title}</h1>
        <p className="text-center text-gray-600 mb-4">Author: {paper.Author}</p>
        <p className="text-center text-gray-500 mb-6">{paper.Date}</p>

        <div className="flex justify-center">
          <a
            href={paper.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Download Full Paper
          </a>
        </div>
      </div>
      <Foot />
    </div>
  );
}
