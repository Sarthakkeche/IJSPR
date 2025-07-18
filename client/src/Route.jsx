import { useRoutes } from "react-router-dom";
import Home from './Components/Home';
import AboutUsContent from "./Components/About";
import ContactUsContent  from "./Components/ContactUs";
import EditorialBoard from "./Components/Eboard";
import GuidelinesContent from "./Components/AuthorGuidelines";
import InfoAuthors from "./Components/InfoAuthor";
import ScrollToTop from "./ScrollToTop";

const RoutesConfig = () => {
  return useRoutes([
    { path: "/", element: <Home /> },
    { path:"/about", element:<AboutUsContent/>},
    { path:"/contact",element:<ContactUsContent/>},
    {path:"/Eboard",element:<EditorialBoard/>},
    {
      path:"/subguide",element:<GuidelinesContent/>
    },
    {
      path:"/InfoAuthors",element:<InfoAuthors/>
    },
    
    

  ]);
};

export default RoutesConfig;

