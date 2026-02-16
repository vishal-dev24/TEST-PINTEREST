const express = require('express');
const cookieParser = require('cookie-parser');
const userModel = require('./routes/users');
const postModel = require('./routes/posts');
const boardModel = require('./routes/boards');
const upload = require('./routes/cloudinary');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

// --- GLOBAL ERROR HANDLERS ---
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: ['https://test-pinterest.onrender.com', 'https://test-pinterest-1.onrender.com'], credentials: true }));

const SECRET = "shhhh"; // Secret key for JWT


// 🟢 Register Route
app.post('/register', upload.single('image'), async (req, res) => {
    const { username, email, password } = req.body;
    const imageUrl = req.file ? req.file.path : null; // <-- use path, not filename
    bcrypt.hash(password, 10, async (err, hash) => {
        const user = await userModel.create({ username, email, password: hash, image: imageUrl });
        const token = jwt.sign({ email, userId: user._id }, SECRET);
        res.cookie("token", token)
        res.json({ success: true, message: "User registered successfully", user });
        console.log("// user created ", { user })
    });
});
// 🟢 Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) { return res.status(404).json({ success: false, message: "This user is not in your database" }); }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ success: false, message: "Invalid email or password" });
        }
        const token = jwt.sign({ email, userId: user._id }, SECRET);
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "None" });
        res.json({ success: true, message: "Login successful", user });
        console.log('Login successful:', user);
    } catch (err) {
        console.error("// Login error:", err);
        res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
});

// 🟢 Middleware to Check Login
function isLoggedIn(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });
    try {
        const { email, userId } = jwt.verify(token, SECRET);
        req.user = { email, _id: userId }
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
}
// 🟢 Profile Route
app.get('/profile', isLoggedIn, async (req, res) => {
    const user = await userModel.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
    // console.log("// user is here", { user: user._id })
});
// 🟢 Logout Route
app.get("/logout", (req, res) => {
    res.cookie("token", "", { httpOnly: true, secure: true, sameSite: "None" });
    res.json({ success: true, message: "Logged out successfully" });
    console.log('Logged out successfully ')

});

// 🟢 Profile Update Route (POST + Cloudinary)
app.post('/profile/update', isLoggedIn, upload.single('image'), async (req, res) => {
    try {
        const { username } = req.body;
        const imageUrl = req.file ? req.file.path : undefined; // Cloudinary URL

        const updatedUser = await userModel.findByIdAndUpdate(
            req.user._id,
            { username, ...(imageUrl && { image: imageUrl }) },
            { new: true }
        );

        res.json({ success: true, user: updatedUser });
        console.log("// User updated:", JSON.stringify(updatedUser, null, 2));
    } catch (err) {
        console.error("// Error updating user:", err);
        res.status(500).json({ success: false, message: "Update failed", error: err.message });
    }
});

