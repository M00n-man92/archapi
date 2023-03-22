const app = require('express')
const route = app.Router()
// const Product = require('../model/productModel')
const Project = require("../model/projectModel")
const User = require("../model/userModel")

const authTestAdmin = require('./verifyToken').authTestAdmin
const authTest = require('./verifyToken').authTest

route.post('/newproject/:id', authTest, async (req, res) => {
  const newobj = req.body

  try {
    const user = await User.findOne({ _id: req.params.id })

    if (user) {
      const { userType } = user;
      const { firm } = userType;
      const { isFirm, firmId } = firm;
      if (isFirm) {

        const obj = { ...newobj, userId: req.params.id, firmId: firmId }

        // console.log(obj)

        const project = await new Project(obj)
        const newProject = await project.save()
        return res.status(201).json({ success: true, msg: "registered successfully", data: newProject })
      }

      else {
        return res.status(201).json({ success: false, msg: "user doesn't seem to be a firm" })
      }
    }


    return res.status(201).json({ success: false, msg: "user doesn't seem to excist" })





  }
  catch (e) {
    return res.status(500).json({ success: false, error: e })
  }



})
route.put('/update/:id/:projectid', authTest, async (req, res) => {
  console.log(req.params.id)

  try {
    const user = await Project.findOne({ userId: req.params.id })
    if (user) {
      const updatedProduct = await Project.findOneAndUpdate({ _id: req.params.projectid }, {
        $set: req.body
      }, { new: true })

      if (!updatedProduct) {

        return res.status(201).json({ success: false, msg: "no project found" })
      }
      else if (updatedProduct) {
        console.log("heoolo")
        return res.status(201).json({ success: true, msg: "update complete", data: updatedProduct })
      }
      else {
        return res.status(201).json({ success: false, msg: "you can not make changes to this project" })
      }
    }

  }
  catch (e) {
    console.log("eooor" + e)
    return res.status(500).json({ success: false, msg: "error on " + e })
  }

})
route.delete('/delete/:id/:projectId', authTest, async (req, res) => {
  try {
    const user = await Project.findOneAndDelete({ userId: req.params.id, _id: req.params.projectId })
    if (user) {
      return res.status(201).json({ succsess: true, msg: "delted successfully" })

    }
    return res.status(502).json({ success: false, msg: "not allowed" })
  
  }

  catch (e) {
  return res.status(500).json({ success: false, msg: "error on " + e })

}
})

route.get('/find/:id', async (req, res) => {
  try {

    const product = await Project.findById(req.params.id)
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
  const qsex = req.query.sex
  const qfirm = req.query.firmId
  let product
  console.log(qsex, qcatagory)
  try {
    if (qsex && qcatagory) {
      console.log("hello world")
      product = await Project.find({ catagory: [qsex, qcatagory] })
    }
    else if (qcatagory) {
      console.log("qcatagory")
      product = await Project.find({ catagory: { $in: [qcatagory] } })
    }
    else if (qsex) {
      console.log("qsex")
      product = await Project.find({ catagory: { $in: [qsex] } })
    }
    else if (qnew) {
      product = await Project.find().sort({ createdAt: -1 })
    }
    else if(qfirm){
      product = await Project.find({ firmId: qfirm})

    }


    else {
      product = await Project.find()
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
  console.log(q)
  try {
    const result = await Project.find({ title: { $regex: new RegExp(q) } }, { _v: 0 })
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
    if (result.length == 0) {
      res.json({ msg: "No search results found", success: false })
      // console.log("kandanchibesteker")
    }
    else {
      res.json({ msg: "search successfulin", success: true, data: result })
    }
  }
  catch (e) {
    res.status(500).json({ msg: "failed " + e, success: false })

  }



})

module.exports = route;