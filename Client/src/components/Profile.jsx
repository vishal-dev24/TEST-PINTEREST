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

  useEffect(() => {
    axios.get('https://test-pinterest.onrender.com/profile', { withCredentials: true })
      .then(res => {
        if (res.data.success) {
          setUser(res.data.user);
          setFormData({ username: res.data.user.username, image: res.data.user.image });

          // 🟢 Fetch boards only after user data is available
          axios.get(`https://test-pinterest.onrender.com/boards/user/${res.data.user._id}`, { withCredentials: true })
            .then(res => setBoards(res.data.boards))
            .catch(err => console.error("Error fetching boards:", err));
        } else {
          navigate('/login');
        }
      })
      .catch(() => navigate('/login'));
  }, []);

  const deleteBoard = (boardId) => {
    axios.delete(`https://test-pinterest.onrender.com/boards/${boardId}`, { withCredentials: true })
      .then(() => {
        setBoards(boards.filter(board => board._id !== boardId)); // Update state after deletion
      })
      .catch(err => console.error(err));
  };

  const createBoard = () => {
    axios.post("https://test-pinterest.onrender.com/boards", { name: newBoardName }, { withCredentials: true })
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

    axios.put("https://test-pinterest.onrender.com/profile/update", data, { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          setUser({
            ...user,
            username: formData.username,
            image: formData.image ? `${res.data.user.image}?t=${Date.now()}` : user.image
          });
          setIsModalOpen(false);
        }
      })
      .catch(err => console.log("UPDATE ERROR:", err));
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
      <div className="flex justify-center items-center min-h-[50vh] bg-gray-100 dark:bg-gray-900 px-4">
        <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 shadow-2xl  border-2 border-white/60 rounded-2xl flex flex-col md:flex-row items-center p-4 md:p-6 space-y-6 md:space-y-0 md:space-x-8 backdrop-blur-lg">

          {/* Profile Image */}
          <div className="w-24 h-24 md:w-36 md:h-36 rounded-full border-4 border-gray-300 dark:border-gray-600 overflow-hidden shadow-md">
            {user && (<img src={user.image} alt="User" className="w-full h-full object-cover" />)}
          </div>

          {/* User Details */}
          <div className="flex flex-col space-y-1 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">  {user?.username} </h2>
            <p className="text-gray-500 dark:text-gray-300 text-base md:text-lg">    @{user?.email.split("@")[0]}  </p>
            <p className="text-gray-700 dark:text-gray-400 text-sm md:text-lg italic"> "Make every moment count." </p>

            {/* Followers / Following */}
            <div className="flex justify-center md:justify-start space-x-6 mt-2 text-gray-800 dark:text-gray-300">
              <div className="text-center">
                <p className="text-xl md:text-2xl font-bold">320</p>
                <p className="text-sm md:text-lg">Followers</p>
              </div>

              <div className="text-center">
                <p className="text-xl md:text-2xl font-bold">150</p>
                <p className="text-sm md:text-lg">Following</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-4 flex justify-center md:justify-start space-x-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-1.5 md:px-5 md:py-2 bg-teal-600 text-white 
              font-semibold md:font-bold text-sm md:text-lg rounded-lg shadow-md 
              hover:bg-teal-700 transition"
              >
                Edit
              </button>

              <button
                onClick={() =>
                  axios.get("https://test-pinterest.onrender.com/logout", { withCredentials: true })
                    .then(() => navigate("/login"))
                }
                className="px-4 py-1.5 md:px-5 md:py-2 bg-red-500 text-white 
              font-semibold md:font-bold text-sm md:text-lg rounded-lg shadow-md 
              hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* USER UPDATE MODEL */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-gray-800 text-gray-100 rounded-xl w-full max-w-xs p-5">
            <h2 className="text-xl font-semibold mb-4 text-center">Edit Profile</h2>
            <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full bg-gray-700 text-gray-100 border border-gray-600 p-2 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="New Username" />
            <input type="file" onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })} className="w-full text-gray-100 mb-4" />
            <div className="flex justify-end gap-2">
              <button onClick={handleUpdate} className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded font-medium">Update</button>
              <button onClick={() => setIsModalOpen(false)} className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}


      {/* {/* User Boards */}
      {/* User Boards */}
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 mt-6">

        {/* Header */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-800  shadow-md p-2 sm:p-3 rounded-xl border dark:border-gray-700">
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white uppercase">  All Boards ⇾ </p>
          <button onClick={() => { setShowBoardModal(false); setShowCreateBoardModal(true); }}
            className="text-white bg-gradient-to-r from-blue-500 to-indigo-600  px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base shadow-md  hover:scale-105 transition"> + Create New Board
          </button>
        </div>

        {/* Boards Grid */}
        <div className="mt-6  grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">

          {boards.length > 0 ? boards.map((board) => (
            <div key={board._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg   p-2 sm:p-3 hover:shadow-xl transition-all duration-300">

              {/* Navigate to Single Board */}
              <div
                onClick={() => navigate(`/SingleBoard/${board._id}`)}
                className="cursor-pointer rounded-xl overflow-hidden relative group   transition-all hover:scale-[1.03]"  >
                <div className="grid grid-cols-2 gap-1 bg-gray-200 dark:bg-gray-700 rounded-xl">
                  {board.posts.slice(0, 3).map((post, idx) => (
                    <img key={idx} src={post.image} alt={post.title} className={` w-full object-cover rounded-md transition-all duration-300 ${idx === 1 ? 'row-span-2 h-28 sm:h-32' : 'h-14 sm:h-16'} `} />))}
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0   group-hover:opacity-100 transition-all flex items-center justify-center">
                  <p className="text-white text-sm sm:text-lg font-bold">View Board</p>
                </div>
              </div>

              {/* Board Name + Actions */}
              <div className="flex justify-between mt-2 sm:mt-3 items-center">
                <div className="flex flex-col">
                  <h3 className="text-sm sm:text-md font-semibold text-gray-900 dark:text-white capitalize">
                    {board.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {board.posts.length} Pins
                  </p>
                </div>

                <button
                  onClick={() => deleteBoard(board._id)}
                  className="bg-red-500 text-white px-2 sm:px-3 py-1 rounded-lg 
              text-xs sm:text-sm shadow-md hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          )) : (
            <p className="text-center text-gray-500 dark:text-gray-300 col-span-full">
              No boards yet.
            </p>
          )}
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