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
          .find({ "userType.firm.isFirm": true })
          .limit(limit)
          .skip(startIndex)
          .exec()
      } else {
        result.result = await model.find().limit(limit).skip(startIndex).exec()
      }

      res.paginatedResults = result
      next()
    } catch (e) {
      res.status(501).json({
        msg: "something went wrong trying to paginate the db. Figuring it out",
        success: false,
      })
    }
  }
}
module.exports = { pagination }
