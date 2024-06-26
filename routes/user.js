const app = require("express")
const route = app.Router()
const User = require("../model/userModel")
const Firm = require("../model/firmModel")
const Manufacturer = require("../model/manufacturerModel")
const Professional = require("../model/professionalModel")
// const Professional = require("../model/ProfessionalModel")
// const Manucaturer = require("../model/")
const genert = require("../auth/password").genpassword
const validPassword = require("../auth/password").validPassword
const jwt = require("jsonwebtoken")
const authTestAdmin = require("./verifyToken").authTestAdmin
const authTest = require("./verifyToken").authTest
const nodemailer = require("nodemailer")
const gravatar = require("gravatar")

route.post("/register", async (req, res) => {
  const { name, password, email, userName, type, lastName, cellPhone } =
    req.body
  let firm, manufacturer, professional
  let newFirm, newManufacturer, newProfessional
  console.log(name, password, email, userName, type, lastName, cellPhone)
  try {
    const em = await User.findOne({ email })
    const usedUserName = await User.findOne({ userName })
    if (em || usedUserName) {
      return res.status(400).json({
        success: false,
        msg: "email  or username already in use",
        data: null,
      })
    }
    const newpass = await genert(password)
    console.log(type)
    const user = new User({
      name: name,
      email: email,
      password: newpass,
      userName: userName,
      cellPhone: cellPhone,
      lastName: lastName,
      isConfirmed: true,
    })
    console.log(user)
    const avatar = await gravatar.url(user.email, {
      s: "200",
      r: "pg",
      d: "mm",
    })
    user.profilepic = avatar
    // console.log(user)
    if (type === "firm") {
      user.userType.firm.isFirm = true
      firm = await Firm({ userId: user._id })
      newFirm = await firm.save()
      user.userType.firm.firmId = newFirm._id
    }
    // console.log(user)
    else if (type === "manufacturer") {
      console.log("this is legenderay")
      user.userType.manufacturer.isManufacturer = true
      manufacturer = await Manufacturer({ userId: user._id })
      newManufacturer = await manufacturer.save()
      user.userType.manufacturer.manufacturerId = newManufacturer._id
    } else if (type === "professional") {
      console.log("brave heart energy")
      user.userType.professional.isProfessional = true
      professional = await Professional({ userId: user._id })
      newProfessional = await professional.save()
      user.userType.professional.professionalId = newProfessional._id
    }

    const newuser = await user.save()
    if (newuser) {
      console.log("herer")

      const token = jwt.sign(
        { id: newuser._id },
        process.env.JWT_CONFORMATION_PASS
        // { expiresIn: "1d" }
      )
      const { _id, password, isAdmin, isConfirmed, ...others } = newuser._doc

      return res.status(201).json({
        success: true,
        msg: "Registered successfuly",
        data: _id,
      })
      /* const url = `https://node.niddf.com/api/user/confirmation/${token}`
      console.log(url)

      let transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com",
        port: 587,
        secure: false,
        auth: {
          user: "SheramiDev@outlook.com", // generated ethereal user
          pass: "qwerty123456789A?", // generated ethereal password
        },
      })
      const options = {
        from: "SheramiDev@outlook.com", // sender address
        to: newuser.email, // list of receivers
        subject: "Confirm E-mail", // Subject line

        html: `please press this to join our platform: <a href="${url}">${url}</a>`, // html body
      }

      await transporter.sendMail(options, (error, info) => {
        if (error) {
          console.log("there is  a problem " + error)
          return res
            .status(409)
            .json({ success: false, msg: "email not sent", data: error })
        }
        if (info) {
          console.log(info)

          const { _id, password, isAdmin, isConfirmed, ...others } =
            newuser._doc
          return res.status(201).json({
            success: true,
            msg: "registered successfully, please check your email to login",
            data: _id,
          })
        }
      }) */
    }
  } catch (e) {
    return res.status(500).json({ success: false, error: e })
  }
})

route.post("/login", async (req, res) => {
  const { email, password, userName } = req.body
  // console.log(email,password)
  try {
    // console.log(email, password, userName)
    let user
    email
      ? (user = await User.findOne({ email }))
      : (user = await User.findOne({ userName }))

    if (!user) {
      // console.log("pills")
      return res
        .status(400)
        .json({ success: false, msg: "Incorrect Credentials", data: null })
    }
    if (user.isConfirmed === false) {
      return res.status(409).json({
        success: false,
        msg: "please confirm your email by clicking the link provided in your email",
      })
    } else {
      const realpass = user.password

      const real = await validPassword(password, realpass)
      if (!real) {
        // console.log("be a dicl")
        return res
          .status(400)
          .json({ success: false, msg: "Incorrect Credentials", data: null })
      } else {
        const token = jwt.sign(
          { id: user._id, isAdmin: user.isAdmin },
          process.env.JWT_PASS
        )

        const { password, _id, ...others } = user._doc
        // console.log(user)

        return res.status(201).json({
          success: true,
          msg: "login success",
          data: { _id, token, a: user.isAdmin },
        })
      }
    }
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      success: false,
      error: e,
      msg: "we are having an issue with our servers we will get it back soon.",
    })
  }
})
route.get("/confirmation/:token", async (req, res) => {
  const token = req.params.token
  console.log(token)
  const user = await jwt.verify(token, process.env.JWT_CONFORMATION_PASS)
  console.log(user.id)
  try {
    const founduser = await User.findOneAndUpdate(
      { _id: user.id },
      { $set: { isConfirmed: true } },
      { new: true }
    )

    if (founduser) {
      console.log(founduser)
      const { password, isConfirmed, isAdmin, ...others } = founduser._doc

      //    http://localhost:5000/login
      // http://localhost:5000/authentication/sign-in
      res.status(301).redirect("https://niddf.com/")
    }
  } catch (e) {
    return res.status(500).json({ success: false, msg: "error on " + e })
  }
})

