import './App.css';
import { BrowserRouter } from "react-router-dom";
import RoutesConfig from "./Route.jsx";
import ScrollToTop from "./ScrollToTop";
import { AuthProvider } from "./Components/AuthContext"; // ✅ Import Auth Context Provider

function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <RoutesConfig />
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
