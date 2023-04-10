const app = require("express")
const route = app.Router()
const User = require("../model/userModel")
const Firm = require("../model/firmModel")
const Professional = require("../model/professionalModel")
// const Manucaturer = require("../model/")
const genert = require("../auth/password").genpassword
const validPassword = require("../auth/password").validPassword
const jwt = require("jsonwebtoken")
const authTestAdmin = require("./verifyToken").authTestAdmin
const authTest = require("./verifyToken").authTest
const nodemailer = require("nodemailer")
const gravatar = require("gravatar")
const mongoose = require("mongoose")
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
      const { professional } = userType
      const { professionalId } = professional
      const updatedProfessional = await Professional.findOneAndUpdate(
        { _id: professionalId },
        {
          $set: req.body,
        }
      )
      // console.log(updatedFirm)
      if (updatedProfessional) {
        return res.status(201).json({
          success: true,
          msg: "update complete",
          data: { others, updatedProfessional },
        })
      }

      return res.status(201).json({
        success: true,
        msg: "updated user but not his professional",
        data: others,
      })
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

route.get(
  "/find/professionalpage",
  pagination(User, "professional"),
  async (req, res) => {
    const query = req.query.new
    try {
      // const usertype = User.userType.firm.isFirm

      return res.status(201).json({
        succsess: true,
        msg: "loaded successfully",
        data: res.paginatedResults,
      })
    } catch (e) {
      return res.status(500).json({ success: false, msg: "error on " + e })
    }
    /* const query = req.query.new
  try {
    const professional = await User.aggregate([
      { $match: { "userType.professional.isProfessional": true } },
      {
        $lookup: {
          from: "professionals",
          localField: "userType.professional.professionalId",
          foreignField: "_id",
          as: "professionalData",
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
          professionalData: {
            image: 1,
            catagory: 1,
            logo: 1,
            projects: 1,
            reviewRecieved: 1,
            aboutProfessional: 1,
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
      data: professional,
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ success: false, msg: "error on " + e })
  } */
  }
)

// get singel firms in the db
route.get("/find/singlepage/:id", async (req, res) => {
  const query = req.query.new
  try {
    const professional = await User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: "professionals",
          localField: "userType.professional.professionalId",
          foreignField: "_id",
          as: "professionalData",
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
      data: professional,
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ success: false, msg: "error on " + e })
  }
})

// review getter
route.get("/review/:id", async (req, res) => {
  try {
    console.log(req.params.id)
    const average = await Professional.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },

      {
        $project: {
          avgRating: { $avg: "$reviewRecieved.value" },
          // totalcount: { $count: "$reviewRecieved.value" },
        },
      },
    ])
    if (!average) {
      return res
        .status(401)
        .json({ success: false, msg: "no such professional found" })
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
route.put(
  "/rateprofessional/:id/:professionalId",
  authTest,
  async (req, res) => {
    console.log(req.params.professionalId)
    // const professionalId = JSON.parse(req.params.professionalId)
    try {
      // const userReview = User.findOne({ "review.reviewedUser.professionalId": req.params.professionalId })

      const updatedReview = await User.findOneAndUpdate(
        {
          _id: req.params.id,
          "review.reviewedUser.professional.professionalId":
            req.params.professionalId,
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
        const professionalUpdatedReview = await Professional.findOneAndUpdate(
          {
            _id: req.params.professionalId,
            "reviewRecieved.userId": req.params.id,
          },
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
        const { reviewRecieved } = professionalUpdatedReview
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
                  professional: {
                    isprofessional: true,
                    professionalId: req.params.professionalId,
                  },
                },
              },
            },
          },
          { new: true }
        )
        console.log("ne review here")
        console.log(newReview)
        const newProfessionalReview = await Professional.findOneAndUpdate(
          { _id: req.params.professionalId },
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
        console.log(newProfessionalReview)
        const { review } = newReview
        const { reviewRecieved } = newProfessionalReview
        return res.status(201).json({
          success: true,
          msg: "new review set",
          data: { review, reviewRecieved },
        })
      }
    }
  }
)

/// route for following firm
route.put(
  "/followprofessional/:id/:professionalId",
  authTest,
  async (req, res) => {
    const id = req.params.id
    const professionalId = req.params.professionalId
    try {
      const foundUser = await Professional.findOne({
        userId: id,
        _id: professionalId,
      })
      const isAlreadyFollowing = await Professional.findOne({
        _id: professionalId,
        "professionalInfo.followers": id,
      })
      if (foundUser) {
        return res
          .status(201)
          .json({ success: false, msg: "cant follow your own accounts" })
      }
      if (isAlreadyFollowing) {
        return res
          .status(201)
          .json({ success: false, msg: "already following the professional" })
      }
      const followUser = await Professional.findOneAndUpdate(
        { _id: professionalId },
        { $push: { "professionalInfo.followers": req.params.id } },
        { new: true }
      )
      if (followUser) {
        console.log(followUser)
        const userFollowing = await User.findOneAndUpdate(
          { _id: id },
          { $push: { following: professionalId } },
          { new: true }
        )
        if (!userFollowing) {
          return res.status(409).json({
            success: false,
            msg: "you are now following this account it just isn'r added",
            data: followUser,
          })
        }
        const { professionalInfo } = followUser
        const { followers } = professionalInfo
        const { following } = userFollowing
        return res.status(201).json({
          success: true,
          msg: "you are now following this account",
          data: { followers, following },
        })
      } else {
        return res.status(501).json({
          success: false,
          msg: "could follow account something went wrong",
        })
      }
    } catch (e) {
      return res.status(500).json({
        success: false,
        msg: "error on pur part. we are on it now",
        error: e,
      })
    }
  }
)

// route to unfollow user
route.put(
  "/unfollowprofessional/:id/:professionalId",
  authTest,
  async (req, res) => {
    const id = req.params.id
    const professionalId = req.params.professionalId
    try {
      // const foundUser = await professional.findOne({ _id: professionalId, "professionalInfo.followers": req.params.id })
      const foundUser = await Professional.findOneAndUpdate(
        { _id: professionalId, "professionalInfo.followers": req.params.id },
        {
          $pull: {
            "professionalInfo.followers": req.params.id,
          },
        },
        { multi: false, upsert: false }
      )
      console.log(foundUser)
      if (!foundUser) {
        console.log("didint find it")
        return res.status(201).json({
          success: false,
          msg: "cant unfollow since you're not following account",
        })
      }
      const user = await User.findOneAndUpdate(
        { _id: req.params.id, following: professionalId },
        {
          $pull: { following: professionalId },
        },
        { multi: false, upsert: false }
      )
      if (!user) {
        console.log("coundn't find user following professional")
        return res.status(201).json({
          success: false,
          msg: "coundn't find user following professional",
        })
      }
      console.log("found it")

      const { professionalInfo } = foundUser
      const { followers } = professionalInfo
      const { following } = user

      return res.status(201).json({
        success: true,
        msg: "unfollowed successfully",
        data: { followers, following },
      })
    } catch (e) {
      console.log(e)
      return res.status(500).json({
        success: false,
        msg: "error on pur part. we are on it now",
        error: e,
      })
    }
  }
)

module.exports = route
