const mongoose = require("mongoose")

const schema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.ObjectId, ref: "user" },
    title: { type: String },
    discription: { type: Array },
    country: { type: String },
    deadline: { type: Date },
    tot: { type: String },
    tendervalue: { type: String },
    purchaser: { type: String },
    document: { type: Array },
    catagory: { type: Array },
    region: {
      city: { type: String },
      street: { type: String },
    },
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
  },
  { timestamps: true }
)

const Tender = mongoose.model("tender", schema)

module.exports = Tender
