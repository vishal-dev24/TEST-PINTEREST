const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const userModel = require('./routes/users');
const postModel = require('./routes/posts');
const boardModel = require('./routes/boards');
const upload = require('./routes/cloudinary');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
app.use(express.json());
app.use(cookieParser());

const cors = require("cors");

app.use(cors({
    origin: "https://test-pinterest-1.onrender.com",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

app.options("*", cors());


const SECRET = "shhhh";

app.use((req, res, next) => {
    console.log(`${req.method} request is on URL: ${req.url}`);
    next()
});

// 🟢 Register Route
app.post('/register', upload.single('image'), async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const imagefile = req.file ? req.file.filename : null;
        const existingUser = await userModel.findOne({ email });
        if (existingUser) return res.json({ success: false, message: "User already exists" });
        const hash = await bcrypt.hash(password, 10);
        const user = await userModel.create({ username, email, password: hash, image: imagefile });
        const token = jwt.sign({ email, userId: user._id }, SECRET);
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" });
        res.json({ success: true, message: "User registered successfully", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// 🟢 Login Route
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) return res.status(400).json({ success: false, message: "Invalid email or password" });
        const result = await bcrypt.compare(password, user.password);
        if (!result) return res.json({ success: false, message: 'Wrong password' });
        const token = jwt.sign({ email, userId: user._id }, SECRET);
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none", });
        res.json({ success: true, message: "Login successful", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// 🟢 Middleware
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

// 🟢 Profile
app.get('/profile', isLoggedIn, async (req, res) => {
    const user = await userModel.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
});

// 🟢 Logout
app.get("/logout", (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    });
    res.json({ success: true, message: "Logged out successfully" });
});

// 🟢 Update Profile
app.put('/profile/update', isLoggedIn, upload.single('image'), async (req, res) => {
    const { username } = req.body;
    const image = req.file ? req.file.filename : undefined
    const updatedUser = await userModel.findByIdAndUpdate(req.user._id, { username, ...(image && { image }) }, { new: true });
    res.json({ success: true, user: updatedUser });
});

// ---------------- POSTS ----------------

app.post("/posts/create", isLoggedIn, upload.single("image"), async (req, res) => {
    try {
        const { title, description } = req.body;
        const image = req.file ? req.file.filename : null;
        const post = await postModel.create({ user: req.user._id, title, description, image, likes: [req.user._id] })
        await userModel.findByIdAndUpdate(req.user._id, { $push: { posts: post._id } })
        res.json({ success: true, post });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

app.get("/posts", async (req, res) => {
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
});

app.get("/posts/user/:userId", isLoggedIn, async (req, res) => {
    const posts = await postModel.find({ user: req.params.userId })
        .populate("user", "username image");

    res.json({ success: true, posts });
});

app.get("/posts/:id", isLoggedIn, async (req, res) => {
    const post = await postModel.findById(req.params.id)
        .populate("user", "username image");

    res.json({ success: true, post });
});

app.delete("/posts/:postId", isLoggedIn, async (req, res) => {
    const post = await postModel.findByIdAndDelete(req.params.postId);

    await userModel.findByIdAndUpdate(
        post.user,
        { $pull: { posts: post._id } }
    );

    res.json({ success: true, message: "Post deleted" });
});

// ---------------- BOARDS ----------------

app.post("/boards", isLoggedIn, async (req, res) => {
    const board = new boardModel({ name: req.body.name, userId: req.user._id, posts: [] });
    await board.save();
    await userModel.findByIdAndUpdate(req.user._id, { $push: { boards: board._id } });
    res.json({ success: true, board });
});

app.get("/boards", isLoggedIn, async (req, res) => {
    try {
        const boards = await boardModel.find({ userId: req.user._id })
            .populate("posts", "title image description").lean();
        res.json({ success: true, boards });
    } catch (err) {
        console.error("Error while fetching boards:", err);
        res.status(500).json({ error: "Failed to fetch boards" });
    }
});

app.get("/boards/:boardId", async (req, res) => {
    const board = await boardModel.findById(req.params.boardId).populate("posts", "image title description");
    res.json({ success: true, board });
});

app.post("/boards/:boardId/save", isLoggedIn, async (req, res) => {
    const board = await boardModel.findById(req.params.boardId);
    if (!board) return res.status(404).json({ success: false, message: "Board not found" });
    if (board.userId.toString() !== req.user._id.toString()) { return res.status(403).json({ success: false }); }
    if (!board.posts.includes(req.body.postId)) { board.posts.push(req.body.postId); await board.save() }
    res.json({ success: true, message: "Post saved to board!" });
});

app.get("/boards/user/:userId", isLoggedIn, async (req, res) => {
    const boards = await boardModel.find({ userId: req.params.userId }).populate("posts", "image title").lean();
    res.json({ success: true, boards });
});

app.delete("/boards/:boardId", isLoggedIn, async (req, res) => {
    await boardModel.findByIdAndDelete(req.params.boardId);
    await userModel.findByIdAndUpdate(req.user._id, { $pull: { boards: req.params.boardId } })
    res.json({ success: true, message: "Board deleted successfully" });
});

// ---------------- DASHBOARD ----------------

app.get("/dashboard", isLoggedIn, async (req, res) => {
    const user = await userModel.findById(req.user._id).select("-password");
    const posts = await postModel.find({ _id: { $in: user.posts } }).sort({ createdAt: -1 });
    const boards = await boardModel.find({ userId: req.user._id }).populate({ path: "posts", options: { sort: { createdAt: -1 } } }).sort({ createdAt: -1 });
    res.json({ success: true, user, posts, boards });
});

// Delete post from specific board
app.delete("/boards/:boardId/posts/:postId", isLoggedIn, async (req, res) => {
    const board = await boardModel.findById(req.params.boardId);
    if (board.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false });
    }
    board.posts = board.posts.filter(p => p.toString() !== req.params.postId)
    await board.save();
    res.json({ success: true });
});

// ---------------- SERVER ----------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
