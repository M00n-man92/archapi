const app = require("express")
const route = app.Router()
const User = require("../model/userModel")
const Blog = require("../model/blogModel")
const Firm = require("../model/firmModel")
const Manufacturer = require("../model/manufacturerModel")
const Professional = require("../model/professionalModel")

const validPassword = require("../auth/password").validPassword
const authTest = require("./verifyToken").authTest
const nodemailer = require("nodemailer")
const gravatar = require("gravatar")
const { pagination } = require("./pagination")

// create a new blog
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
    // console.log(user)
    const { name, userName, lastName, userType } = user
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
      const blog = new Blog({
        title,
        image,
        source,
        discription,
        userInfo,
      })

      const newblog = await blog.save()
      newblog &&
        (await Firm.findOneAndUpdate(
          { _id: firmId },
          {
            $push: {
              blogs: {
                blogId: newblog._id,
              },
            },
          },
          { new: true }
        ))

      return res.status(201).json({
        success: true,
        msg: "registered successfully",
        data: newblog,
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
      const blog = new Blog({
        title,
        image,
        source,
        discription,
        userInfo,
      })

      const newblog = await blog.save()
      newblog &&
        (await Professional.findOneAndUpdate(
          { _id: professionalId },
          {
            $push: {
              blogs: {
                blogId: newblog._id,
              },
            },
          },
          { new: true }
        ))

      return res.status(201).json({
        success: true,
        msg: "registered successfully",
        data: newblog,
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
      const blog = new Blog({
        title,
        image,
        source,
        discription,
        userInfo,
      })

      const newblog = await blog.save()
      newblog &&
        (await Manufacturer.findOneAndUpdate(
          { _id: manufacturerId },
          {
            $push: {
              blogs: {
                blogId: newblog._id,
              },
            },
          },
          { new: true }
        ))

      return res.status(201).json({
        success: true,
        msg: "registered successfully",
        data: newblog,
      })
    } else {
      return res.status(409).json({
        success: false,
        msg: "user doesn't seem to be a firm or manufacturer or a rofessional",
      })
    }
  } catch (e) {
    return res.status(500).json({ success: false, error: e })
  }
})

// update a single blog
route.put("/update/:id/:blogID", authTest, async (req, res) => {
  try {
    const updatedBlog = await Blog.findOneAndUpdate(
      { _id: req.params.blogID, "userInfo.userId": req.params.id },
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
        .json({ success: true, msg: "update complete", data: updatedBlog })
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

// to get every blog with the help of pagination function
route.get("/find", pagination(Blog), async (req, res) => {
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

//
route.get("/find/recent", async (req, res) => {
  const query = req.query.new
  try {
    // const usertype = User.userType.firm.isFirm
    const blog = await Blog.find().sort({ createdAt: -1 }).limit(5)
    if (!blog) {
      return res.status(409).json({ success: false, msg: "couldn't get blogs" })
    }
    return res.status(201).json({
      succsess: true,
      msg: "loaded successfully",
      data: blog,
    })
  } catch (e) {
    return res.status(500).json({ success: false, msg: "error on " + e })
  }
})

// find singel blog by id
route.get("/find/:blogId", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId)
    if (!blog) {
      return res
        .status(401)
        .json({ success: false, msg: "couldn't fetch such blog." })
    }
    return res.status(201).json({
      succsess: true,
      msg: "request completed successfully",
      data: blog,
    })
  } catch (e) {
    return res.status(500).json({ success: false, msg: "error on " + e })
  }
})

// search blog
route.get("/search", async (req, res) => {
  const q = req.query.q
  try {
    const result = await Blog.find(
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

module.exports = route
