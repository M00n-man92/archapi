const app = require("express")
const route = app.Router()
const mongoose = require("mongoose")
// const project = require('../model/productModel')
const Project = require("../model/projectModel")
const User = require("../model/userModel")
const Firm = require("../model/firmModel")
const authTestAdmin = require("./verifyToken").authTestAdmin
const authTest = require("./verifyToken").authTest
const { pagination } = require("./pagination")
const Professional = require("../model/professionalModel")
const Manufacturer = require("../model/manufacturerModel")
route.post("/newproject/:id", authTest, async (req, res) => {
  const newobj = req.body

  try {
    const user = await User.findOne({ _id: req.params.id })

    if (user) {
      const { userType } = user
      const { firm, professional, manufacturer } = userType

      const { isFirm, firmId, firmName } = firm
      const { isManufacturer, manufacturerId, manufacturerName } = manufacturer
      const { isProfessional, professionalId, professionalName } = professional

      if (isFirm) {
        const userInfo = {
          userName: user.userName,
          name: user.name,
          userId: req.params.id,
          lastName: user.lastName,
          firm: [{ firmName: firmName, firmId: firmId }],
        }
        const obj = { ...newobj, userInfo }

        // console.log(obj)

        const project = await new Project(obj)

        const newProject = await project.save()
        newProject &&
          (await Firm.findOneAndUpdate(
            { _id: firmId },
            {
              $push: {
                projects: {
                  projectId: newProject._id,
                },
              },
            },
            { new: true }
          ))
        return res.status(201).json({
          success: true,
          msg: "created successfully",
          data: project,
        })
      } else if (isProfessional) {
        const userInfo = {
          userName: user.userName,
          name: user.name,
          userId: req.params.id,
          lastName: user.lastName,
          professional: [
            {
              professionalName: professionalName,
              professionalId: professionalId,
            },
          ],
        }
        const obj = { ...newobj, userInfo }

        // console.log(obj)

        const project = await new Project(obj)
        const newProject = await project.save()
        newProject &&
          (await Professional.findOneAndUpdate(
            { _id: professionalId },
            {
              $push: {
                projects: {
                  projectId: newProject._id,
                },
              },
            },
            { new: true }
          ))
        return res.status(201).json({
          success: true,
          msg: "created successfully",
          data: newProject,
        })
      } else if (isManufacturer) {
        const userInfo = {
          userName: user.userName,
          name: user.name,
          userId: req.params.id,
          lastName: user.lastName,
          manufacturer: [
            {
              manufacturerName: manufacturerName,
              manufacturerId: manufacturerId,
            },
          ],
        }
        const obj = { ...newobj, userInfo }

        // console.log(obj)

        const project = await new Project(obj)
        const newProject = await project.save()
        newProject &&
          (await Manufacturer.findOneAndUpdate(
            { _id: manufacturerId },
            {
              $push: {
                projects: {
                  projectId: newProject._id,
                },
              },
            },
            { new: true }
          ))
        return res.status(201).json({
          success: true,
          msg: "created successfully",
          data: newProject,
        })
      } else {
        return res
          .status(201)
          .json({ success: false, msg: "user doesn't seem to be a firm" })
      }
    }

    return res
      .status(201)
      .json({ success: false, msg: "user doesn't seem to excist" })
  } catch (e) {
    return res.status(500).json({ success: false, error: e })
  }
})

// update a single product
route.put("/update/:id/:projectId", authTest, async (req, res) => {
  console.log("update commensing")
  try {
    const updatedProduct = await Project.findOneAndUpdate(
      { _id: req.params.projectId, "userInfo.userId": req.params.id },
      {
        $set: req.body,
      },
      { new: true }
    )
    if (!updatedProduct) {
      return res.status(409).json({
        success: false,
        msg: "couldn't find the project",
      })
    }
    return res.status(201).json({
      success: true,
      msg: "project updated",
      data: updatedProduct,
    })
  } catch (e) {
    return res.status(500).json({
      success: false,
      msg: "error on pur part. we are on it now",
      error: e,
    })
  }
})

