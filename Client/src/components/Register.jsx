import React, { useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom';
import img from '../assets/pin.ico'

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', password: '', image: null });

  const BASE_URL = "https://test-pinterest.onrender.com";

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // 👈 yaha

    const data = new FormData();
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('image', formData.image);

    await axios.post(`${BASE_URL}/register`, data, { withCredentials: true });

    setLoading(false); // 👈 yaha
    navigate('/login');
  };


  return (
    <div className="min-h-screen w-full bg-gray-100 flex flex-col">

      {/* Navbar */}
      <nav className="w-full bg-white p-3 shadow-md">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-5">
          <button
            onClick={() => navigate("/home")}
            className="text-2xl font-extrabold flex items-center space-x-3"
          >
            <img
              src={img}
              alt="Pinterest Icon"
              className="w-10 h-10 rounded-full shadow-md"
            />
            <span className="tracking-wide text-gray-800">Phinix</span>
          </button>

          <button onClick={() => navigate("/login")}
            className="bg-gray-900 hover:bg-gray-700 font-bold text-white px-4 py-2 rounded-lg transition"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Center Section */}
      <div className="flex flex-1 items-start justify-center px-6 py-16">
        <div className="bg-white p-7 rounded-2xl shadow-lg w-full max-w-sm border border-gray-200">
          <h2 className="text-gray-900 text-3xl font-extrabold text-center mb-6">Join Phinix</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm">Full Name</label>
              <input type="text" name="username" className="w-full p-2.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 outline-none" placeholder="Enter your name" onChange={handleChange} required value={formData.username} />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm">Email</label>
              <input type="email" name="email" className="w-full p-2.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 outline-none" placeholder="Enter your email" onChange={handleChange} required value={formData.email} />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm">Password</label>
              <input type="password" name="password" className="w-full p-2.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-700 outline-none" placeholder="Enter password" onChange={handleChange} required value={formData.password} />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm"> Upload Image </label>
              <input type="file" name="image" onChange={handleChange} required
                className="w-full text-sm p-1 border border-gray-300 rounded-lg text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-900 file:text-white hover:file:bg-gray-700 cursor-pointer focus:ring-2 focus:ring-gray-600 outline-none" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-gray-900 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-lg transition duration-300 shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </div>

  )
}

export default Register


