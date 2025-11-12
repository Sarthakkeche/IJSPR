import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "./AuthContext";

const Account = () => {
  const { user, logout } = useAuth();

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 text-gray-800 min-h-screen">
      <Navbar />

      <section
        className="relative bg-blue-900 mt-32 text-white py-20 px-4 md:px-20 overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(rgba(14,12,12,0.85),rgba(36,33,33,0.85)), url('https://ijrws.com/assets/account-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold">
            Welcome, <span className="text-orange-400">{user.name}</span>
          </h1>
          <p className="mt-4 text-lg">
            Manage your submissions and track your papers.
          </p>
        </div>
      </section>

      <section className="py-16 px-6 md:px-20">
        <div
          data-aos="fade-up"
          className="max-w-4xl mx-auto bg-white p-8 shadow-lg rounded-xl border"
        >
          <h2 className="text-2xl font-bold text-blue-800 mb-6">
            Account Details
          </h2>

          <p className="mb-2 text-gray-700">
            <b>Name:</b> {user.name}
          </p>
          <p className="mb-6 text-gray-700">
            <b>Email:</b> {user.email}
          </p>

          <button
            onClick={logout}
            className="mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition"
          >
            Logout
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Account;