// find singel project using req.params.id
route.get("/find/:id", async (req, res) => {
  try {
    console.log(req.params.id)
    const average = await Project.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },

      {
        $project: {
          _id: 1,
          discription: 1,
          image: 1,
          catagory: 1,
          userInfo: 1,
          title: 1,
          material: 1,
          vr: 1,
          statusApproved: 1,
          details: 1,
          features: 1,
          createdAt: 1,
          link: 1,
          suitedFor: 1,
          updatedAt: 1,
          isDigital: 1,
          reviewRecieved: 1,
          region: 1,
          avgRating: { $avg: "$reviewRecieved.value" },
          // totalcount: { $count: "$reviewRecieved.value" },
        },
      },
    ])
    if (!average) {
      return res
        .status(401)
        .json({ success: false, msg: "no such project found" })
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

// find products a user has made
route.get("/finduserproject/:id", async (req, res) => {
  try {
    // const product = await Product.find({ "userInfo.userId": req.params.id })

    const project = await Project.aggregate([
      { $match: { "userInfo.userId": mongoose.Types.ObjectId(req.params.id) } },

      {
        $project: {
          _id: 1,
          discription: 1,
          image: 1,
          title: 1,
          createdAt: 1,
          updatedAt: 1,
          catagory: 1,
          // totalcount: { $count: "$reviewRecieved.value" },
        },
      },
    ])
    if (!project) {
      return res.status(401).json({ success: false, msg: "no such project" })
    }
    // const [{ title, discription, image }] = project
    return res.status(201).json({
      succsess: true,
      msg: "request completed successfully",
      data: project,
    })
  } catch (e) {
    return res.status(500).json({ success: false, msg: "error on " + e })
  }
})

// to get every project with the help of pagination function
route.get("/find", pagination(Project), async (req, res) => {
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
})

/// route for rating project
route.put("/rateproject/:id/:projectId", authTest, async (req, res) => {
  console.log(req.body)
  const projectId = req.params.projectId
  try {
    // const userReview = User.findOne({ "review.reviewedUser.projectId": req.params.projectId })

    const updatedReview = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        "review.reviewedItem.project.projectId": req.params.projectId,
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
      const projectUpdatedReview = await Project.findOneAndUpdate(
        { _id: req.params.projectId, "reviewRecieved.userId": req.params.id },
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
      const { reviewRecieved } = projectUpdatedReview
      return res.status(201).json({
        success: true,
        msg: "update complete",
        data: { review, reviewRecieved },
      })
    }
  } catch (e) {
    // console.log(e)
    const error = e.toString()
    const isError = error.indexOf("MongoServerError: Plan executor error")
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
              reviewedItem: {
                project: {
                  isProject: true,
                  projectId: req.params.projectId,
                },
              },
            },
          },
        },
        { new: true }
      )
      console.log("ne review here")
      console.log(newReview)
      const newProjectReview = await Project.findOneAndUpdate(
        { _id: req.params.projectId },
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
      // console.log(newFirmReview)
      const { review } = newReview
      const { reviewRecieved } = newProjectReview
      return res.status(201).json({
        success: true,
        msg: "new review set",
        data: { review, reviewRecieved },
      })
    }
  }
})

// find the average of the reviews
route.get("/find/averagereview/:id", async (req, res) => {
  const projectId = req.params.id
  //
  try {
    const average = await Project.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(projectId) } },

      {
        $project: {
          _id: 1,
          discription: 1,
          image: 1,
          catagory: 1,
          userInfo: 1,

          material: 1,
          vr: 1,
          statusApproved: 1,
          details: 1,
          features: 1,

          link: 1,
          suitedFor: 1,

          isDigital: 1,
          reviewRecieved: 1,
          region: 1,
          avg_rating: { $avg: "$reviewRecieved.value" },
        },
      },
    ])
    return res.status(201).json(average)
  } catch (e) {
    return res.status(500).json({ success: false, msg: "errsdfasdfor on " + e })
  }
})

route.get("/find/limit/home", async (req, res) => {
  let product
  // console.log(qsex,qcatagory)
  try {
    product = await Product.find().limit(20)

    if (!product) {
      return res.status(401).json({ success: false, msg: "no such product" })
    }

    return res.status(201).json({
      succsess: true,
      msg: "request completed successfully",
      data: product,
    })
  } catch (e) {
    return res.status(500).json({ success: false, msg: "error on " + e })
  }
})

// search a single product
route.get("/search", async (req, res) => {
  const q = req.query.q
  console.log(q)
  try {
    const result = await Project.find(
      { title: { $regex: new RegExp(q) } },
      { _v: 0 }
    )
    if (result.length == 0) {
      res.json({ msg: "No search results found", success: false })
      // console.log("kandanchibesteker")
    } else {
      res.json({ msg: "search successfulin", success: true, data: result })
    }
  } catch (e) {
    res.status(500).json({ msg: "failed " + e, success: false })
  }
})

// delete
route.delete("/delete/:id/:projectId", authTest, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId })
    // console.log(project)
    if (project) {
      const { userInfo } = project
      if (userInfo.firm[0]) {
        const firm = await Firm.findOneAndUpdate(
          { _id: userInfo.firm[0].firmId },
          {
            $pull: { projects: { projectId: req.params.projectId } },
          },
          { new: true }
        )
        console.log(firm)
        await project.deleteOne({ _id: req.params.projectId })
        return res.status(201).json({
          succsess: true,
          msg: "delted successfully",
          data: { firm, project },
        })
      } else if (userInfo.professional[0]) {
        const professional = await Professional.findOneAndUpdate(
          { _id: userInfo.professional[0].professionalId },
          {
            $pull: { projects: { projectId: req.params.projectId } },
          },
          { new: true }
        )
        await project.deleteOne({ _id: req.params.projectId })
        // const deletedProject = await Project.findOneAndDelete({ _id: req.params.projectId })
        return res.status(201).json({
          succsess: true,
          msg: "delted successfully",
          data: { professional, project },
        })
      } else if (userInfo.manufacturer[0]) {
        const manufacturer = await Manufacturer.findOneAndUpdate(
          { _id: userInfo.manufacturer[0].manufacturerId },
          {
            $pull: { projects: { projectId: req.params.projectId } },
          },
          { new: true }
        )
        await project.deleteOne({ _id: req.params.projectId })
        return res.status(201).json({
          succsess: true,
          msg: "delted successfully",
          data: { manufacturer, project },
        })
      } else {
        console.log(
          "something is wrong since it couldn't find the user which created it"
        )
        return res.status(409).json({
          succsess: false,
          msg: "user cannot delete the project",
        })
      }
    }

    return res
      .status(501)
      .json({ succsess: false, msg: "could't find the project" })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ success: false, msg: "error on " + e })
  }
})

module.exports = route
