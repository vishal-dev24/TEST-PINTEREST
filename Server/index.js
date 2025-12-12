const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const userModel = require('./routes/users');
const postModel = require('./routes/posts');
const boardModel = require('./routes/boards');
const upload = require('./routes/cloudinary');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: ["https://test-pinterest-1.onrender.com", "https://test-pinterest.onrender.com"], credentials: true }));
// ---------------------- 🟢 AUTH ----------------------

// Register
app.post('/register', upload.single('image'), async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const imageUrl = req.file?.path || null;

        const existingUser = await userModel.findOne({ email });
        if (existingUser) return res.json({ success: false, message: "User already exists" });

        const hash = await bcrypt.hash(password, 10);
        const user = await userModel.create({ username, email, password: hash, image: imageUrl });

        const token = jwt.sign({ userId: user._id, email: user.email }, "shhhh");

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax", // localhost testing ke liye "lax"
            secure: false,   // local testing me false
        });

        res.json({ success: true, message: "Registered successfully", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) return res.json({ success: false, message: 'User not found' });

        const result = await bcrypt.compare(password, user.password);
        if (!result) return res.json({ success: false, message: 'Wrong password' });

        const token = jwt.sign({ userId: user._id, email: user.email }, "shhhh");

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        });

        res.json({ success: true, message: "Logged in", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ---------------------- 🟢 MIDDLEWARE ----------------------
function isLoggedIn(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: "Not authenticated" });
    try {
        const decoded = jwt.verify(token, 'shhhh');
        req.user = { _id: decoded.userId, email: decoded.email };
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Token invalid" });
    }
}

// Logout
app.get("/logout", (req, res) => {
    res.cookie("token", "", { httpOnly: true });
    res.json({ success: true, message: "Logged out" });
});

// ---------------------- 🟢 PROFILE ----------------------
app.get('/profile', isLoggedIn, async (req, res) => {
    const user = await userModel.findById(req.user._id);
    res.json({ success: true, user });
});

app.put('/profile/update', isLoggedIn, upload.single('image'), async (req, res) => {
    const { username } = req.body;
    const image = req.file?.path;
    const updatedUser = await userModel.findByIdAndUpdate(req.user._id, { username, ...(image && { image }) }, { new: true });
    res.json({ success: true, user: updatedUser });
});
// ---------------------- 🎯 POSTS ----------------------
app.post("/posts/create", isLoggedIn, upload.single("image"), async (req, res) => {
    try {
        const { title, description } = req.body;
        const imageUrl = req.file ? req.file.path : null;
        const post = await postModel.create({ userId: req.user._id, title, description, image: imageUrl });
        res.json({ success: true, post });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.get("/posts", async (req, res) => {
    try {
        const posts = await postModel.find().populate("userId", "username image");
        res.json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.get("/posts/user/:userId", isLoggedIn, async (req, res) => {
    try {
        const posts = await postModel.find({ userId: req.params.userId }).populate("userId", "username image");
        res.json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.get("/posts/:postId", isLoggedIn, async (req, res) => {
    try {
        const post = await postModel.findById(req.params.postId).populate("userId", "username image");
        if (!post) return res.status(404).json({ success: false, message: "Post not found" });
        res.json({ success: true, post });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.delete("/posts/:postId", isLoggedIn, async (req, res) => {
    try {
        const deleted = await postModel.findByIdAndDelete(req.params.postId);
        if (!deleted) return res.status(404).json({ success: false, message: "Post not found" });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// ---------------------- 🎯 BOARDS ----------------------
app.post("/boards", isLoggedIn, async (req, res) => {
    const { name } = req.body;
    const board = await boardModel.create({ name, userId: req.user._id, posts: [] });
    res.json({ success: true, board });
});

app.get("/boards", isLoggedIn, async (req, res) => {
    try {
        const boards = await boardModel.find({ userId: req.user._id }).populate({ path: "posts", select: "image title", });
        res.json({ boards });
    } catch (err) {
        console.error("Error while fetching boards:", err);
        res.status(500).json({ error: "Failed to fetch boards" });
    }
});

// Current in your code
app.get("/boards/:boardId", async (req, res) => {
    const board = await boardModel.findById(req.params.boardId).populate("posts", "image title description");
    res.json({ success: true, board });
});


app.post("/boards/:boardId/save", isLoggedIn, async (req, res) => {
    const { postId } = req.body;
    const board = await boardModel.findById(req.params.boardId);
    if (!board) return res.status(404).json({ success: false, message: "Board not found" });
    if (board.userId.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: "Forbidden" });
    if (!board.posts.includes(postId)) {
        board.posts.push(postId);
        await board.save();
    }
    res.json({ success: true, message: "Post saved to board!" });
});

app.get("/boards/user/:userId", isLoggedIn, async (req, res) => {
    const boards = await boardModel.find({ userId: req.params.userId }).populate({ path: "posts", select: "image title" });
    res.json({ success: true, boards });
});

app.delete("/boards/:boardId", isLoggedIn, async (req, res) => {
    const board = await boardModel.findById(req.params.boardId);
    if (!board) return res.status(404).json({ success: false, message: "Board not found" });
    if (board.userId.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: "Forbidden" });
    await boardModel.findByIdAndDelete(req.params.boardId);
    res.json({ success: true, message: "Board deleted successfully" });
});

app.listen(3000, () => console.log("🚀 Server running on port 3000"));