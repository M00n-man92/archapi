const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId, ref: 'user' },
  projects: [{ projectId: { type: mongoose.Schema.ObjectId, ref: 'project' } }],
  materials: [{ materialId: { type: mongoose.Schema.ObjectId, ref: 'material' } }],
  products: [{ productId: { type: mongoose.Schema.ObjectId, ref: 'product' } }],
  logo: { type: String },
  image: { type: String },
  reviewRecieved: [{
    userId: { type: mongoose.Schema.ObjectId, ref: 'user' },
    comment: { type: String },
    value: { type: Number, min: [1], max: [5] }
  }
  ],
  professionalInfo: {
    socialLinks: {
      facebook: { type: Array },
      linkedIn: { type: Array },
      youtube: { type: Array },
      google: { type: Array },
      twitter: { type: Array },
      pinterest: { type: Array },
      websiteLink: {type: Array },
    },
    
    aboutProfessional: { type: Array },
    officeCell: { type: String },
    followers: [{ id: { type: mongoose.Schema.ObjectId, ref: 'user' } }],
    following: [{ id: { type: mongoose.Schema.ObjectId, ref: 'user' } }],
    region: {
      country: { type: String },
      city: [{ location: { type: String } }],
      street: [{ location: { type: String } }],
    },
  },
},
  { timestamps: true }
);
const Professional = mongoose.model("professional", schema);
module.exports = Professional;