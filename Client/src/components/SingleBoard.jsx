import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import img from "../assets/pin.ico";
import lg from "../assets/lg.png";

const SingleBoard = () => {
    const { boardId } = useParams();
    const navigate = useNavigate();
    const [board, setBoard] = useState(null);
    const [boards, setBoards] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showBoardModal, setShowBoardModal] = useState(false);

    // Fetch board details
    const fetchBoard = async () => {
        try {
            const res = await axios.get(`https://test-pinterest.onrender.com/boards/${boardId}`, { withCredentials: true });
            if (res.data.success) setBoard(res.data.board);
        } catch (err) {
            console.error(err);
        }
    };

    // Fetch user's boards once
    const fetchBoards = async () => {
        try {
            const res = await axios.get("https://test-pinterest.onrender.com/boards", { withCredentials: true });
            if (res.data.success) setBoards(res.data.boards);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchBoard();
        fetchBoards();
    }, [boardId]);

    const openBoardModal = (postId) => {
        setSelectedPost(postId);
        setShowBoardModal(true);
    };

    const saveToBoard = async (boardId) => {
        try {
            await axios.post(
                `https://test-pinterest.onrender.com/boards/${boardId}/save`,
                { postId: selectedPost },
                { withCredentials: true }
            );
            setShowBoardModal(false);
            alert("Pin saved to board!");
            fetchBoard(); // Refresh pins
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to save pin");
        }
    };

    const deletePost = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this pin?")) return;
        try {
            await axios.delete(`https://test-pinterest.onrender.com/boards/${boardId}/posts/${postId}`, { withCredentials: true });
            setBoard((prev) => ({
                ...prev,
                posts: prev.posts.filter((p) => p._id !== postId)
            }));
        } catch (err) {
            console.error(err);
            alert("Failed to delete pin");
        }
    };

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

    if (!board) return <div className="text-center mt-10">Loading...</div>;

    return (
        <div className="bg-white min-h-screen">
            {/* Navbar */}
            <nav className="bg-white shadow-lg p-2 sticky top-0 z-50 w-full">
                <div className="flex justify-between items-center px-1">
                    <button onClick={() => navigate("/home")} className="text-3xl font-extrabold flex items-center space-x-1">
                        <img src={img} alt="Pinterest Icon" className="w-12 h-12 rounded-full shadow-md" />
                        <span className="tracking-wide text-gray-800">Phinix</span>
                    </button>
                    <div className="flex space-x-2 items-center font-semibold">
                        <button onClick={() => navigate("/Pins")} className="px-3 py-2 bg-gray-700 text-white rounded-lg">Pins</button>
                        <button onClick={() => navigate("/profile")} className="px-3 py-2 bg-gray-700 text-white rounded-lg">Profile</button>
                    </div>
                </div>
            </nav>

            {/* Board Header */}
            <div className="p-5">
                <h2 className="text-3xl text-gray-800 font-bold ms-5">{board.name}</h2>
                <p className="text-gray-600 ms-5">{board.posts.length} {board.posts.length === 1 ? "pin" : "pins"}</p>

                {/* Masonry Grid */}
                <div className="p-5 columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 space-y-4">
                    {board.posts.map((post) => (
                        <div key={post._id} className="relative group break-inside-avoid bg-white border border-gray-400 shadow-lg rounded-lg overflow-hidden">
                            <img src={post.image} alt={post.title} className="w-full object-cover rounded-t-lg" />
                            <div className="px-2 py-1">
                                <h2 className="text-md font-bold capitalize">{post.title}</h2>
                                <p className="text-gray-600 text-sm capitalize">{post.description}</p>
                            </div>

                            {/* Download */}
                            <img src={lg} onClick={() => handleDownload(post.image, post.title)} className="absolute right-2 bottom-0 opacity-0 p-1 rounded mb-1 group-hover:opacity-100 transition cursor-pointer" />

                            {/* Save */}
                            <button className="absolute top-2 right-2 bg-slate-900 text-white px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition" onClick={() => openBoardModal(post._id)}>Save</button>

                            {/* Delete */}
                            <button className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition" onClick={() => deletePost(post._id)}>Delete</button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Save to Board Modal */}
            {showBoardModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-5 rounded-lg shadow-lg w-80">
                        <h2 className="text-xl font-bold mb-3">Save to Board</h2>
                        {boards.length > 0 ? (
                            boards.map((board) => (
                                <button key={board._id} className="flex items-center w-full py-1 px-4 bg-gray-100 border-2 border-zinc-400 rounded-lg mb-2 hover:bg-gray-800 hover:text-white" onClick={() => saveToBoard(board._id)}>
                                    {board.posts.length > 0 ? (
                                        <img src={board.posts[0].image} alt={board.name} className="w-12 h-12 rounded-lg border-slate-600 border mr-3" />
                                    ) : (
                                        <img src="https://via.placeholder.com/50" className="w-12 h-12 rounded-lg mr-3" />
                                    )}
                                    <h2 className="text-lg font-bold">{board.name}</h2>
                                </button>
                            ))
                        ) : (
                            <p className="text-gray-500">No boards found.</p>
                        )}
                        <button onClick={() => setShowBoardModal(false)} className="mt-2 w-full bg-red-500 text-white rounded-lg py-1 hover:bg-red-600">Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SingleBoard;
