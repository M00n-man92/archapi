const mongoose=require('mongoose')
const dotenv=require('dotenv')
dotenv.config();
// console.log(process.env.MONGO_PASS)
const Db=process.env.MONGO_URL.replace('<password>',process.env.MONGO_PASS)
const connection=mongoose.connect(Db,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{console.log('connected')}).catch(e=>{console.log('an error'+e)})
//"mongodb://localhost:27017/blog"
exports.modules=connection