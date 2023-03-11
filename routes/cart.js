const app = require('express')
const route = app.Router()
const Cart = require('../model/cartModel')


const authTestAdmin = require('./verifyToken').authTestAdmin
const authTest = require('./verifyToken').authTest

route.post('/newCart', authTest, async (req, res) => {
    const newobj = req.body
    try {
        const po = await new Cart(newobj)
       await po.save()
       return res.status(201).json({ success: true, msg: "new Cart added", data: po })
 
    }
    catch (e) {
        return res.status(500).json({ success: false, error: "error " + e })
    }


})
route.put('/update/:id', authTest, async (req, res) => {
    if (req.body.password) {
        req.body.password = await genert(req.body.password)
    }
    try {
        const updatedCart = await Cart.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, { new: true })
        return res.status(201).json({ success: true, msg: "update complete", data: updatedCart })
    }
    catch (e) {
        return res.status(500).json({ success: false, msg: "error on " + e })
    }

})
route.delete('/delete/:id', authTest, async (req, res) => {
    try {

        const cart = await Cart.findByIdAndDelete(req.params.id)
        return res.status(201).json({ succsess: true, msg: "delted successfully" })
    }
    catch (e) {
        return res.status(500).json({ success: false, msg: "error on " + e })

    }
})

route.get('/find/:id', authTest, async (req, res) => {
    try {

        const Cart = await Cart.findById(req.params.id)
        if (!Cart) {
            return res.status(401).json({ success: false, msg: "no such Cart" })


        }

        return res.status(201).json({ succsess: true, msg: "request completed successfully", data: Cart })
    }
    catch (e) {
        return res.status(500).json({ success: false, msg: "error on " + e })

    }
})
route.get('/find', authTest, async (req, res) => {
  
    try {
       
        
           const cart = await Cart.find()
        

        if (!cart) {
            return res.status(401).json({ success: false, msg: "no such Cart" })


        }

        return res.status(201).json({ succsess: true, msg: "request completed successfully", data: cart })
    }
    catch (e) {
        return res.status(500).json({ success: false, msg: "error on " + e })

    }
})

module.exports = route;