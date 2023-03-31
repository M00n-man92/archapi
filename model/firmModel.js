const mongoose = require("mongoose")

const schema = new mongoose.Schema(
  {
    firmName: { type: String },
    discription: { type: Array },
    userId: { type: mongoose.Schema.ObjectId, ref: "user" },
    projects: [
      { projectId: { type: mongoose.Schema.ObjectId, ref: "project" } },
    ],
    materials: [
      { materialId: { type: mongoose.Schema.ObjectId, ref: "material" } },
    ],
    products: [
      { productId: { type: mongoose.Schema.ObjectId, ref: "product" } },
    ],
    blogs: [{ blogId: { type: mongoose.Schema.ObjectId, ref: "blog" } }],
    logo: { type: String },
    image: { type: Array },
    reviewRecieved: [
      {
        image: { type: Array },
        userId: { type: mongoose.Schema.ObjectId, ref: "user" },
        comment: { type: String },
        value: { type: Number, min: [1], max: [5] },
        userName: { type: String },
        name: { type: String },
        lastName: { type: String },
        userImage: { type: String },
      },
    ],
    catagory: { type: Array },
    firmInfo: {
      socialLinks: {
        facebook: { type: Array },
        linkedIn: { type: Array },
        youtube: { type: Array },
        google: { type: Array },
        twitter: { type: Array },
        pinterest: { type: Array },
        websiteLink: { type: Array },
        instagram: { type: Array },
        skype: { type: Array },
      },

      aboutFirm: { type: Array },
      officeCell: { type: String },
      followers: [{ type: mongoose.Schema.ObjectId, ref: "user" }],
      region: {
        country: { type: String },
        city: [{ location: { type: String } }],
        street: [{ location: { type: String } }],
      },
    },
  },
  { timestamps: true }
)
const Firm = mongoose.model("firm", schema)
module.exports = Firm
