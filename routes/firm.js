const app = require("express")
const route = app.Router()
const User = require("../model/userModel")
const Firm = require("../model/firmModel")
// const Manucaturer = require("../model/")
const genert = require("../auth/password").genpassword
const validPassword = require("../auth/password").validPassword
const jwt = require("jsonwebtoken")
const authTestAdmin = require("./verifyToken").authTestAdmin
const authTest = require("./verifyToken").authTest
const nodemailer = require("nodemailer")
const gravatar = require("gravatar")
const mongoose = require("mongoose")
const Products = require("../model/productModel")
const { pagination } = require("./pagination")
route.put("/update/:id", authTest, async (req, res) => {
  console.log("there is only one here")
  console.log(req.body.password)
  if (req.body.password) {
    req.body.password = await genert(req.body.password)
  }
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user.id },
      {
        $set: req.body,
      },
      { new: true }
    )
    // console.log(updatedUser)

    // if (req.body.firmInfo||req.body.logo||req.body.image||aboutFirm)
    if (updatedUser) {
      const { password, _id, token, userType, ...others } = updatedUser._doc
      const { firm } = userType
      const { firmId } = firm
      console.log(firm)
      const updatedFirm = await Firm.findOneAndUpdate(
        { _id: firmId },
        {
          $set: req.body,
        }
      )
      // console.log(updatedFirm)
      if (updatedFirm) {
        return res.status(201).json({
          success: true,
          msg: "update complete",
          data: { others, updatedFirm },
        })
      }

      return res
        .status(201)
        .json({ success: true, msg: "update complete", data: others })
    } else {
      return res.status(409).json({
        success: false,
        msg: "couldn't locate the user and update it.",
      })
    }
  } catch (e) {
    return res.status(500).json({ success: false, msg: "error on " + e })
  }
})

route.get("/find/firmpage", async (req, res) => {
  // pagination(User, "firm"),
  const query = req.query.new
  try {
    const firm = await User.aggregate([
      { $match: { "userType.firm.isFirm": true } },
      {
        $lookup: {
          from: "firms",
          localField: "userType.firm.firmId",
          foreignField: "_id",
          as: "firmData",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          userName: 1,
          profilepic: 1,
          createdAt: 1,
          updatedAt: 1,
          firmData: {
            image: 1,
            catagory: 1,
            logo: 1,
            projects: 1,
            reviewRecieved: 1,
            aboutFirm: 1,
            projects: 1,
            reviewRecieved: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      },
      // { $project: { avgRating: { $avg: "firmData.$reviewRecieved.value" } } },
    ])
    return res.status(201).json({
      succsess: true,
      msg: "loaded successfully",
      data: firm,
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ success: false, msg: "error on " + e })
  }
})

// get singel firms in the db
route.get("/find/singlepage/:id", async (req, res) => {
  const query = req.query.new
  try {
    const firm = await User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: "firms",
          localField: "userType.firm.firmId",
          foreignField: "_id",
          as: "firmData",
        },
      },
      // {
      //   $group: {
      //     _id: "avg_duration",
      //     avgRating: { $avg: "firmData.$reviewRecieved.value" },
      //   },
      // },
    ])
    return res.status(201).json({
      succsess: true,
      msg: "loaded successfully",
      data: firm,
    })
  } catch (e) {
    console.log(e)
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

// review getter
route.get("/review/:id", async (req, res) => {
  try {
    console.log(req.params.id)
    const average = await Firm.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },

      {
        $project: {
          avgRating: { $avg: "$reviewRecieved.value" },
          // totalcount: { $count: "$reviewRecieved.value" },
        },
      },
    ])
    if (!average) {
      return res.status(401).json({ success: false, msg: "no such firm found" })
    }

    return res.status(201).json({
      succsess: true,
      msg: "request completed successfully",
      data: average,
    })
  } catch (e) {
    return res.status(500).json({ success: false, msg: "errsdfasdfor on " + e })
  }
})

/// route for rating project
route.put("/ratefirm/:id/:firmId", authTest, async (req, res) => {
  console.log(req.body)
  const firmId = req.params.firmId
  try {
    // const userReview = User.findOne({ "review.reviewedUser.firmId": req.params.firmId })

    const updatedReview = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        "review.reviewedUser.firm.firmId": req.params.firmId,
      },

      {
        $set: {
          "review.$.value": req.body.value,
          "review.$.comment": req.body.comment,
        },
      },
      { upsert: true }
    )
    console.log("update revie user in progress")
    console.log(updatedReview)
    if (updatedReview) {
      const firmUpdatedReview = await Firm.findOneAndUpdate(
        { _id: req.params.firmId, "reviewRecieved.userId": req.params.id },
        {
          $set: {
            "reviewRecieved.$.userId": req.params.id,
            "reviewRecieved.$.value": req.body.value,
            "reviewRecieved.$.comment": req.body.comment,
            "reviewRecieved.$.image": req.body.image,
            "reviewRecieved.$.name": updatedReview.name,
            "reviewRecieved.$.lastName": updatedReview.lastName,
            "reviewRecieved.$.userImage": updatedReview.profilepic,
          },
        },
        { upsert: true }
      )
      const { review } = updatedReview
      const { reviewRecieved } = firmUpdatedReview
      return res.status(201).json({
        success: true,
        msg: "update complete",
        data: { review, reviewRecieved },
      })
    }
  } catch (e) {
    // console.log(e)
    const error = e.toString()
    const isError = error.indexOf("MongoServerError")
    console.log(isError)
    if (isError === -1) {
      console.log(e)
      return res.status(500).json({ success: false, msg: "error on " + e })
    } else {
      console.log("review not found")
      const newReview = await User.findOneAndUpdate(
        { _id: req.params.id },
        {
          $push: {
            review: {
              value: req.body.value,
              comment: req.body.comment,
              reviewedUser: {
                firm: {
                  isfirm: true,
                  firmId: req.params.firmId,
                },
              },
            },
          },
        },
        { new: true }
      )
      console.log("ne review here")
      console.log(newReview)
      const newFirmReview = await Firm.findOneAndUpdate(
        { _id: req.params.firmId },
        {
          $push: {
            reviewRecieved: {
              userId: req.params.id,
              value: req.body.value,
              comment: req.body.comment,
              image: req.body.image,
              userName: newReview.userName,
              name: newReview.name,
              lastName: newReview.lastName,
              userImage: newReview.profilepic,
            },
          },
        },
        { new: true }
      )
      console.log(newFirmReview)
      const { review } = newReview
      const { reviewRecieved } = newFirmReview
      return res.status(201).json({
        success: true,
        msg: "new review set",
        data: { review, reviewRecieved },
      })
    }
  }
})

module.exports = route
