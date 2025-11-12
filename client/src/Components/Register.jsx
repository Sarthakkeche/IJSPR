import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";

const API_URL = "https://api.ijrws.com/register.php";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setStatus("❌ Please fill all fields.");
      return;
    }

    setLoading(true);
    setStatus("⏳ Registering...");

    try {
      const response = await axios.post(API_URL, form, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("✅ Register response:", response.data);

      if (response.data.status === "success") {
        setStatus("✅ Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setStatus(response.data.message || "❌ Registration failed.");
      }
    } catch (error) {
      console.error("❌ Registration failed:", error);
      setStatus("❌ Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 text-gray-800">
      <Navbar />

      {/* Hero Section */}
      <section
        className="relative bg-blue-900 mt-32 text-white py-20 px-4 md:px-20 overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(rgba(14,12,12,0.85),rgba(36,33,33,0.85)), url('https://ijrws.com/assets/register-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold">
            Create Your <span className="text-orange-400">IJRWS</span> Account
          </h1>
          <p className="mt-4 text-lg">
            Join our global research community and start publishing today.
          </p>
        </div>
      </section>

      {/* Register Form */}
      <section className="px-6 md:px-20 py-16 bg-white">
        <div
          data-aos="fade-up"
          className="max-w-md mx-auto bg-white p-8 shadow-lg rounded-xl border"
        >
          <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">
            Register as Author
          </h2>

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-600">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-600">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
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
                name="password"
                value={form.password}
                onChange={handleChange}
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
              {loading ? "Registering..." : "Register"}
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
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Login here
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Register;
