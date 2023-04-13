const pagination = (model, firm) => {
  return async (req, res, next) => {
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)

    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const result = {}
    const modelLength = await model.countDocuments().exec()
    // console.log(modelLength)
    if (endIndex < modelLength) {
      result.next = {
        page: page + 1,
        limit: limit,
      }
    }

    if (startIndex > 0) {
      result.previous = {
        page: page - 1,
        limit: limit,
      }
    }
    try {
      if (firm === "firm") {
        result.result = await model
          .aggregate([
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
                profilepic: 1,
                lastName: 1,
                userName: 1,
                firmData: { _id: 1, catagory: 1 },
              },
            },
          ])
          .skip(startIndex)
          .limit(limit)
          .exec()
      } else if (firm === "professional") {
        result.result = await model
          .aggregate([
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
                profilepic: 1,
                lastName: 1,
                userName: 1,
                professionalData: { _id: 1, catagory: 1 },
              },
            },
          ])
          .skip(startIndex)
          .limit(limit)
          .exec()
      } else if (firm === "manufacturer") {
        result.result = await model
          // .find({ "userType.manufacturer.isManufacturer": true })
          .aggregate([
            { $match: { "userType.manufacturer.isManufacturer": true } },
            {
              $lookup: {
                from: "manufacturers",
                localField: "userType.manufacturer.manufacturerId",
                foreignField: "_id",
                as: "manufacturerData",
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                profilepic: 1,
                lastName: 1,
                userName: 1,
                manufacturerData: { _id: 1, catagory: 1 },
              },
            },
          ])
          .skip(startIndex)
          .limit(limit)
          .exec()
      } else {
        result.result = await model
          .find()
          .limit(limit)
          .skip(startIndex)
          .sort({ $natural: -1 })
          .exec()
      }

      res.paginatedResults = result
      next()
    } catch (e) {
      res.status(501).json({
        msg: "something went wrong trying to paginate the db. Trying to Figuring it out",
        success: false,
      })
    }
  }
}
module.exports = { pagination }
