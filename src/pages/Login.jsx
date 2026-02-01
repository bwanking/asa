import React, { useState } from 'react';
// Import your firebase auth and database if needed
// import { auth } from '../firebase'; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in with:", email);
    // Add your Firebase sign-in logic here
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 border-t-4 border-blue-900">
        <h1 className="text-2xl font-black text-blue-900 text-center mb-6">UGANDA DIGITAL ACADEMY</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="teacher@uda.ac.ug"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-900 text-white font-bold py-2 rounded hover:bg-blue-800 transition shadow-md"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

// THIS IS THE LINE THAT FIXES YOUR VERCEL BUILD ERROR
export default Login;
