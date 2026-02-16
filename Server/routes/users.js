const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://spancovishal:HzLLrkUjyhrqFz3X@cluster0.bre00kg.mongodb.net/test-pinterest')
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((err) => {
        console.log("DB Error:", err);
    });

const userSchema = mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    image: String,
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    boards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Board" }]
}, { timestamps: true });

/* INDEXES */
userSchema.index({ email: 1 });        // Fast login lookup
userSchema.index({ createdAt: -1 });   // If sorting users by newest

module.exports = mongoose.model("User", userSchema);