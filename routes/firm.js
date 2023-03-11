const app = require('express')
const route = app.Router()
const User = require('../model/userModel')
const Firm = require('../model/firmModel')
// const Manucaturer = require("../model/")
const genert = require('../auth/password').genpassword
const validPassword = require('../auth/password').validPassword
const jwt = require('jsonwebtoken')
const authTestAdmin = require('./verifyToken').authTestAdmin
const authTest = require('./verifyToken').authTest
const nodemailer = require("nodemailer");
const gravatar = require('gravatar')

route.put('/update/:id', authTest, async (req, res) => {
  console.log("there is only one here")
  console.log(req.body.password)
  if (req.body.password) {
    req.body.password = await genert(req.body.password)
  }
  try {
      const updatedUser = await User.findOneAndUpdate({ _id: req.user.id }, {
      $set: req.body
    }, { new: true })
    // console.log(updatedUser)

    // if (req.body.firmInfo||req.body.logo||req.body.image||aboutFirm)
    if (updatedUser) {
      const {password, _id, token, userType, ...others} = updatedUser._doc
      const { firm } = userType;
      const { firmId } = firm;
      console.log(firm)
      const updatedFirm = await Firm.findOneAndUpdate({ _id: firmId }, {
          $set: req.body
        })  
      // console.log(updatedFirm)
      if (updatedFirm) {
        
        return res.status(201).json({ success: true, msg: "update complete", data: { others, updatedFirm } })
      }
    
      return res.status(201).json({ success: true, msg: "update complete", data: others })
    }
    else {
      return res.status(409).json({ success: false, msg: "couldn't locate the user and update it." })
    }

  }
  catch (e) {
    return res.status(500).json({ success: false, msg: "error on " + e })
  }

})



route.get('/find', async (req, res) => {
  const query = req.query.new
  try {
    // const usertype = User.userType.firm.isFirm 
    const user = query ? await User.find({ 'userType.firm.isFirm': true }).limit(5) : await User.find({ 'userType.firm.isFirm': true })
    console.log(user)
    return res.status(201).json({ succsess: true, msg: "loaded successfully", data: user })
  }
  catch (e) {
    return res.status(500).json({ success: false, msg: "error on " + e })
  }


})
route.get('/find/:id', async (req, res) => {
  try {

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(401).json({ success: false, msg: "no such firm found" })


    }

    const { password, userType, ...others } = user._doc
    const { firm } = userType;
    const { firmId } = firm;
    const firmFound = await Firm.findById(firmId)
    const data = { firm: firmFound, user: others }
    return res.status(201).json({ succsess: true, msg: "firm found successfully", data: data })
  }
  catch (e) {
    return res.status(500).json({ success: false, msg: "error on " + e })

  }
})
route.get('/find/:id/:nonid', authTest, async (req, res) => {
  try {

    const user = await User.findById(req.params.nonid)
    if (!user) {
      return res.status(401).json({ success: false, msg: "no such user" })


    }
    const { password, ...others } = user._doc
    return res.status(201).json({ succsess: true, msg: "request completed successfully", data: others })
  }
  catch (e) {
    return res.status(500).json({ success: false, msg: "error on " + e })

  }
})
route.get('/status', authTest, async (req, res) => {
  const date = new Date();
  const lastyear = new Date(date.setFullYear(date.getFullYear() - 1))
  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastyear } } },
      { $project: { month: { $month: "$createdAt" } } },
      { $group: { _id: "$month", total: { $sum: 1 } } }
    ])
    return res.status(201).json(data)
  }
  catch (e) {
    return res.status(500).json({ success: false, msg: "errsdfasdfor on " + e })

  }

})

route.put("/firmupdate/:token", async (req, res) => {
  console.log(req.body.password)


  if (req.body.password) {
    req.body.password = await genert(req.body.password)
  }

  const token = req.params.token
  console.log(req.body.password)


  try {

    const decoded = await jwt.verify(token, process.env.JWT_CONFORMATION_PASS, { complete: true })

    const id = decoded.payload.id
    console.log(id)
    const updatedUser = await User.findOneAndUpdate({ _id: id }, {
      $set: { password: req.body.password }
    }, { new: true })


    if (updatedUser) {
      console.log("here")
      console.log(updatedUser)
      // res.status(301).redirect("http://localhost:5000/login")
      return res.status(201).json({ success: true, msg: "update complete, proceed to login page" })

    }
    else {
      return res.status(409).json({ success: false, msg: "something went wrong." })
    }


  }
  catch (e) {
    return res.status(500).json({ success: false, msg: "error on pur part. we are on it now" })
  }


})

module.exports = route;