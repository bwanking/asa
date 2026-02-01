import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // TEMPORARY BYPASS LOGIC:
    // This allows you to enter the system without a live database connection.
    if (email === "admin@uda.ug" && password === "123456") {
      console.log("Login successful! Redirecting to dashboard...");
      navigate('/math-gen'); // Make sure this matches the route in your App.js
    } else {
      setError("Invalid Email or Password. Hint: admin@uda.ug / 123456");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border-t-8 border-blue-900">
        <div className="p-8">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-blue-900 tracking-tighter">
              UGANDA DIGITAL ACADEMY
            </h1>
            <p className="text-sm text-gray-500 font-bold mt-1 uppercase tracking-widest">
              Teacher Portal
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-200 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition"
                placeholder="admin@uda.ug"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none transition"
                placeholder="123456"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-black py-4 rounded-xl shadow-lg transform transition active:scale-95"
            >
              SIGN IN TO PORTAL
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              © 2026 UGANDA DIGITAL ACADEMY • NEW CURRICULUM STANDARDS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
