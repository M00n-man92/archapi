const mongoose = require('mongoose');

const dotenv = require('dotenv')
dotenv.config()

const schema = new mongoose.Schema({
	userId: { type: mongoose.Schema.ObjectId, ref: 'users' },
	products: [
		{
			productId: {
				type: mongoose.Schema.ObjectId,
				ref: 'products'
			},
			quantity: {
				type: Number,
				default: 1
			}
		}
	],
	userInfo: {
		userName: { type: String},
		cellPhone: { type: Number},
		email: {type: String},
		adress: {
			street: { type: String },
			lon: { type: Number },
			lat: { type: Number },
			city: { type: String },
			region: {type: String },
			werda: { type: Number },
		},
	},
	amount: { type: Number },
	status: { type: String, default: "pending" },
	purchaseType: { type: String, default: "cash on delivery" }


}, { timestamps: true });

const Order = mongoose.model('order', schema);

module.exports = Order;