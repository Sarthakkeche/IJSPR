import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AOS from "aos";
import "aos/dist/aos.css";
import bg3 from "../assets/abg.jpg";

const Account = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 800 });
    const storedUser = localStorage.getItem("ijrws_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      window.location.href = "/login"; // redirect if not logged in
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("ijrws_user");
    window.location.href = "/login";
  };

  if (!user) return null; // Prevent flicker during load

  return (
    <div className="bg-gradient-to-b from-white to-blue-50 text-gray-800 text-justify min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section
        className="relative bg-blue-900 text-white py-20 mt-33 px-4 md:px-20 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(14, 12, 12, 0.85), rgba(36, 33, 33, 0.85)), url(${bg3})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
        }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold" data-aos="fade-down">
            Welcome, <span className="text-orange-400">{user.name}</span>
          </h1>
          <p className="mt-4 text-lg max-w-2xl mx-auto" data-aos="fade-up">
            Manage your account, track your submissions, and stay updated with IJRWS.
          </p>
        </div>
      </section>

      {/* Account Section */}
      <section className="py-16 px-4 md:px-20">
        <div
          className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl border border-gray-200 p-8"
          data-aos="fade-up"
        >
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Account Overview</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Profile Info */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-orange-500 mb-2">Profile Information</h3>
              <p><b>Name:</b> {user.name}</p>
              <p><b>Email:</b> {user.email}</p>
              <p><b>Member Since:</b> {new Date().toLocaleDateString()}</p>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold text-orange-500 mb-2">Quick Actions</h3>
              <div className="flex flex-col gap-3">
                <a
                  href="/submit"
                  className="text-center w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  📤 Submit New Manuscript
                </a>

                <a
                  href="/status"
                  className="text-center w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                >
                  📄 Check Submission Status
                </a>

                <button
                  onClick={handleLogout}
                  className="text-center w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-10 bg-blue-50 p-5 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Need Assistance?</h3>
            <p>
              If you have any issues with your account or submissions, contact our editorial team at{" "}
              <a href="mailto:editorijrwsjournal@gmail.com" className="text-blue-700 font-medium">
                editorijrwsjournal@gmail.com
              </a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Account;
