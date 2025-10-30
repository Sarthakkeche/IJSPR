import { useRoutes } from "react-router-dom";
import Home from './Components/Home';
import AboutUsContent from "./Components/About";
import ContactUsContent from "./Components/ContactUs";
import EditorialBoard from "./Components/Eboard";
import GuidelinesContent from "./Components/AuthorGuidelines";
import InfoAuthors from "./Components/InfoAuthor";
import ArchivePage from "./Components/Archive";
import CurrentIssuePage from "./Components/Issue";
// import PaperPage from "./Components/PagePaper"; // We are not using this file, we are using IssueView
import SubmitManuscriptPage from "./Components/Submit";
import CheckStatusPage from "./Components/Status";
import IssueView from './Components/IssueView'; // This is the correct component

const RoutesConfig = () => {
  return useRoutes([
    { path: "/", element: <Home /> },
    { path: "/about", element: <AboutUsContent /> },
    { path: "/contact", element: <ContactUsContent /> },
    { path: "/Eboard", element: <EditorialBoard /> },
    { path: "/subguide", element: <GuidelinesContent /> },
    { path: "/submit", element: <SubmitManuscriptPage /> },
    { path: "/status", element: <CheckStatusPage /> },
    { path: "/InfoAuthors", element: <InfoAuthors /> },
    { path: "/archive", element: <ArchivePage /> },
    { path: "/currentpage", element: <CurrentIssuePage /> },

    // --- CORRECTIONS ---
    // 1. The path is now "/issue/:issueId" to match the links in ArchivePage.jsx
    // 2. The element is <IssueView /> to match our new component.
    { path: "/issue/:issueId", element: <IssueView /> },

    // 3. DELETED: The line below was a duplicate path for "/" and used a component that wasn't imported.
    // { path: "/", element: <PaperView /> } ,
  ]);
};

export default RoutesConfig;