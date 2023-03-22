const app = require("express")
const route = app.Router()
const User = require("../model/userModel")
const Blog = require("../model/blogModel")
const genert = require("../auth/password").genpassword
const validPassword = require("../auth/password").validPassword
const jwt = require("jsonwebtoken")
const authTestAdmin = require("./verifyToken").authTestAdmin
const authTest = require("./verifyToken").authTest
const nodemailer = require("nodemailer")
const gravatar = require("gravatar")
const { pagination } = require("./pagination")
route.post("/create/:id", authTest, async (req, res) => {
  console.log(req.body)

  const { image, discription, title, source } = req.body
  try {
    const user = await User.findOne({ _id: req.params.id })
    if (!user) {
      return res.status(409).json({
        success: false,
        msg: "user doesn't appear to exsist.",
      })
    }
    console.log(user)
    const { name, userName, lastName } = user
    const userInfo = { name, userName, lastName, userId: req.params.id }
    const blog = new Blog({
      title,
      image,
      source,
      discription,
      userInfo,
    })
    console.log(blog)
    const newblog = await blog.save()
    if (!newblog) {
      return res.status(501).json({
        success: false,
        msg: "something went wrong on our part. Trying to fix it now",
      })
    }
    return res.status(201).json({
      success: true,
      msg: "blog created successfully",
      data: newblog,
    })
  } catch (e) {}
})

route.put("/update/:id", authTest, async (req, res) => {
  try {
    const updatedBlog = await Blog.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: req.body,
      },
      { new: true }
    )
    // console.log(updatedUser)

    // console.log(updatedFirm)

    if (updatedBlog) {
      return res
        .status(201)
        .json({ success: true, msg: "update complete", data: others })
    } else {
      return res.status(409).json({
        success: false,
        msg: "couldn't update blog.",
      })
    }
  } catch (e) {
    return res.status(500).json({ success: false, msg: "error on " + e })
  }
})

route.get("/find", pagination(Blog), async (req, res) => {
  const query = req.query.new
  try {
    // const usertype = User.userType.firm.isFirm

    return res
      .status(201)
      .json({
        succsess: true,
        msg: "loaded successfully",
        data: res.paginatedResults,
      })
  } catch (e) {
    return res.status(500).json({ success: false, msg: "error on " + e })
  }
})
route.get("/find/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(401).json({ success: false, msg: "no such firm found" })
    }

    const { password, userType, ...others } = user._doc
    const { firm } = userType
    const { firmId } = firm
    const firmFound = await Firm.findById(firmId)
    const data = { firm: firmFound, user: others }
    return res
      .status(201)
      .json({ succsess: true, msg: "firm found successfully", data: data })
  } catch (e) {
    return res.status(500).json({ success: false, msg: "error on " + e })
  }
})
route.get("/find/:id/:nonid", authTest, async (req, res) => {
  try {
    const user = await User.findById(req.params.nonid)
    if (!user) {
      return res.status(401).json({ success: false, msg: "no such user" })
    }
    const { password, ...others } = user._doc
    return res.status(201).json({
      succsess: true,
      msg: "request completed successfully",
      data: others,
    })
  } catch (e) {
    return res.status(500).json({ success: false, msg: "error on " + e })
  }
})
route.get("/status", authTest, async (req, res) => {
  const date = new Date()
  const lastyear = new Date(date.setFullYear(date.getFullYear() - 1))
  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastyear } } },
      { $project: { month: { $month: "$createdAt" } } },
      { $group: { _id: "$month", total: { $sum: 1 } } },
    ])
    return res.status(201).json(data)
  } catch (e) {
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
    const decoded = await jwt.verify(token, process.env.JWT_CONFORMATION_PASS, {
      complete: true,
    })

    const id = decoded.payload.id
    console.log(id)
    const updatedUser = await User.findOneAndUpdate(
      { _id: id },
      {
        $set: { password: req.body.password },
      },
      { new: true }
    )

    if (updatedUser) {
      console.log("here")
      console.log(updatedUser)
      // res.status(301).redirect("http://localhost:5000/login")
      return res
        .status(201)
        .json({ success: true, msg: "update complete, proceed to login page" })
    } else {
      return res
        .status(409)
        .json({ success: false, msg: "something went wrong." })
    }
  } catch (e) {
    return res
      .status(500)
      .json({ success: false, msg: "error on pur part. we are on it now" })
  }
})

module.exports = route