// ----------- 🎯 POSTS (Pins Page) --------------------------------------------------------
// 🟢 Create a Post (Pin)
app.post("/posts/create", isLoggedIn, upload.single("image"), async (req, res) => {
    try {
        const { title, description } = req.body;
        const imageUrl = req.file ? req.file.path : null;
        const post = await postModel.create({ user: req.user._id, title, description, image: imageUrl, likes: [req.user._id] });
        await userModel.findByIdAndUpdate(req.user._id, { $push: { posts: post._id } });
        res.json({ success: true, post });
        console.log("// NEW POST IS HERE", { post });
    } catch (err) {
        console.error("Error in /posts/create:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// 🟢 Home update route
app.get("/posts", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const posts = await postModel.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("user", "username image")
            .lean();
        res.json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 🟢 Pins Page)
app.get("/posts/user/:userId", isLoggedIn, async (req, res) => {
    const { userId } = req.params;
    const posts = await postModel.find({ user: userId }).populate("user", "username image");
    res.status(200).json({ success: true, posts });
});

// 🟢 Single Pin Page  
app.get("/posts/:id", isLoggedIn, async (req, res) => {
    const post = await postModel.findById(req.params.id).populate("user", "username image");
    res.json({ success: true, post });
    console.log("// see the post", { post })
});
// 🟢 DELETE PIN
app.delete("/posts/:postId", isLoggedIn, async (req, res) => {
    try {
        const post = await postModel.findByIdAndDelete(req.params.postId);
        if (!post) return res.status(404).json({ success: false, message: "Post not found" });
        // User ke posts array se bhi remove karo
        const updatedUser = await userModel.findByIdAndUpdate(
            post.user,
            { $pull: { posts: post._id } },
            { new: true }
        ).populate("posts");

        console.log("// POST DELETED, UPDATED USER", updatedUser);

        res.json({ success: true, message: "Post deleted", postId: post._id, user: updatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// ----------------------------------------------------------------------------------------
// 🎯 BOARDS (Collections of Saved Posts)
// ------------------------------------------------------------------------------------------

// 🟢 Create a Board ✅
app.post("/boards", isLoggedIn, async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user._id;
        const board = new boardModel({ name, userId, posts: [] });
        await board.save();
        console.log("// NEW BOARD CREATED", board);
        await userModel.findByIdAndUpdate(userId, { $push: { boards: board._id } });
        res.json({ success: true, board });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
});

// 🟢 Get boards name in modal at home page ✅
app.get("/boards", isLoggedIn, async (req, res) => {
    try {
        // Find boards of logged-in user
        const boards = await boardModel
            .find({ userId: req.user._id })
            .populate("posts", "title image description") // populate posts inside each board
            .lean();

        res.json({ success: true, boards });
        // console.log("// USER BOARDS FETCHED", boards);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error fetching boards" });
    }
});

// 🟢 Save boards ✅
app.post("/boards/:boardId/save", isLoggedIn, async (req, res) => {
    const { postId } = req.body;
    const { boardId } = req.params;
    const board = await boardModel.findById(boardId);
    // 🔥 Ownership check
    if (board.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "Forbidden: You cannot save posts to someone else's board" });
    }
    if (!board.posts.includes(postId)) {
        board.posts.push(postId);
        await board.save();
    }
    res.json({ success: true, message: "Post saved to board!" });
    console.log('//"Post saved to board!"', { board })
});

// 🟢 Get All Boards of a User (For Profile Page) ✅
app.get("/boards/user/:userId", isLoggedIn, async (req, res) => {
    try {
        const { userId } = req.params;
        const boards = await boardModel
            .find({ userId })
            .populate({ path: "posts", select: "image title" })
            .lean();

        res.json({ success: true, boards });
        console.log("// USER BOARDS FETCHED", boards);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error fetching boards" });
    }
});

// 🟢 Get a single board with populated pins ✅
app.get("/boards/:boardId", async (req, res) => {
    const board = await boardModel.findById(req.params.boardId).populate("posts", "image title description");
    res.json({ success: true, board });
});

// 🟢  DELETE Single board On Profile Page  ✅
app.delete("/boards/:boardId", isLoggedIn, async (req, res) => {
    try {
        const deletedBoard = await boardModel.findByIdAndDelete(req.params.boardId);
        await userModel.findByIdAndUpdate(req.user._id, { $pull: { boards: req.params.boardId } });
        res.json({ success: true, message: "Board deleted successfully" });
        console.log('// Board deleted successfully', { deletedBoard });
    } catch (err) {
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
});

////  NEW DASHBORD PAGE
app.get("/dashboard", isLoggedIn, async (req, res) => {
    try {
        // Current user (exclude password)
        const user = await userModel.findById(req.user._id).select("-password");

        // Populate user's posts fully
        const posts = await postModel
            .find({ _id: { $in: user.posts } })
            .sort({ createdAt: -1 });

        // Populate boards and their posts fully
        const boards = await boardModel
            .find({ userId: req.user._id })
            .populate({
                path: "posts",
                options: { sort: { createdAt: -1 } } // latest first
            })
            .sort({ createdAt: -1 });

        res.json({ success: true, user, posts, boards });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to fetch dashboard data" });
    }
});

// DELETE a post from a specific board (without deleting the post globally)
app.delete("/boards/:boardId/posts/:postId", isLoggedIn, async (req, res) => {
    try {
        const { boardId, postId } = req.params;

        // Find the board
        const board = await boardModel.findById(boardId);
        if (!board) return res.status(404).json({ success: false, message: "Board not found" });

        // Check if logged-in user owns the board
        if (board.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        // Remove the post from this board
        board.posts = board.posts.filter(p => p.toString() !== postId);
        await board.save();

        res.json({ success: true, message: "Post removed from board", boardId, postId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
