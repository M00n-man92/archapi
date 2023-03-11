const crypto=require('bcrypt')
const genpassword= async (password) => {
    const salted = await crypto.genSalt(10)
    const genpassword =  await crypto.hash(password, salted)
    console.log(genpassword);
    return genpassword
    
}
 const validPassword=(password,userPassword)=>{
    const genpassword = crypto.compare(password, userPassword)

    return genpassword
}
module.exports.genpassword=genpassword
module.exports.validPassword=validPassword