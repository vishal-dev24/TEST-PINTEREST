import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import img from "../assets/pin.ico";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [boards, setBoards] = useState([]);
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [showCreateBoardModal, setShowCreateBoardModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ username: "", image: null });

  const BASE_URL = "https://test-pinterest.onrender.com"; // local testing ke liye comment/uncomment karo

  useEffect(() => {
    axios.get(`${BASE_URL}/profile`, { withCredentials: true })
      .then(res => {
        if (res.data.success) {
          setUser(res.data.user);
          setFormData({ username: res.data.user.username, image: res.data.user.image });

          // 🟢 Fetch boards only after user data is available
          axios.get(`${BASE_URL}/boards/user/${res.data.user._id}`, { withCredentials: true })
            .then(res => setBoards(res.data.boards))
            .catch(err => console.error("Error fetching boards:", err));
        } else {
          navigate('/login');
        }
      })
      .catch(() => navigate('/login'));
  }, []);

  const createBoard = () => {
    axios.post(`${BASE_URL}/boards`, { name: newBoardName }, { withCredentials: true })
      .then((res) => {
        const newBoard = res.data.board; // Naya board jo API se aaya
        setBoards(prevBoards => [newBoard, ...prevBoards]); // Naya board state me add karo
        setShowCreateBoardModal(false);
        setNewBoardName("");
      })
      .catch(err => console.error(err));
  };

  const handleUpdate = () => {
    const data = new FormData();
    data.append("username", formData.username);
    if (formData.image) data.append("image", formData.image);

    axios.post(`${BASE_URL}/profile/update`, data, { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          setUser({
            ...user,
            ...formData,
            image: formData.image ? `${res.data.user.image}?t=${Date.now()}` : user.image
          });
          setIsModalOpen(false);
          console.log("// Updated user:", JSON.stringify(res.data.user, null, 2));
        }
      })
      .catch(err => console.error("Error updating profile:", err));
  };


  return (
    <div className="dark:bg-gray-900  min-h-screen pb-10">

      {/* Navbar */}
      <nav className="bg-gray-100 drop-shadow-[0_4px_6px_rgba(255,255,255,0.3)] p-2 sticky top-0 z-50 w-full">
        <div className="flex justify-between items-center px-1">

          <button onClick={() => navigate("/home")} className="text-3xl font-extrabold flex items-center space-x-1">
            <img src={img} alt="Pinterest Icon" className="w-12 h-12 rounded-full shadow-md" />
            <span className="tracking-wide text-gray-800">Phinix</span>
          </button>

          <div className="flex space-x-2 items-center font-semibold">
            <button onClick={() => navigate("/CreatePost")} className="px-3 py-2 bg-gray-700 text-white rounded-lg">CreatePin</button>
            <button onClick={() => navigate("/Pins")} className="px-3 py-2 bg-gray-700 text-white rounded-lg">Pins</button>
          </div>
        </div>
      </nav>

      {/* Profile Section */}
      <div className="flex justify-center items-center min-h-[40vh] bg-gray-100 dark:bg-gray-900 px-4 py-6 sm:px-6 lg:px-8">
        <div className="relative w-auto max-w-4xl bg-white dark:bg-gray-800 shadow-2xl border-2 border-white/60 rounded-2xl flex flex-col md:flex-row items-center md:items-start p-2 md:space-x-8 space-y-6 md:space-y-0 backdrop-blur-lg p-4 md:p-6 overflow-hidden">

          {/* Profile Image */}
          <div className="flex-shrink-0 w-32 h-32 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-3xl border-4 border-gray-300 dark:border-gray-600 overflow-hidden shadow-md">
            {user && (
              <img src={user.image} alt="User" className="w-full h-full object-cover" />
            )}
          </div>

          <div className="flex flex-col space-y-2 w-full text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-3xl font-bold text-gray-900 dark:text-white break-words">{user?.username}</h2>
            <p className="text-gray-500 dark:text-gray-300 text-sm sm:text-lg">@{user?.email.split("@")[0]}</p>

            <p className="text-gray-700 dark:text-gray-400 text-sm sm:text-lg italic break-words"> "Make every moment count."</p>

            {/* Followers & Following */}
            <div className="flex justify-center md:justify-start space-x-6 mt-2 text-gray-800 dark:text-gray-300">
              <div className="text-center">
                <p className="text-xl sm:text-2xl md:text-2xl font-bold">320</p>
                <p className="text-sm sm:text-lg">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl md:text-2xl font-bold">150</p>
                <p className="text-sm sm:text-lg">Following</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-4 flex flex-row flex-nowrap justify-center md:justify-start gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-700 text-white font-semibold text-sm sm:text-base rounded-lg shadow-lg hover:scale-105 hover:from-teal-600 hover:to-teal-800 transition-transform duration-200">
                Edit
              </button>

              <button
                onClick={() => axios.get(`${BASE_URL}/logout`, { withCredentials: true }).then(() => navigate("/login"))}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold text-sm sm:text-base rounded-lg shadow-lg hover:scale-105 hover:from-red-600 hover:to-red-800 transition-transform duration-200">
                Logout
              </button>

              <button
                onClick={() => navigate("/Dashboard")}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-700 text-white font-semibold text-sm sm:text-base rounded-lg shadow-lg hover:scale-105 hover:from-teal-600 hover:to-teal-800 transition-transform duration-200">
                Dashboard
              </button>
            </div>

          </div>
        </div>
      </div>


      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4 animate-fadeIn">
          <div className="bg-gray-900 text-gray-100 rounded-3xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 shadow-2xl transform transition-transform duration-300 scale-95 animate-scaleUp">

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-center">Edit Profile</h2>

            {/* Username Input */}
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="New Username"
              className="w-full bg-gray-800 text-gray-100 border border-gray-600 p-3 rounded-lg mb-5 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1 transition"
            />

            {/* File Input */}
            <label className="w-full mb-6 cursor-pointer">
              <div className="w-full bg-gradient-to-r from-emerald-400 to-sky-700 text-white text-center py-3 mb-3 rounded-lg shadow-lg hover:scale-105 transition-transform duration-200">Choose Profile Image
              </div>
              <input
                type="file"
                onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                className="hidden"
              />
            </label>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-gradient-to-r from-green-700 to-teal-600 text-white font-semibold rounded-lg shadow-lg hover:scale-105 hover:from-green-600 hover:to-teal-700 transition-transform duration-200"
              >
                Update
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gradient-to-l from-purple-900 to-red-400 text-white font-semibold rounded-lg shadow-lg hover:scale-105 hover:from-red-600 hover:to-cyan-600 transition-transform duration-200"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* User Boards */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-4 ">
        {/* Header */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 shadow-md p-3 sm:p-4 rounded-xl border dark:border-gray-700 gap-3 sm:gap-0">
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white uppercase">
            All Boards ⇾
          </p>
          <button
            onClick={() => { setShowBoardModal(false); setShowCreateBoardModal(true); }}
            className="text-sm sm:text-base md:text-base text-white bg-gradient-to-r from-blue-500 to-indigo-600 px-3 sm:px-4 py-2 rounded-lg shadow-md hover:scale-105 transform transition"
          >
            + Create New Board
          </button>
        </div>




        {/* Boards Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {boards.length > 0 ? boards.map((board) => (
            <div key={board._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 hover:shadow-xl transition-all duration-300">

              {/* Navigate to Single Board */}
              <div
                onClick={() => navigate(`/SingleBoard/${board._id}`)}
                className="cursor-pointer rounded-xl overflow-hidden relative group transition-all hover:scale-[1.03]"
              >
                <div className="grid grid-cols-2 bg-gray-200 dark:bg-gray-700 rounded-xl">
                  {board.posts.slice(0, 3).map((post, idx) => (
                    <img
                      key={idx}
                      src={post.image}
                      alt={post.title}
                      className={`w-full object-cover rounded-md transition-all duration-300 ${idx === 1 ? 'row-span-2 h-48 border' : 'h-24 border-2'}`}
                    />
                  ))}
                </div>

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                  <p className="text-white text-lg font-bold">View Board</p>
                </div>
              </div>

              {/* Board Name & Actions */}
              <div className="flex justify-between mt-3 items-center">
                <div className="flex flex-col">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white capitalize">{board.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{board.posts.length} Pins</p>
                </div>
              </div>
            </div>
          )) : <p className="text-center text-gray-500 dark:text-gray-300">No boards yet.</p>}
        </div>
      </div>

      {showCreateBoardModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-3">Create New Board</h2>
            <form onSubmit={(e) => { e.preventDefault(); createBoard(); }}>
              <input
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Board Name"
                className="w-full border p-2 rounded-lg capitalize"
                required
              />
              <button type="submit" className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg">Create</button>
              <button type="button" onClick={() => setShowCreateBoardModal(false)} className="mt-3 text-red-500 block">Cancel</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Profile;