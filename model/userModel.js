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
        firmName: { type: String },
      },
      professional: {
        isProfessional: { type: Boolean, default: false },
        professionalId: { type: mongoose.Schema.ObjectId, ref: "professional" },
        works: [{ id: { type: mongoose.Schema.ObjectId, ref: "material" } }],
        professionalName: { type: String },
      },
      manufacturer: {
        isManufacturer: { type: Boolean, default: false },
        manufacturerId: { type: mongoose.Schema.ObjectId, ref: "manufacturer" },
        products: [{ id: { type: mongoose.Schema.ObjectId, ref: "products" } }],
        manufacturerName: { type: String },
      },
    },
    followers: [{ type: mongoose.Schema.ObjectId, ref: "user" }],
    following: [{ type: mongoose.Schema.ObjectId, ref: "user" }],
    review: [
      {
        image: { type: Array },
        comment: { type: String },
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
        reviewedItem: {
          project: {
            isProject: { type: Boolean },
            projectId: {
              type: mongoose.Schema.ObjectId,
              ref: "project",
            },
          },
          product: {
            isProduct: { type: Boolean },
            productId: {
              type: mongoose.Schema.ObjectId,
              ref: "product",
            },
          },
          material: {
            ismaterial: { type: Boolean },
            materialId: {
              type: mongoose.Schema.ObjectId,
              ref: "material",
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
