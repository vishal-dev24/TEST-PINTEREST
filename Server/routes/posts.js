const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Post title
    description: { type: String },           // Optional description
    image: { type: String, required: true }, // Image URL
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who liked the post
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Creator of the post
}, { timestamps: true });

// Indexes
PostSchema.index({ user: 1 });        // For querying posts by user
PostSchema.index({ createdAt: -1 });  // For sorting posts by newest

module.exports = mongoose.model("Post", PostSchema);
