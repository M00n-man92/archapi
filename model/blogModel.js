const mongoose = require("mongoose")

const schema = new mongoose.Schema(
  {
    title: { type: String },
    logo: { type: String },
    image: { type: Array },
    userInfo: {
      userId: { type: mongoose.Schema.ObjectId, ref: "user" },
      userName: { type: String },
      name: { type: String },
      lastName: { type: String },
    },
    reviewRecieved: [
      {
        userId: { type: mongoose.Schema.ObjectId, ref: "user" },
        comment: { type: String },
        value: { type: Number, min: [1], max: [5] },
        userName: { type: String },
      },
    ],
    source: { type: String },
    discription: { type: Array },
  },
  { timestamps: true }
)
const Blog = mongoose.model("blog", schema)
module.exports = Blog
