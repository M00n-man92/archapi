const jwt = require("jsonwebtoken")
const verify = async (req, res, next) => {
  console.log("here")
  const authheader = req.header("token")
  //   console.log("this is be the " + authheader)
  if (authheader) {
    const token = authheader.split(" ")[1]
    console.log(token)
    jwt.verify(token, process.env.JWT_PASS, (err, user) => {
      if (err) {
        return res.status(402).json({
          success: false,
          msg: "having issues with your login credentials. please login again",
        })
      }
      req.user = user
      console.log(req.user)
      next()
    })
    /*  const isright= jwt.verify(token,process.env.JWT_PASS)
         console.log(isright) */
  } else {
    return res
      .status(401)
      .json({ success: false, msg: "in the words of jid something aint right" })
  }
}
const authTest = (req, res, next) => {
  console.log("suth test here")
  verify(req, res, () => {
    // console.log("this is the param"+req.params.id)
    // console.log()
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next()
    } else {
      return res.status(401).json({ success: false, msg: "notalloed" })
    }
  })
}
const authTestAdmin = (req, res, next) => {
  verify(req, res, () => {
    if (req.user.isAdmin) {
      next()
    } else {
      return res.status(401).json({ success: false, msg: "error" })
    }
  })
}
module.exports = { verify, authTest, authTestAdmin }
