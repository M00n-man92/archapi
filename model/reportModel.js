const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId, ref: 'user', required: true },
  reportType: { type: Array },
  content: { type: String },
  productId: { type: mongoose.Schema.ObjectId, ref: 'products', required: true}

}, { timestamps: true });

const Report = mongoose.model('report', schema);

module.exports = Report;