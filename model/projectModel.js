const mongoose = require("mongoose")

const schema = new mongoose.Schema(
  {
    title: { type: String },
    discription: { type: Array },
    image: { type: Array },
    catagory: { type: Array },
    client: { type: String },
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

    material: { type: String },
    vr: { type: Array },
    statusApproved: { type: Boolean, default: true },
    details: {
      rooms: { type: Number },
      toilet: { type: Number },
      garage: { type: Number },
      propertySize: { type: String },
      yearBuilt: { type: String },
      area: { type: String },
    },
    features: {
      airConditioning: { type: Boolean },
      Balcony: { type: Boolean },
      elevator: { type: Boolean },
      gym: { type: Boolean },
      laundary: { type: Boolean },
      pool: { type: Boolean },
      wifi: { type: Boolean },
    },

    link: { type: String },
    suitedFor: { type: String },

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
    region: {
      country: { type: String },
      city: [{ type: String }],
      street: [{ type: String }],
    },
  },
  { timestamps: true }
)

const Projects = mongoose.model("project", schema)

module.exports = Projects
