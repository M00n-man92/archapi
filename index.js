require("./mongoose")
const express = require("express")
const mongoose = require("./mongoose")
const app = express()
const path = require("path")
const dotenv = require("dotenv")
// const io=require("socket.io")()
const cors = require("cors")

dotenv.config()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const user = require("./routes/user")
const firm = require("./routes/firm")
const project = require("./routes/project")
const blog = require("./routes/blog")
// const producs=require('./routes/product')
// const cart=require('./routes/cart')
// const order=require('./routes/order')
// const cors = require('cors')

app.use(
  cors({
    credentials: true,
    origin: true,
  })
)

app.get("/api/test", () => {
  console.log("this works")
})
app.use("/api/user", user)
app.use("/api/firm", firm)
app.use("/api/project", project)
app.use("/api/blog", blog)
// app.use("/api/product",producs)
// app.use("/api/cart",cart)
// app.use("/api/order",order)
// console.log(__dirname)
// app.use(express.static(path.join(__dirname, "/ecoclient/build")));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '/ecoclient/build', 'index.html'));
// });

app.listen(process.env.PORT, () => {
  console.log("port is running at " + process.env.PORT)
})