route.get("/recharge/:token", async (req, res) => {
  const token = req.params.token
  const password = req.body.password

  try {
    const decoded = await jwt.verify(token, process.env.JWT_PASS, {
      complete: true,
    })

    const id = decoded.payload.id
    console.log(decoded)
    // http://localhost:5000/forgot/${token}
    // https://leyuclothing.herokuapp.com/forgot/${token}
    res
      .status(301)
      .redirect(`https://www.niddf.com/authentication/change/${token}/${id}`)
  } catch (e) {
    console.log(e)
    return res
      .status(500)
      .json({ success: false, msg: "error on pur part. we are on it now" })
  }
})

route.post("/reset", async (req, res) => {
  console.log(req.body)
  const { email, userName } = req.body
  try {
    // const email = req.params.email

    let foundit
    email
      ? (foundit = await User.findOne({ email: email }))
      : (foundit = await User.findOne({ userName: userName }))

    if (foundit) {
      console.log(foundit)
      const tokenn = await jwt.sign({ id: foundit._id }, process.env.JWT_PASS, {
        expiresIn: "1d",
      })
      // const url = `http://localhost:5000/api/user/recharge/${emailtoken}`
      const url = `https://node.niddf.com/api/user/recharge/${tokenn}`
      let transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com",
        port: 587,
        secure: false,
        auth: {
          user: "SheramiDev@outlook.com", // generated ethereal user
          pass: "qwerty123456789A?", // generated ethereal password
        },
      })
      const options = {
        from: "SheramiDev@outlook.com", // sender address
        to: foundit.email, // list of receivers
        subject: "Request to change password", // Subject line

        html: `Please press this link to reset your password. Link expires after 24 hours: <a href="${url}">${url}</a>`, // html body
      }

      await transporter.sendMail(options, (error, info) => {
        if (error) {
          console.log("there is  a problem " + error)
          return res
            .status(409)
            .json({ success: false, msg: "email not sent", data: error })
        }
        if (info) {
          console.log(info)

          // const { password, isAdmin, isConfirmed, ...others } = newuser._doc
          return res
            .status(201)
            .json({ success: true, msg: "email sent successfully" })
        }
      })

      const token = req.params.token
    } else {
      return res.status(409).json({
        success: false,
        msg: "no user by that email/user name. please check agian",
      })
    }
  } catch (e) {
    console.log(e)
    console.log(e.responce.data)
    return res.status(500).json({
      success: false,
      msg: "error on our side, we are working on it.",
      error: e,
    })
  }
})

route.put("/update/:id", authTest, async (req, res) => {
  console.log(req.body.password)
  if (req.body.password) {
    req.body.password = await genert(req.body.password)
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    )
    if (updatedUser) {
      const { password, _id, ...others } = updatedUser._doc
      console.log(updatedUser._doc)
      return res
        .status(201)
        .json({ success: true, msg: "update complete", data: others })
    } else {
      return res
        .status(409)
        .json({ success: false, msg: "something went wrong." })
    }
  } catch (e) {
    return res.status(500).json({ success: false, msg: "error on " + e })
  }
})

route.delete("/delete/:id", authTest, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    return res.status(201).json({ succsess: true, msg: "delted successfully" })
  } catch (e) {
    return res.status(500).json({ success: false, msg: "error on " + e })
  }
})
route.get("/find", authTestAdmin, async (req, res) => {
  const query = req.query.new
  try {
    const user = query ? await User.find().limit(5) : await User.find()
    console.log(user)
    return res
      .status(201)
      .json({ succsess: true, msg: "loaded successfully", data: user })
  } catch (e) {
    return res.status(500).json({ success: false, msg: "error on " + e })
  }
})

route.get("/find/:id", authTest, async (req, res) => {
  console.log(req.params.id)
  try {
    // return res.json({user:req.user})
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(401).json({ success: false, msg: "no such user" })
    }
    const { password, ...others } = user._doc
    console.log("user fonid")
    if (user.userType.firm.isFirm) {
      const firm = await Firm.findById(user.userType.firm.firmId)
      if (!firm) {
        // console.log("firm not found")
        return res
          .status(401)
          .json({ success: false, msg: "couldn't locate firm" })
      }
      // console.log("firm foind")
      const data = { ...others, firm }
      // console.log(data)
      return res.status(201).json({
        succsess: true,
        msg: "request completed successfully",
        data: data,
      })
    } else if (user.userType.manufacturer.isManufacturer) {
      const manufacturer = await Manufacturer.findById(
        user.userType.manufacturer.manufacturerId
      )
      if (!manufacturer) {
        // console.log("manu not found")
        return res
          .status(401)
          .json({ success: false, msg: "couldn't locate manufacturer data" })
      }
      const data = { ...others, manufacturer }
      // console.log(data)
      return res.status(201).json({
        succsess: true,
        msg: "request completed successfully",
        data: data,
      })
    } else if (user.userType.professional.isProfessional) {
      const professional = await Professional.findById(
        user.userType.professional.professionalId
      )
      if (!professional) {
        // console.log("professional not fonid")
        return res
          .status(401)
          .json({ success: false, msg: "couldn't locate professional data" })
      }
      const data = { ...others, professional }
      // console.log(data)
      return res.status(201).json({
        succsess: true,
        msg: "request completed successfully",
        data: data,
      })
    }
  } catch (e) {
    return res.status(500).json({ success: false, msg: e })
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

route.post("/createpassword", async (req, res) => {
  const password = await genert(req.body.password)
  console.log(password)
})
module.exports = route
