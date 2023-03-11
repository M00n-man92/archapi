const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	title: { type: String, required: true },
	discription: { type: String, required: true },
	img: { type: Array, required: true },
	catagory: { type: Array, required: true },
	size: { type: Array, required: true },
	color: { type: String, required: true },
	material: { type: String },
	brand: { type: String },
	statusApproved: { type: Boolean, default: true },
	associate_color: [{
		id: {
			type: mongoose.Schema.ObjectId, ref: 'products'
		},
		coloring: { type: String }, img: { type: String }
	}],
	price: { type: Number, required: true },
	inStock: {
		amount: { tye: Number, default: 1 },
		isIt: { type: Boolean, default: true }
	},
	link: { type: String, unique: true },
	suitedFor: { type: String },
	taxable: { type: Boolean },
	isDigital: { type: Boolean },
	feedback: [{
		ratingVlaue: { type: Number, min: [1], max: [5] },
		userID: { type: mongoose.Schema.ObjectId, ref: 'user' },
		review: { type: String }
	}]

}, { timestamps: true });

const Products = mongoose.model('product', schema);

module.exports = Products;