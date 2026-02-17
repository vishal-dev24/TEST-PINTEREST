import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import img from "../assets/pin.ico";
import imageCompression from "browser-image-compression";

const CreatePost = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: "", description: "", image: null, userId: "" })
  const [loading, setLoading] = useState(false);

  const BASE_URL = "https://test-pinterest.onrender.com";

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

  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    if (files) {
      try {
        const compressedFile = await imageCompression(files[0], {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });

        setFormData((prev) => ({ ...prev, [name]: compressedFile }));
      } catch (error) {
        console.error("Image compression error:", error);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userId) return;

    setLoading(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("image", formData.image);

    try {
      await axios.post(`${BASE_URL}/posts/create`, data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" }
      });

      navigate("/pins");
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-200 min-h-screen flex flex-col">

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white mt-4 text-lg font-semibold">
            Creating Post...
          </p>
        </div>
      )}


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
              <label className="block text-gray-700 font-medium mb-1 text-sm"> Upload Image </label>
              <input type="file" name="image" onChange={handleChange} required
                className="w-full text-sm p-2 border border-gray-400 rounded-lg text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-900 file:text-white hover:file:bg-gray-700 cursor-pointer focus:ring-2 focus:ring-gray-600 outline-none" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white font-bold py-2.5 rounded-lg transition duration-300 shadow-md text-sm
    ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-gray-900 hover:bg-gray-700"}`}
            >
              {loading ? "Creating..." : "Create Pin"}
            </button>

          </form>
        </div>
      </div>


    </div>

  );
};

export default CreatePost;