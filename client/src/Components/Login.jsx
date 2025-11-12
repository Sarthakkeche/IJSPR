import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "./AuthContext"; // ✅ import context

const API_URL = "https://api.ijrws.com/login.php";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ use context login

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setStatus("❌ Please enter both email and password.");
      return;
    }

    setLoading(true);
    setStatus("⏳ Logging in...");

    try {
      const response = await axios.post(
        API_URL,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("✅ Login response:", response.data);

      if (response.data.status === "success") {
        login(response.data.user); // ✅ updates AuthContext + localStorage
        setStatus("✅ Login successful! Redirecting...");
        setTimeout(() => navigate("/account"), 1000); // ✅ redirect
      } else {
        setStatus(response.data.message || "❌ Invalid credentials.");
      }
    } catch (error) {
      console.error("❌ Login failed:", error);
      setStatus("❌ Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 text-gray-800">
      <Navbar />

      <section
        className="relative bg-blue-900 mt-32 text-white py-20 px-4 md:px-20 overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(rgba(14,12,12,0.85),rgba(36,33,33,0.85)), url('https://ijrws.com/assets/login-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold">
            Author <span className="text-orange-400">Login</span>
          </h1>
          <p className="mt-4 text-lg">
            Access your IJRWS account and manage your papers.
          </p>
        </div>
      </section>

      <section className="px-6 md:px-20 py-16 bg-white">
        <div
          data-aos="fade-up"
          className="max-w-md mx-auto bg-white p-8 shadow-lg rounded-xl border"
        >
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-600">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-600">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white px-6 py-3 rounded-lg transition font-semibold ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-700 hover:bg-blue-800"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {status && (
              <p
                className={`text-center font-medium ${
                  status.startsWith("✅")
                    ? "text-green-600"
                    : status.startsWith("❌")
                    ? "text-red-600"
                    : "text-gray-700"
                }`}
              >
                {status}
              </p>
            )}
          </form>

          <p className="mt-6 text-center text-sm">
            Don’t have an account?{" "}
            <a
              href="/register"
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Register here
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Login;
