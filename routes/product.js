const app = require("express")
const route = app.Router()
const Product = require("../model/productModel")
const User = require("../model/userModel")
const Firm = require("../model/firmModel")
const Manufacturer = require("../model/manufacturerModel")
const Professional = require("../model/professionalModel")
const { pagination } = require("./pagination")
const authTestAdmin = require("./verifyToken").authTestAdmin
const authTest = require("./verifyToken").authTest
const mongoose = require("mongoose")

route.post("/newproduct/:id", authTest, async (req, res) => {
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

        const product = await new Product(obj)

        const newProduct = await product.save()
        newProduct &&
          (await Firm.findOneAndUpdate(
            { _id: firmId },
            {
              $push: {
                products: {
                  productId: newProduct._id,
                },
              },
            },
            { new: true }
          ))

        return res.status(201).json({
          success: true,
          msg: "created successfully",
          data: newProduct,
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

        const product = await new Product(obj)
        const newProduct = await product.save()
        newProduct &&
          (await Professional.findOneAndUpdate(
            { _id: professionalId },
            {
              $push: {
                products: {
                  productId: newProduct._id,
                },
              },
            },
            { new: true }
          ))

        return res.status(201).json({
          success: true,
          msg: "created successfully",
          data: newProduct,
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

        const product = await new Product(obj)
        const newProduct = await product.save()
        newProduct &&
          (await Manufacturer.findOneAndUpdate(
            { _id: manufacturerId },
            {
              $push: {
                products: {
                  productId: newProduct._id,
                },
              },
            },
            { new: true }
          ))
        return res.status(201).json({
          success: true,
          msg: "created successfully",
          data: newProduct,
        })
      } else {
        return res.status(409).json({
          success: false,
          msg: "user doesn't seem to be a firm or manufacturer or a rofessional",
        })
      }
    }

    return res
      .status(201)
      .json({ success: false, msg: "user doesn't seem to excist" })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ success: false, error: e })
  }
})

// update a single product
route.put("/update/:id/:productId", authTest, async (req, res) => {
  // console.log(req.params.id)

  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: req.params.productId, "userInfo.userId": req.params.id },
      {
        $set: req.body,
      },
      { new: true }
    )

    if (!updatedProduct) {
      return res.status(409).json({
        success: false,
        msg: "couldn't find the product",
      })
    }
    return res.status(201).json({
      success: true,
      msg: "product updated",
      data: updatedProduct,
    })
  } catch (e) {
    console.log("eooor" + e)
    return res.status(500).json({
      success: false,
      msg: "error on pur part. we are on it now",
      error: e,
    })
  }
})

// to get every product with the help of pagination function
route.get("/find", pagination(Product), async (req, res) => {
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

// get a specific product
route.get("/find/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
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

// find products a user has made
route.get("/finduserproduct/:id", async (req, res) => {
  try {
    // const product = await Product.find({ "userInfo.userId": req.params.id })
    console.log(req.params.id)
    const product = await Product.aggregate([
      { $match: { "userInfo.userId": mongoose.Types.ObjectId(req.params.id) } },

      {
        $project: {
          _id: 1,
          discription: 1,
          image: 1,
          title: 1,
          // totalcount: { $count: "$reviewRecieved.value" },
        },
      },
    ])
    if (!product) {
      return res.status(401).json({ success: false, msg: "no such product" })
    }
    // const [{ title, discription, image }] = product
    return res.status(201).json({
      succsess: true,
      msg: "request completed successfully",
      data: product,
    })
  } catch (e) {
    return res.status(500).json({ success: false, msg: "error on " + e })
  }
})

// find products that match the catagory of the query
route.get("/findrecent", async (req, res) => {
  const qcatagoryone = req.query.catagoryone
  const qcatagorytwo = req.query.catagorytwo
  const qnew = req.query.new
  const qsex = req.query.sex
  let product
  console.log(qsex, qcatagoryone, qcatagorytwo)
  try {
    if (qsex && qcatagoryone) {
      console.log("hello world")
      product = await Product.find({ catagory: [qsex, qcatagoryone] })
    } else if (qcatagoryone && qcatagorytwo) {
      console.log("qcatagory")
      product = await Product.find({
        catagory: { $in: [qcatagoryone, qcatagorytwo] },
      })
    } else if (qcatagoryone) {
      console.log("qcatagory")
      product = await Product.find({
        catagory: { $in: [qcatagoryone] },
      })
    } else if (qsex) {
      console.log("qsex")
      product = await Product.find({ catagory: { $in: [qsex] } })
    } else if (qnew) {
      product = await Product.find().sort({ createdAt: -1 }).limit(2)
    } else {
      product = await Product.find()
    }

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

route.get("/search", async (req, res) => {
  const q = req.query.q
  try {
    const result = await Product.find(
      { title: { $regex: new RegExp(q) } },
      { _v: 0 }
    )
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
    } else {
      res.json({ msg: "search successfulin", success: true, data: result })
    }
  } catch (e) {
    res.status(500).json({ msg: "failed " + e, success: false })
  }
})

module.exports = route
