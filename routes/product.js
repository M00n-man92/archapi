const app = require('express')
const route = app.Router()
const Product = require('../model/productModel')


const authTestAdmin = require('./verifyToken').authTestAdmin
const authTest = require('./verifyToken').authTest

route.post('/newproduct', authTestAdmin, async (req, res) => {
    const newobj = req.body
console.log(newobj)
    try {

        const user = await new Product(newobj)

        const newuser = await user.save()

        return res.status(201).json({ success: true, msg: "registered successfully", data: newuser })

    }
    catch (e) {
        return res.status(500).json({ success: false, error: e })
    }
    /* try {
        const po = await new Product(newobj)
        po.save((err, done) => {
            if (err) {
                return res.status(403).json({ success: false, error: "error " + err })
            }
            return res.status(201).json({ success: true, msg: "new product added", data: done })
        })
    }
    catch (e) {
        return res.status(500).json({ success: false, error: "error " + e })
    } */


})
route.put('/update/:id', authTestAdmin,async (req, res) => {
    console.log(req.params.id)

    try {
        const updatedProduct = await Product.findOneAndUpdate({ _id: req.params.id }, {
            $set: req.body
        }, { new: true })

        if (!updatedProduct) {
            console.log("happende")
        }
        else if (updatedProduct) {
            console.log("heoolo")
            return res.status(201).json({ success: true, msg: "update complete", data: updatedProduct })
        }
    }
    catch (e) {
        console.log("eooor" + e)
        return res.status(500).json({ success: false, msg: "error on " + e })
    }

})
route.delete('/delete/:id', authTestAdmin,async (req, res) => {
    try {

        const product = await Product.findOneAndDelete({ _id: req.params.id })
        if (product) {
            console.log("herer")
        }
        return res.status(201).json({ succsess: true, msg: "delted successfully" })
    }
    catch (e) {
        return res.status(500).json({ success: false, msg: "error on " + e })

    }
})

route.get('/find/:id', async (req, res) => {
    try {

        const product = await Product.findById(req.params.id)
        if (!product) {
            return res.status(401).json({ success: false, msg: "no such product" })


        }

        return res.status(201).json({ succsess: true, msg: "request completed successfully", data: product })
    }
    catch (e) {
        return res.status(500).json({ success: false, msg: "error on " + e })

    }
})

route.get('/find', async (req, res) => {
    const qcatagory = req.query.catagory
    const qnew = req.query.new
    const qsex=req.query.sex
    let product
    console.log(qsex,qcatagory)
    try {
       if (qsex&&qcatagory) {
            console.log("hello world")
            product = await Product.find({ catagory:  [qsex,qcatagory] })
        }
        else if (qcatagory) {
            console.log("qcatagory")
            product = await Product.find({ catagory: { $in: [qcatagory] } })
        }
        else if (qsex) {
            console.log("qsex")
            product = await Product.find({ catagory: { $in: [qsex] } })
        }
        else if (qnew) {
            product = await Product.find().sort({ createdAt: -1 }).limit(2)
        }
        

        else {
            product = await Product.find()
        }

        if (!product) {
            return res.status(401).json({ success: false, msg: "no such product" })


        }

        return res.status(201).json({ succsess: true, msg: "request completed successfully", data: product })
    }
    catch (e) {
        return res.status(500).json({ success: false, msg: "error on " + e })

    }
})

route.get('/find/limit/home', async (req, res) => {
    
    let product
    // console.log(qsex,qcatagory)
    try {
       
            product = await Product.find().limit(20)
        

        if (!product) {
            return res.status(401).json({ success: false, msg: "no such product" })


        }

        return res.status(201).json({ succsess: true, msg: "request completed successfully", data: product })
    }
    catch (e) {
        return res.status(500).json({ success: false, msg: "error on " + e })

    }
})


route.get('/search', async (req, res) => {
    const q = req.query.q
    try {
        const result=await Product.find({title:{$regex:new RegExp(q)}},{_v:0})
        // const result = await Product.find({
        //     $match: {
        //         $or: [
        //             {
        //                 title: {
        //                     $regex: new RegExp(q),
        //                     // $options: i
        //                 }
        //             },
        //             {
        //                 catagory: {
        //                     $regex: new RegExp(q),
        //                     // $options: i
        //                 }
        //             }
        //         ]
        //     }},{_id:0,_v:0})
        // if (result.length>=0) {
        //     res.json({ msg: "search successfulin", success: true, data: result })
        // }
        // console.log(result)
        if(result.length==0){
            res.json({msg:"No search results found",success:false})
            // console.log("kandanchibesteker")
        }
        else{
            res.json({ msg: "search successfulin", success: true, data: result }) 
        }
    }
    catch (e) {
        res.status(500).json({ msg: "failed " + e, success: false })

    }



})

module.exports = route;