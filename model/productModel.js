const mongoose = require("mongoose")

const schema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    discription: { type: Array },
    image: { type: Array },
    catagory: { type: Array },
    size: { type: Array },
    color: { type: String },
    materials: { type: Array },
    brand: { type: String },
    weight: { type: String },
    style: { type: Array },
    userInfo: {
      userName: { type: String },
      name: { type: String },
      userId: { type: mongoose.Schema.ObjectId, ref: "user" },
      lastName: { type: String },
      firm: [
        {
          firmName: { type: String },
          firmId: { type: mongoose.Schema.ObjectId, ref: "firm" },
        },
      ],
      professional: [
        {
          professionalName: { type: String },
          professionalId: {
            type: mongoose.Schema.ObjectId,
            ref: "professional",
          },
        },
      ],
      manufacturer: [
        {
          manufacturerName: { type: String },
          manufacturerId: {
            type: mongoose.Schema.ObjectId,
            ref: "manufacturer",
          },
        },
      ],
    },
    statusApproved: { type: Boolean, default: true },
    associate_color: [
      {
        id: {
          type: mongoose.Schema.ObjectId,
          ref: "product",
        },
        coloring: { type: String },
        img: { type: String },
      },
    ],
    price: { type: Number },
    inStock: {
      amount: { type: Number, default: 1 },
      isIt: { type: Boolean, default: true },
    },
    suitedFor: { type: String },
    taxable: { type: Boolean },
    isDigital: { type: Boolean },
    reviewRecieved: [
      {
        image: { type: String },
        userId: { type: mongoose.Schema.ObjectId, ref: "user" },
        comment: { type: String },
        value: { type: Number, min: [1], max: [5] },
        userName: { type: String },
        name: { type: String },
        lastName: { type: String },
        userImage: { type: String },
      },
    ],
  },
  { timestamps: true }
)

const Products = mongoose.model("product", schema)

module.exports = Products
