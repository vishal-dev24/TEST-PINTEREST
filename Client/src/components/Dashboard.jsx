import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import img from "../assets/pin.ico";

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ user: null, posts: [], boards: [] });

    const BASE_URL = "https://test-pinterest.onrender.com";

    useEffect(() => {
        axios
        axios.get(`${BASE_URL}/dashboard`, { withCredentials: true })
            .then((res) => {
                console.log("Dashboard data:", res.data); // ✅ Check here
                if (res.data.success) setData(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const deletePost = (postId) => {
        if (!window.confirm("Are you sure you want to delete this pin?")) return;
        axios
            .delete(`${BASE_URL}/posts/${postId}`, { withCredentials: true })
            .then(() => setData({ ...data, posts: data.posts.filter(p => p._id !== postId) }))
            .catch(err => console.error(err));
    };

    const deletePostFromBoard = async (postId, boardId) => {
        if (!window.confirm("Remove this post from your board?")) return;

        try {
            axios.delete(`${BASE_URL}/boards/${boardId}/posts/${postId}`, { withCredentials: true })

            // Update frontend state
            setData(prev => ({
                ...prev,
                boards: prev.boards.map(board =>
                    board._id === boardId
                        ? { ...board, posts: board.posts.filter(p => p._id !== postId) }
                        : board
                )
            }));
        } catch (err) {
            console.error(err);
            alert("Failed to remove post from board");
        }
    };

    const deleteBoard = (boardId) => {
        if (!window.confirm("Are you sure you want to delete this board?")) return;
        axios
            .delete(`${BASE_URL}/boards/${boardId}`, { withCredentials: true })
            .then(() => setData({ ...data, boards: data.boards.filter(b => b._id !== boardId) }))
            .catch(err => console.error(err));
    };

    if (loading) return <p className="text-center mt-10">Loading Dashboard...</p>;

    if (!data.user) return <p className="text-center mt-10 text-red-500">Failed to load dashboard</p>;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Navbar */}
            <nav className="bg-white dark:bg-gray-800 shadow-lg p-2.5 sticky top-0 z-50 w-full">
                <div className="flex justify-between items-center px-2">
                    <button onClick={() => navigate("/profile")} className="flex items-center space-x-2 text-2xl font-bold">
                        <img src={img} alt="Phinix" className="w-10 h-10 rounded-full shadow-md" />
                        <span className="text-gray-800 dark:text-white">Phinix Dashboard</span>
                    </button>
                </div>
            </nav>
            <div className="p-6">
                {/* User Info */}
                <div className="flex items-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-6 space-x-6">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-300 dark:border-gray-600">
                        <img src={data.user.image} alt="User" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{data.user.username}</h2>
                        <p className="text-gray-600 dark:text-gray-300">@{data.user.email.split("@")[0]}</p>
                    </div>
                </div>

                {/* Created Pins */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Pins ({data.posts.length})</h2>
                    {data.posts.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-300">No pins yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {data.posts.map((post) => (
                                <div key={post._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-2 hover:shadow-xl transition-all">
                                    <a onClick={() => navigate(`/post/${post._id}`)}>
                                        <img src={post.image} alt={post.title} className="w-full h-48 object-cover rounded-lg mb-2" />
                                    </a>
                                    <div className="mt-2 flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{post.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm">{post.description?.slice(0, 50)}...</p>
                                        </div>
                                        <button
                                            onClick={() => deletePost(post._id)}
                                            className="flex items-center gap-1.5 px-2 py-1 bg-red-900 hover:bg-red-600 text-white text-xs font-semibold rounded-md shadow-sm transition duration-200"
                                        >
                                            <i className="fa-regular fa-trash-can text-base"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Boards Section */}
                <div className="mt-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Your Boards ({data.boards.length})
                    </h2>

                    {data.boards.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-300">No boards yet.</p>
                    ) : (
                        <div className="space-y-6">
                            {data.boards.map((board) => (
                                <div
                                    key={board._id}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 hover:shadow-xl transition-all"
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{board.name}</h3>
                                        <p className="text-gray-600 dark:text-gray-400">{board.posts.length} Pins</p>
                                    </div>

                                    {/* Posts Grid */}
                                    {/* Posts Grid */}
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                        {board.posts.map((post) => (
                                            <div key={post._id} className="relative group">
                                                <img
                                                    src={post.image}
                                                    alt={post.title}
                                                    className="w-full h-24 object-cover rounded-md"
                                                />
                                                <button
                                                    onClick={() => deletePostFromBoard(post._id, board._id)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-600 transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        ))}
                                    </div>


                                    {/* Board-level actions */}
                                    <div className="mt-3 flex justify-end gap-2">
                                        <button
                                            onClick={() => navigate(`/SingleBoard/${board._id}`)}
                                            className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                                        >
                                            View Board
                                        </button>
                                        <button
                                            onClick={() => deleteBoard(board._id)}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                                        >
                                            Delete Board
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>


        </div>
    );
};

export default Dashboard;
