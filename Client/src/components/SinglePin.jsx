import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import img from "../assets/pin.ico";
import lg from "../assets/lg.png";

const SinglePin = () => {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [boards, setBoards] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showBoardModal, setShowBoardModal] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const shareRef = useRef(null);
    const openZoom = () => setIsZoomed(true);
    const closeZoom = () => setIsZoomed(false);

    const BASE_URL = "https://test-pinterest.onrender.com";

    // Fetch single post
    useEffect(() => {
        axios
            .get(`${BASE_URL}/posts/${postId}`, { withCredentials: true })
            .then((res) => {
                // console.log("FULL POST DATA 👉", res.data.post);
                setPost(res.data.post);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching post:", err);
                setLoading(false);
            });
    }, [postId]);

    // Click outside Share Popup
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (shareRef.current && !shareRef.current.contains(event.target)) {
                setShowShare(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (loading) return <p className="text-center text-lg mt-10">Loading...</p>;
    if (!post) return <p className="text-center text-red-500 mt-10">Post not found</p>;

    // Open Board Modal
    const openBoardModal = (postId) => {
        setSelectedPost(postId);
        setShowBoardModal(true);
        axios
            .get(`${BASE_URL}/boards`, { withCredentials: true })
            .then((res) => setBoards(res.data.boards))
            .catch((err) => console.error(err));
    };

    // Save to Board
    const saveToBoard = (boardId) => {
        axios
            .post(
                `${BASE_URL}/boards/${boardId}/save`,
                { postId: selectedPost },
                { withCredentials: true }
            )
            .then(() => setShowBoardModal(false))
            .catch((err) => console.error(err));
    };

    // Download Image
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
        <>
            {/* Navbar */}
            <nav className="bg-white shadow-lg p-2 sticky top-0 z-50 w-full">
                <div className="flex justify-between items-center px-1">
                    <button
                        onClick={() => navigate("/home")}
                        className="text-3xl font-extrabold flex items-center space-x-1"
                    >
                        <img src={img} alt="Pinterest Icon" className="w-12 h-12 rounded-full shadow-md" />
                        <span className="tracking-wide text-gray-800">Phinix</span>
                    </button>
                    <div className="flex space-x-2 items-center font-semibold">
                        <button onClick={() => navigate("/CreatePost")} className="px-3 py-2 bg-gray-700 text-white rounded-lg">
                            CreatePin
                        </button>
                        <button onClick={() => navigate("/Pins")} className="px-3 py-2 bg-gray-700 text-white rounded-lg">
                            Pins
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="min-h-screen flex items-start justify-center bg-gray-500 p-6">
                <div className="w-full max-w-5xl bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden flex flex-col md:flex-row transition-all">
                    {/* Left: Image Section */}
                    <div className="md:w-1/2 relative group border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                        <img src={post.image} alt={post.title} className="object-cover w-full h-[380px] md:h-[480px] lg:h-[520px] transition-all rounded-xl" />
                        {/* Zoom */}
                        <button onClick={openZoom} className="absolute top-3 left-3 bg-white dark:bg-gray-900 text-gray-800 dark:text-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 hover:scale-110 transition-all" title="View Full Image">
                            🔍
                        </button>
                        {/* Save */}
                        <button onClick={() => openBoardModal(post._id)} className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transform transition-all hover:scale-105">
                            Save
                        </button>
                        {/* Download */}
                        <img src={lg} onClick={() => handleDownload(post.image, post.title)} className="absolute right-3 bottom-3 opacity-0 bg-blue-100 p-3 rounded-lg text-white shadow-md group-hover:opacity-100 transition-all hover:scale-105 cursor-pointer" />
                    </div>

                    {/* Right: Details Section */}
                    <div className="md:w-1/2 py-6 px-8 flex flex-col justify-between space-y-4">
                        {/* Title & Description */}
                        <div className="mb-2">
                            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white capitalize">{post.title}</h2>
                            <p className="text-gray-700 dark:text-gray-300 text-md mt-1">{post.description}</p>
                        </div>

                        {/* User Info & Likes */}
                        <div className="flex items-center gap-3">
                            {post.user?.image && (
                                <img
                                    src={post.user.image}
                                    alt={post.user.username}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-400 shadow-md"
                                />
                            )}
                            <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">
                                {post.likes?.length || 0} ❤️
                            </p>
                        </div>

                        {/* Buttons + Share */}
                        <div className="relative flex items-center justify-center gap-2 md:gap-4 mt-3 md:mt-5">
                            <button onClick={() => navigate("/profile")} className="px-2 py-3 w-full bg-gray-900 text-white rounded-xl shadow-md hover:bg-gray-800 transition-all transform hover:scale-105">Back</button>
                            <button onClick={() => setShowShare(!showShare)}
                                className="px-2 py-3 w-full bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-500 transition-all transform hover:scale-105"> Share</button>

                            {showShare && (
                                <div ref={shareRef} className="absolute bottom-full mb-2 right-0 w-46 md:w-64 bg-slate-700 border shadow-xl rounded-xl p-2 md:p-4 flex flex-col gap-2 md:gap-3 z-50 before:content-[''] before:absolute before:-bottom-2 before:right-5 before:w-3 before:h-3 before:bg-white dark:before:bg-gray-700 before:rotate-45">

                                    {/* Copy URL */}
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(window.location.href);
                                            alert("URL copied!");
                                        }}
                                        className="flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-2 
text-sm md:text-base 
bg-gray-100 hover:bg-gray-300 
rounded-full transition-all shadow-sm"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-4 h-4 md:w-5 md:h-5 text-gray-800 dark:text-black"

                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16h8M8 12h8m-6 8h6m-6-4h6M8 8h8m-6-4h6" />
                                        </svg>
                                        Copy URL
                                    </button>

                                    {/* Facebook */}
                                    <a
                                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-2 
text-sm md:text-base 
bg-blue-600 hover:bg-blue-500 text-white 
rounded-full shadow-sm transition-all"
                                    >
                                        <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/facebook.svg" alt="FB" className="w-5 h-5" />
                                        Facebook
                                    </a>

                                    {/* Twitter */}
                                    <a
                                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-2 
text-sm md:text-base 
bg-blue-400 hover:bg-blue-300 
rounded-full transition-all shadow-sm"
                                    >
                                        <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/twitter.svg" alt="Twitter" className="w-5 h-5" />
                                        Twitter
                                    </a>

                                    {/* WhatsApp */}
                                    <a
                                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + " " + window.location.href)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-2 
text-sm md:text-base  text-white/90
bg-green-600 hover:bg-green-700 
rounded-full transition-all shadow-sm"
                                    >
                                        <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/whatsapp.svg" alt="WhatsApp" className="w-5 h-5" />
                                        WhatsApp
                                    </a>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* Zoom Modal */}
                {isZoomed && (
                    <div
                        onClick={closeZoom}
                        className="fixed inset-0 p-12 bg-black bg-opacity-80 flex items-center justify-center z-50 cursor-zoom-out"
                    >
                        <img
                            src={post.image}
                            alt={post.title}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                        />
                    </div>
                )}

                {/* Save to Board Modal */}
                {showBoardModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-5 rounded-lg shadow-lg w-80">
                            <h2 className="text-xl font-bold mb-3">Save to Board</h2>
                            {boards.length > 0 ? (
                                boards.map((board) => (
                                    <button
                                        key={board._id}
                                        className="text-gray-800 hover:text-white flex items-center w-full py-2 px-4 bg-gray-100 border-2 border-gray-300 rounded-lg mb-2 hover:bg-gray-800"
                                        onClick={() => saveToBoard(board._id)}
                                    >
                                        {board.posts.length > 0 ? (
                                            <img
                                                src={board.posts[0].image}
                                                alt={board.name}
                                                className="w-14 h-14 rounded-lg border border-gray-400 mr-4 object-cover"
                                            />
                                        ) : (
                                            <img src="https://via.placeholder.com/50" className="w-14 h-14 rounded-lg mr-4" />
                                        )}
                                        <h2 className="text-lg capitalize font-bold">{board.name}</h2>
                                    </button>
                                ))
                            ) : (
                                <p className="text-gray-500">No boards found.</p>
                            )}
                            <div className="flex justify-between mt-3">
                                <button
                                    onClick={() => setShowBoardModal(false)}
                                    className="text-white bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div >
        </>
    );
};

export default SinglePin;
