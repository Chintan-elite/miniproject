const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const userSchema = new mongoose.Schema({
    name : {
        type : String
    },
    email :{
        type : String
    },
    pass : {
        type : String
    },
    img : {
        type : String
    },
    Tokens : [{
        token :{
            type : String
        }
    }]

})

userSchema.pre("save",async function(){
    try {
        
        if(this.isModified("pass")){
            this.pass = await bcrypt.hash(this.pass,10)
        }

    } catch (error) {
        
    }
})


userSchema.methods.generateToken = async function(){

    try {
        const token = await jwt.sign({_id:this._id},process.env.SKEY)
        this.Tokens=  await this.Tokens.concat({token:token})
        await this.save()
        return token
    } catch (error) {
        console.log(error);
    }

}




module.exports=new mongoose.model("User",userSchema)