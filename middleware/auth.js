const jwt = require("jsonwebtoken")
const User = require("../model/users")
const auth =async (req,resp,next)=>{

    const token = req.cookies.jwt
    
   
    try {
        
         const data = await jwt.verify(token,process.env.SKEY)
         if(data)
         {
            const userdata = await User.findOne({_id:data._id})

            const tdata =  userdata.Tokens.find(ele=>{
                return ele.token === token
            })

           
           
            if(tdata!=undefined)
            {
                req.user = userdata
                req.token = token
                next()
            }
            else{
                resp.render("login",{msg:"Please login first"})
            }
           
         }
         else
         {
           resp.render("login",{msg:"Please login first"})
         }
    } catch (error) {
        resp.render("login",{msg:"Please login first"})
    }


}

module.exports=auth