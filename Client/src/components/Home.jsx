import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import img from "../assets/pin.ico";
import lg from "../assets/lg.png";

const Home = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [boards, setBoards] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showBoardModal, setShowBoardModal] = useState(false);
    const [showCreateBoardModal, setShowCreateBoardModal] = useState(false);
    const [newBoardName, setNewBoardName] = useState("");

    useEffect(() => {
        axios.get("https://test-pinterest.onrender.com/profile", { withCredentials: true })
            .then((res) => res.data.success ? setUser(res.data.user) : navigate("/login"));

        axios.get("https://test-pinterest.onrender.com/posts")
            .then((res) => setPosts(res.data.posts))
            .catch(err => console.error(err));
    }, []);

    const openBoardModal = (postId) => {
        setSelectedPost(postId);
        setShowBoardModal(true);
        axios.get("https://test-pinterest.onrender.com/boards", { withCredentials: true })
            .then((res) => { setBoards(res.data.boards) })
            .catch(err => console.error(err));
    };

    const createBoard = () => {
        axios.post("https://test-pinterest.onrender.com/boards", { name: newBoardName }, { withCredentials: true })
            .then(() => {
                setShowCreateBoardModal(false);
                setNewBoardName("");
                openBoardModal(selectedPost);
            })
            .catch(err => console.error(err));
    };

    const saveToBoard = (boardId) => {
        axios.post(`https://test-pinterest.onrender.com/boards/${boardId}/save`, { postId: selectedPost }, { withCredentials: true })
            .then(() => setShowBoardModal(false))
            .catch(err => console.error(err));
    };

    //  download
    const handleDownload = async (imageUrl, title) => {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = title || "download";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen">
            {/* Navbar */}
            <nav className=" bg-white shadow-xl p-2 sticky top-0 z-50 w-full">
                <div className="flex justify-between items-center px-1">
                    <button onClick={() => navigate("/home")} className="text-3xl font-extrabold flex items-center space-x-1">
                        <img src={img} alt="Pinterest Icon" className="w-12 h-12 rounded-full shadow-md" />
                        <span className="tracking-wide text-gray-800">Phinix</span>
                    </button>
                    <div className="flex space-x-2 items-center text-white">
                        {user && (
                            <img src={user.image} alt="User" className="w-12 h-12 border-2  border-slate-200 rounded-full" />
                        )}
                        <button onClick={() => navigate("/profile")} className="px-3 py-2 bg-gray-700 font-bold rounded-lg">Profile</button>
                    </div>
                </div>
            </nav>
            {/* Masonry Grid Layout */}
            <div className="p-5 columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 space-y-4">
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <div key={post._id} className="relative group break-inside-avoid bg-white shadow-lg rounded-lg overflow-hidden">
                            <img src={post.image} alt={post.title} className="w-full object-cover rounded-t-lg" />
                            <button className="absolute top-2 right-2 bg-slate-900 text-white px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition" onClick={() => openBoardModal(post._id)}> Save </button>
                            {/* Download */}
                            <img src={lg} onClick={() => handleDownload(post.image, post.title)}
                                className="absolute right-2 bottom-2 opacity-0 bg-white p-1 rounded-full shadow-lg group-hover:opacity-100 transition duration-300 hover:scale-110 hover:bg-gray-200 cursor-pointer" />
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 col-span-full">No posts found.</p>
                )}
            </div>

            {/* Save to Board Modal */}
            {showBoardModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-5 rounded-lg shadow-lg w-80">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Save to Board</h2>

                        {boards.length > 0 ? (
                            boards.map((board) => (
                                <button
                                    key={board._id}
                                    onClick={() => saveToBoard(board._id)}
                                    className="flex items-center w-full py-2 px-3 mb-2 rounded-lg border-2 border-gray-300 bg-gray-100 hover:bg-gray-800 hover:text-white transition-all"
                                >
                                    {/* BOARD IMAGE / THUMBNAIL */}
                                    {board.posts.length > 0 ? (
                                        <img
                                            src={board.posts[0].image}  // Cloudinary URL direct
                                            alt={board.name}
                                            className="w-14 h-14 rounded-lg border border-gray-400 mr-4 object-cover"
                                        />
                                    ) : (
                                        <img
                                            src="https://placehold.co/100x100?text=No+Image"
                                            className="w-14 h-14 rounded-lg object-cover"
                                        />

                                    )}

                                    <span className="text-lg font-semibold capitalize">
                                        {board.name}
                                    </span>
                                </button>
                            ))
                        ) : (
                            <p className="text-gray-500">No boards found.</p>
                        )}

                        {/* Buttons */}
                        <div className="flex justify-between mt-4">
                            <button
                                onClick={() => {
                                    setShowBoardModal(false);
                                    setShowCreateBoardModal(true);
                                }}
                                className="px-3 py-2 bg-slate-300 text-blue-900 rounded-lg font-semibold hover:bg-blue-600 hover:text-white"
                            >
                                + Create Board
                            </button>

                            <button
                                onClick={() => setShowBoardModal(false)}
                                className="px-3 py-2 bg-red-300 text-red-900 rounded-lg font-semibold hover:bg-red-600 hover:text-white"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create New Board Modal */}
            {showCreateBoardModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-5 rounded-lg shadow-lg w-80">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Create New Board</h2>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                createBoard();
                            }}
                        >
                            <input
                                type="text"
                                value={newBoardName}
                                onChange={(e) => setNewBoardName(e.target.value)}
                                placeholder="Board Name"
                                className="w-full border p-2 rounded-lg capitalize mb-3"
                                required
                            />

                            <button
                                type="submit"
                                className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                            >
                                Create
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowCreateBoardModal(false)}
                                className="w-full mt-3 text-red-600 font-semibold hover:text-red-800"
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Home;