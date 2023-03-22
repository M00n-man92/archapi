const mongoose = require("mongoose")

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    lastName: { type: String },
    userName: { type: String, required: true, unique: true },
    email: { type: String, unique: true, required: true },
    cellPhone: { type: Number },
    password: {
      type: String,
      min: [8, "please enter more characters"],
      required: true,
    },
    profilepic: { type: String, default: "" },
    isConfirmed: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    userType: {
      firm: {
        isFirm: { type: Boolean, default: false },
        firmId: { type: mongoose.Schema.ObjectId, ref: "firm" },
        projects: [{ id: { type: mongoose.Schema.ObjectId, ref: "projects" } }],
      },
      professional: {
        isProfessional: { type: Boolean, default: false },
        professionalId: { type: mongoose.Schema.ObjectId, ref: "professional" },
        works: [{ id: { type: mongoose.Schema.ObjectId, ref: "material" } }],
      },
      manufacturer: {
        isManufacturer: { type: Boolean, default: false },
        manufacturerId: { type: mongoose.Schema.ObjectId, ref: "manufacturer" },
        products: [{ id: { type: mongoose.Schema.ObjectId, ref: "products" } }],
      },
    },
    followers: [{ type: mongoose.Schema.ObjectId, ref: "user" }],
    following: [{ type: mongoose.Schema.ObjectId, ref: "user" }],
    review: [
      {
        comments: { type: String },
        value: { type: Number, min: [1], max: [5] },
        reviewedUser: {
          firm: {
            isFirm: { type: Boolean },
            firmId: { type: mongoose.Schema.ObjectId, ref: "firm" },
          },
          professional: {
            isProfessional: { type: Boolean },
            professionalId: {
              type: mongoose.Schema.ObjectId,
              ref: "professional",
            },
          },
          manufacturer: {
            isManufacturer: { type: Boolean },
            manufacturerId: {
              type: mongoose.Schema.ObjectId,
              ref: "manufacturer",
            },
          },
        },
      },
    ],
  },
  { timestamps: true }
)
const User = mongoose.model("user", schema)
module.exports = User
