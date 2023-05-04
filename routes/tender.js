const app = require("express")
const route = app.Router()
const Tender = require("../model/tenderModel")
const Firm = require("../model/firmModel")
const Manucaturer = require("../model/manufacturerModel")
const Professional = require("../model/professionalModel")
const User = require("../model/userModel")
const { pagination } = require("./pagination")
const { authTestAdmin } = require("./verifyToken")

route.get("/tender/find", pagination(Tender), (req, res) => {
  const query = req.query.new
  try {
    // const usertype = User.userType.firm.isFirm
    console.log(res.paginatedResults)
    return res.status(201).json({
      succsess: true,
      msg: "loaded successfully",
      data: res.paginatedResults,
    })
  } catch (e) {
    return res.status(500).json({ success: false, msg: "error on " + e })
  }
})

// find singel product using req.params.id
route.get("/find/:id", async (req, res) => {
  try {
    const average = await Tender.findById({ _id: req.params.id })
    if (!average) {
      return res
        .status(401)
        .json({ success: false, msg: "no such tender found" })
    }

    return res.status(201).json({
      succsess: true,
      msg: "request completed successfully",
      data: average,
    })
  } catch (e) {
    return res.status(500).json({ success: false, msg: e })
  }
})

route.get("/findusertender/:id", async (req, res) => {
  try {
    // const tender = await tender.find({ "userInfo.userId": req.params.id })
    console.log(req.params.id)
    const tender = await Tender.find({ "userInfo.userId": req.params.id })

    if (!tender) {
      return res.status(401).json({ success: false, msg: "no such tender" })
    }
    // const [{ title, discription, image }] = tender
    return res.status(201).json({
      succsess: true,
      msg: "request completed successfully",
      data: tender,
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ success: false, msg: "error on " + e })
  }
})

route.post("/newtender/:id", authTestAdmin, async (req, res) => {
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

        const tender = await new Tender(obj)

        const newTender = await tender.save()
        newTender &&
          (await Firm.findOneAndUpdate(
            { _id: firmId },
            {
              $push: {
                tenders: {
                  tenderId: newTender._id,
                },
              },
            },
            { new: true }
          ))

        return res.status(201).json({
          success: true,
          msg: "created successfully",
          data: newTender,
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

        const tender = await new Tender(obj)
        const newTender = await tender.save()
        newTender &&
          (await Professional.findOneAndUpdate(
            { _id: professionalId },
            {
              $push: {
                tenders: {
                  tenderId: newTender._id,
                },
              },
            },
            { new: true }
          ))

        return res.status(201).json({
          success: true,
          msg: "created successfully",
          data: newTender,
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

        const tender = await new Tender(obj)
        const newTender = await tender.save()
        newTender &&
          (await Manufacturer.findOneAndUpdate(
            { _id: manufacturerId },
            {
              $push: {
                tenders: {
                  tenderId: newTender._id,
                },
              },
            },
            { new: true }
          ))
        return res.status(201).json({
          success: true,
          msg: "created successfully",
          data: newTender,
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
route.put("/update/:id/:tenderId", authTestAdmin, async (req, res) => {
  // console.log(req.params.id)

  try {
    const updatedTender = await Tender.findOneAndUpdate(
      { _id: req.params.tenderId, "userInfo.userId": req.params.id },
      {
        $set: req.body,
      },
      { new: true }
    )

    if (!updatedTender) {
      return res.status(409).json({
        success: false,
        msg: "couldn't find the tender",
      })
    }
    return res.status(201).json({
      success: true,
      msg: "product updated",
      data: updatedTender,
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

// delete
route.delete("/delete/:id/:tenderId", authTestAdmin, async (req, res) => {
  try {
    const tender = await Tender.findOne({ _id: req.params.tenderId })
    // console.log(tender)
    if (tender) {
      const { userInfo } = tender
      if (userInfo.firm[0]) {
        const firm = await Firm.findOneAndUpdate(
          { _id: userInfo.firm[0].firmId },
          {
            $pull: { tenders: { tenderId: req.params.tenderId } },
          },
          { new: true }
        )
        console.log(firm)
        await tender.deleteOne({ _id: req.params.tenderId })

        return res.status(201).json({
          succsess: true,
          msg: "delted successfully",
          data: { firm, tender },
        })
      } else if (userInfo.professional[0]) {
        const professional = await Professional.findOneAndUpdate(
          { _id: userInfo.professional[0].professionalId },
          {
            $pull: { tenders: { tenderId: req.params.tenderId } },
          },
          { new: true }
        )
        await tender.deleteOne({ _id: req.params.tenderId })
        // const deletedtender = await tender.findOneAndDelete({ _id: req.params.tenderId })
        return res.status(201).json({
          succsess: true,
          msg: "delted successfully",
          data: { professional, tender },
        })
      } else if (userInfo.manufacturer[0]) {
        const manufacturer = await Manufacturer.findOneAndUpdate(
          { _id: userInfo.manufacturer[0].manufacturerId },
          {
            $pull: { tenders: { tenderId: req.params.tenderId } },
          },
          { new: true }
        )
        await tender.deleteOne({ _id: req.params.tenderId })
        return res.status(201).json({
          succsess: true,
          msg: "delted successfully",
          data: { manufacturer, tender },
        })
      } else {
        console.log(
          "something is wrong since it couldn't find the user which created it"
        )
        return res.status(409).json({
          succsess: false,
          msg: "user cannot delete the tender",
        })
      }
    }

    return res
      .status(501)
      .json({ succsess: false, msg: "could't find the tender" })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ success: false, msg: "error on " + e })
  }
})

module.exports = route
