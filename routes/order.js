const app = require('express')
const route = app.Router()
const Order = require('../model/orderModel')


const authTestAdmin = require('./verifyToken').authTestAdmin
const authTest = require('./verifyToken').authTest

route.post('/neworder', authTest, async (req, res) => {
	const newobj = req.body
	try {
		const po = await new Order(newobj)
		await po.save()
		return res.status(201).json({ success: true, msg: "new Order added", data: po })

	}
	catch (e) {
		return res.status(500).json({ success: false, error: "error " + e })
	}


})
route.put('/update/:id', authTest, async (req, res) => {

	try {
		const updatedOrder = await Order.findByIdAndUpdate(req.params.id, {
			$set: req.body
		}, { new: true })
		return res.status(201).json({ success: true, msg: "update complete", data: updatedOrder })
	}
	catch (e) {
		return res.status(500).json({ success: false, msg: "error on " + e })
	}

})
route.delete('/delete/:id', authTest, async (req, res) => {
	try {

		const order = await Order.findByIdAndDelete(req.params.id)
		return res.status(201).json({ succsess: true, msg: "delted successfully" })
	}
	catch (e) {
		return res.status(500).json({ success: false, msg: "error on " + e })

	}
})

route.get('/find/:id', authTest, async (req, res) => {
	try {

		const order = await Order.findById(req.params.id)
		if (!order) {
			return res.status(401).json({ success: false, msg: "no such Order" })


		}

		return res.status(201).json({ succsess: true, msg: "request completed successfully", data: order })
	}
	catch (e) {
		return res.status(500).json({ success: false, msg: "error on " + e })

	}
})
route.get('/find', authTest, async (req, res) => {

	try {


		const order = await Order.find()


		if (!Order) {
			return res.status(401).json({ success: false, msg: "no such Order" })


		}

		return res.status(201).json({ succsess: true, msg: "request completed successfully", data: order })
	}
	catch (e) {
		return res.status(500).json({ success: false, msg: "error on " + e })

	}
})

// get income
route.get('/income', authTest, async (req, res) => {
	const productId = req.query.pid
	const date = new Date()
	const lastMonth = new Date(date.setMonth(date.getMonth() - 1))
	const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1))
	try {
		const incom = await Order.aggregate([
			{
				$match: {
					createdAt: { $gte: previousMonth }, ...(productId && {
						products: { $elemMatch: { productId } }
					})
				}
			},
			{ $project: { month: { $month: "$createdAt" }, sales: "$amount" } },
			{ $group: { _id: "$month", total: { $sum: "$sales" } } }
		])
		return res.status(201).json(incom)
	}
	catch (e) {
		return res.status(500).json({ success: false, msg: "errsdfasdfor on " + e })

	}
})

route.post("/cashondelivery", async(req, res) => {
	const purchase = req.body;
	try{
		const ordered = await new Order(purchase);
		await ordered.save();
		console.log(ordered);
		return res.status(201).json({success: true, msg: "order successfully submited", data: ordered});
	}
	catch(e){
		console.log(e)
		return res.status(500).json({success: false, msg:"err on " + e})
	}
	
})

module.exports = route;