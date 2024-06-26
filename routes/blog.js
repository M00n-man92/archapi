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
        msg: "Created successfully",
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
        msg: "Created successfully",
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
        msg: "Created successfully",
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

// find blogs a user has made
route.get("/finduserblog/:id", authTest, async (req, res) => {
  try {
    const blog = await Blog.find({ "userInfo.userId": req.params.id })
    if (!blog) {
      return res.status(401).json({ success: false, msg: "no such blog" })
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

// delete
route.delete("/delete/:id/:blogId", authTest, async (req, res) => {
  console.log(req.params.id, req.params._id)
  try {
    const blog = await Blog.findOne({ _id: req.params.blogId })
    // console.log(blog)
    if (blog) {
      const { userInfo } = blog
      if (userInfo.firm[0]) {
        const firm = await Firm.findOneAndUpdate(
          { _id: userInfo.firm[0].firmId },
          {
            $pull: { blogs: { blogId: req.params.blogId } },
          },
          { new: true }
        )
        console.log(firm)
        await blog.deleteOne({ _id: req.params.blogId })
        return res.status(201).json({
          succsess: true,
          msg: "delted successfully",
          data: { firm, blog },
        })
      } else if (userInfo.professional[0]) {
        const professional = await Professional.findOneAndUpdate(
          { _id: userInfo.professional[0].professionalId },
          {
            $pull: { blogs: { blogId: req.params.blogId } },
          },
          { new: true }
        )
        await blog.deleteOne({ _id: req.params.blogId })
        // const deletedblog = await blog.findOneAndDelete({ _id: req.params.blogId })
        return res.status(201).json({
          succsess: true,
          msg: "delted successfully",
          data: { professional, blog },
        })
      } else if (userInfo.manufacturer[0]) {
        const manufacturer = await Manufacturer.findOneAndUpdate(
          { _id: userInfo.manufacturer[0].manufacturerId },
          {
            $pull: { blogs: { blogId: req.params.blogId } },
          },
          { new: true }
        )
        await blog.deleteOne({ _id: req.params.blogId })
        return res.status(201).json({
          succsess: true,
          msg: "delted successfully",
          data: { manufacturer, blog },
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
