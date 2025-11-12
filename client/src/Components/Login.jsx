import React, { useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("https://api.ijrws.com/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      setLoading(false);

      if (result.status === "success") {
        localStorage.setItem("ijrws_user", JSON.stringify(result.user));
        setStatus({ type: "success", message: "Login successful! Redirecting..." });
        setTimeout(() => {
          window.location.href = "/account";
        }, 1200);
      } else {
        setStatus({ type: "error", message: result.message });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Server error. Please try again." });
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 min-h-screen">
      <Navbar />

      <section className="py-20 px-6 md:px-20">
        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-8 border border-gray-200" data-aos="fade-up">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-6">
            Welcome Back to <span className="text-orange-500">IJRWS</span>
          </h2>

          {status && (
            <div
              className={`text-center mb-4 px-4 py-2 rounded ${
                status.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full mt-2 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full mt-2 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white font-semibold py-2 rounded-md hover:bg-orange-600 transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don’t have an account?{" "}
            <a href="/register" className="text-blue-600 font-medium hover:underline">
              Register now
            </a>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Login;
