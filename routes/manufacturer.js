const app = require("express")
const route = app.Router()
const User = require("../model/userModel")
const Manufacturer = require("../model/manufacturerModel")
// const Manucaturer = require("../model/")
const genert = require("../auth/password").genpassword

const authTest = require("./verifyToken").authTest

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
      const { manufacturer } = userType
      const { manufacturerId } = manufacturer
      const updatedManufacturer = await Manufacturer.findOneAndUpdate(
        { _id: manufacturerId },
        {
          $set: req.body,
        }
      )
      // console.log(updatedFirm)
      if (updatedManufacturer) {
        return res.status(201).json({
          success: true,
          msg: "update complete",
          data: { others, updatedManufacturer },
        })
      }

      return res.status(201).json({
        success: true,
        msg: "updated user but not his Manufacturer",
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
  "/find/manufacturerpage",
  pagination(User, "manufacturer"),
  async (req, res) => {
    // pagination(User, "firm"),
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
  }
)

// get singel firms in the db
route.get("/find/singlepage/:id", async (req, res) => {
  const query = req.query.new
  try {
    const manufacturer = await User.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: "manufacturers",
          localField: "userType.manufacturer.manufacturerId",
          foreignField: "_id",
          as: "manufacturerData",
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
      data: manufacturer,
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
    const average = await Manufacturer.aggregate([
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
        .json({ success: false, msg: "no such manufacturer found" })
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
  "/ratemanufacturer/:id/:manufacturerId",
  authTest,
  async (req, res) => {
    console.log(req.params.manufacturerId)
    // const manufacturerId = JSON.parse(req.params.manufacturerId)
    try {
      // const userReview = User.findOne({ "review.reviewedUser.manufacturerId": req.params.manufacturerId })

      const updatedReview = await User.findOneAndUpdate(
        {
          _id: req.params.id,
          "review.reviewedUser.manufacturer.manufacturerId":
            req.params.manufacturerId,
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
        const manufacturerUpdatedReview = await Manufacturer.findOneAndUpdate(
          {
            _id: req.params.manufacturerId,
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
        const { reviewRecieved } = manufacturerUpdatedReview
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
                  manufacturer: {
                    ismanufacturer: true,
                    manufacturerId: req.params.manufacturerId,
                  },
                },
              },
            },
          },
          { new: true }
        )
        console.log("ne review here")
        console.log(newReview)
        const newManufacturerReview = await Manufacturer.findOneAndUpdate(
          { _id: req.params.manufacturerId },
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
        console.log(newManufacturerReview)
        const { review } = newReview
        const { reviewRecieved } = newManufacturerReview
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
  "/followmanufacturer/:id/:manufacturerId",
  authTest,
  async (req, res) => {
    const id = req.params.id
    const manufacturerId = req.params.manufacturerId
    try {
      const foundUser = await Manufacturer.findOne({
        userId: id,
        _id: manufacturerId,
      })
      const isAlreadyFollowing = await Manufacturer.findOne({
        _id: manufacturerId,
        "manufacturerInfo.followers": id,
      })
      if (foundUser) {
        return res
          .status(201)
          .json({ success: false, msg: "cant follow your own accounts" })
      }
      if (isAlreadyFollowing) {
        return res
          .status(201)
          .json({ success: false, msg: "already following the manufacturer" })
      }
      const followUser = await Manufacturer.findOneAndUpdate(
        { _id: manufacturerId },
        { $push: { "manufacturerInfo.followers": req.params.id } },
        { new: true }
      )
      if (followUser) {
        console.log(followUser)
        const userFollowing = await User.findOneAndUpdate(
          { _id: id },
          { $push: { following: manufacturerId } },
          { new: true }
        )
        if (!userFollowing) {
          return res.status(409).json({
            success: false,
            msg: "you are now following this account it just isn'r added",
            data: followUser,
          })
        }
        const { manufacturerInfo } = followUser
        const { followers } = manufacturerInfo
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
  "/unfollowmanufacturer/:id/:manufacturerId",
  authTest,
  async (req, res) => {
    const id = req.params.id
    const manufacturerId = req.params.manufacturerId
    try {
      // const foundUser = await manufacturer.findOne({ _id: manufacturerId, "manufacturerInfo.followers": req.params.id })
      const foundUser = await Manufacturer.findOneAndUpdate(
        { _id: manufacturerId, "manufacturerInfo.followers": req.params.id },
        {
          $pull: {
            "manufacturerInfo.followers": req.params.id,
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
        { _id: req.params.id, following: manufacturerId },
        {
          $pull: { following: manufacturerId },
        },
        { multi: false, upsert: false }
      )
      if (!user) {
        console.log("coundn't find user following manufacturer")
        return res.status(201).json({
          success: false,
          msg: "coundn't find user following manufacturer",
        })
      }
      console.log("found it")

      const { manufacturerInfo } = foundUser
      const { followers } = manufacturerInfo
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
