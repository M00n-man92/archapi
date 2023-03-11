const mongoose = require('mongoose');

const schema = new mongoose.Schema({
	title: { type: String, required: true },
	discription: { type: String, required: true },
	img: { type: Array, required: true },
	catagory: { type: Array, required: true },
	firm:{type: mongoose.Schema.ObjectId, ref: 'firm'},
	userId:{type: mongoose.Schema.ObjectId, ref: 'user'},
	material: { type: String },
  vr:{type:Array},
	statusApproved: { type: Boolean, default: true },
	
	
	link: { type: String, unique: true },
	suitedFor: { type: String },
	
	isDigital: { type: Boolean },
	feedback: [{
		ratingVlaue: { type: Number, min: [1], max: [5] },
		userID: { type: mongoose.Schema.ObjectId, ref: 'user' },
		review: { type: String }
	}]

}, { timestamps: true });

const Projects = mongoose.model('project', schema);

module.exports = Projects;