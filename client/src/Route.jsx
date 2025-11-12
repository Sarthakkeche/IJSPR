// client/src/RoutesConfig.jsx
import { useRoutes, Navigate } from "react-router-dom";
import { useAuth } from "./Components/AuthContext";  // ✅ Import AuthContext

// --- Existing Pages ---
import Home from "./Components/Home";
import AboutUsContent from "./Components/About";
import ContactUsContent from "./Components/ContactUs";
import EditorialBoard from "./Components/Eboard";
import GuidelinesContent from "./Components/AuthorGuidelines";
import InfoAuthors from "./Components/InfoAuthor";
import ArchivePage from "./Components/Archive";
import CurrentIssuePage from "./Components/Issue";
import SubmitManuscriptPage from "./Components/Submit";
import CheckStatusPage from "./Components/Status";
import IssueView from "./Components/IssueView";
import Account from "./Components/Account";

// --- New Auth Pages ---
import Login from "./Components/Login";
import Register from "./Components/Register";

const RoutesConfig = () => {
  const { user } = useAuth(); // ✅ Get login status from context

  // ✅ ProtectedRoute: redirect to login if not logged in
  const ProtectedRoute = ({ element }) => {
    if (!user) return <Navigate to="/login" replace />;
    return element;
  };

  return useRoutes([
    { path: "/", element: <Home /> },
    { path: "/about", element: <AboutUsContent /> },
    { path: "/contact", element: <ContactUsContent /> },
    { path: "/Eboard", element: <EditorialBoard /> },
    { path: "/subguide", element: <GuidelinesContent /> },
    { path: "/InfoAuthors", element: <InfoAuthors /> },
    { path: "/archive", element: <ArchivePage /> },
    { path: "/currentpage", element: <CurrentIssuePage /> },
    { path: "/issue/:issueId", element: <IssueView /> },

    // --- New Routes ---
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
        { path:"/account", element:<Account />},


    // ✅ Protect Submit & Status pages
    { path: "/submit", element: <ProtectedRoute element={<SubmitManuscriptPage />} /> },
    { path: "/status", element: <ProtectedRoute element={<CheckStatusPage />} /> },
  ]);
};

export default RoutesConfig;
