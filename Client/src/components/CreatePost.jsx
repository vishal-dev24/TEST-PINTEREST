import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import img from "../assets/pin.ico";

const CreatePost = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: "", description: "", image: null, userId: "" })

  const BASE_URL = "https://test-pinterest.onrender.com"; // local testing ke liye comment/uncomment karo

  // Fetch logged-in user details (including userId)
  useEffect(() => {
    axios.get(`${BASE_URL}/profile`, { withCredentials: true })
      .then(res => {
        if (res.data.success) {
          setFormData(prev => ({ ...prev, userId: res.data.user._id })); // ✅ Set userId
        } else {
          navigate("/login");
        }
      })
      .catch(() => navigate("/login"));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userId) {
      console.error("Error: userId is missing!");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("image", formData.image);
    data.append("userId", formData.userId); // ✅ Send userId

    try {
      await axios.post(`${BASE_URL}/posts/create`, data, { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } })
      setFormData({ title: "", description: "", image: null, userId: formData.userId });
      navigate("/pins");
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <div className="bg-gray-200 min-h-screen flex flex-col">

      {/* Navbar */}
      <nav className="bg-white shadow-lg p-3 sticky top-0 z-50 w-full">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-4">

          <button
            onClick={() => navigate("/home")}
            className="text-2xl font-extrabold flex items-center space-x-2"
          >
            <img
              src={img}
              alt="Pinterest Icon"
              className="w-10 h-10 rounded-full shadow-md"
            />
            <span className="tracking-wide text-gray-800">Phinix</span>
          </button>

          <div className="flex space-x-3 items-center font-semibold">
            <button
              onClick={() => navigate("/Pins")}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Pins
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Profile
            </button>
          </div>
        </div>
      </nav>

      {/* Center Section */}
      {/* <div className="flex flex-1 justify-center items-center px-4 py-10">
        <div className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-8">

          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Create a New PIN
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-300 capitalize focus:ring-2 focus:ring-gray-700 outline-none"
                placeholder="Enter post title"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full p-3 rounded-lg border border-gray-300 capitalize focus:ring-2 focus:ring-gray-700 outline-none"
                placeholder="Write something about this post"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Upload Image
              </label>
              <input
                type="file"
                name="image"
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition duration-300 shadow-md"
            >
              Create Pin
            </button>

          </form>
        </div>
      </div> */}
      {/* Center Section */}
      <div className="flex flex-1 justify-center items-center px-8 ">
        <div className="w-full max-w-sm bg-white shadow-xl rounded-2xl p-7">

          <h2 className="text-xl font-bold text-gray-900 text-center mb-5">
            Create a New PIN
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">

            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2.5 rounded-lg border border-gray-300 capitalize focus:ring-2 focus:ring-gray-700 outline-none text-sm"
                placeholder="Enter post title"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full p-2.5 rounded-lg border border-gray-300 capitalize focus:ring-2 focus:ring-gray-700 outline-none text-sm"
                placeholder="Write something about this post"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm">
                Upload Image
              </label>
              <input
                type="file"
                name="image"
                onChange={handleChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-700 outline-none text-sm"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-700 text-white font-bold py-2.5 rounded-lg transition duration-300 shadow-md text-sm"
            >
              Create Pin
            </button>

          </form>
        </div>
      </div>

    </div>

  );
};

export default CreatePost;