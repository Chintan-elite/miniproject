const router = require("express").Router()
const User = require("../model/users")
const bcrypt = require("bcryptjs")
const multer = require("multer")
const auth = require("../middleware/auth")
const fs = require("fs")
const path = require("path")
const { log } = require("console")
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now()+".jpeg")
  }
});
var upload = multer({storage: storage});






router.get("/",(req,resp)=>{
    resp.render("index")
})

router.get("/login",(req,resp)=>{
  resp.render("login")
})

router.post("/do_register",upload.single("img"),async(req,resp)=>{

      const id = req.body.id;

      try {

        if(id=="")
        {
          const user = new User({name : req.body.name, email:req.body.email,pass :req.body.pass,img:req.file.filename})
        
          await user.save()
          resp.render("index",{msg : "registration successfully done !!!"})
        }
        else{

          const olddata =  await User.findByIdAndUpdate(id,{name : req.body.name, email:req.body.email,pass :req.body.pass,img:req.file.filename})
          const filepath = path.join(__dirname,"../public/img/"+olddata.img);
          
          await fs.unlinkSync(filepath)
          resp.redirect("home")


        }
       
        
      } catch (error) {
        console.log(error);
      }

})


router.post("/do_login",async(req,resp)=>{

  try {

        const data = await User.findOne({email:req.body.email})

       if(data.Tokens.length>=2)
       {
          resp.render("login",{msg:"Max login limit reached!!!"})
       }
       else
       {

        const isValid = await bcrypt.compare(req.body.pass,data.pass)

        if(isValid)
        {

           const token =  await data.generateToken()
           resp.cookie("jwt",token)
            resp.redirect("home")
        }
        else{
          resp.render("login",{msg:"Invalid credentials"})
        }
      }
    
  } catch (error) {
    resp.render("login",{msg:"Invalid credentials"})
  }
})

router.get("/home",auth,async(req,resp)=>{
  try {
    
       const userdata = req.user
        const data = await User.find();
        resp.render("home",{userdata:data,cuser:userdata})


  } catch (error) {
    console.log(error);
  }
})

router.get("/logout",auth,async(req,resp)=>{


    try {
      
      const user = req.user
      const token = req.token

      user.Tokens =  user.Tokens.filter(ele=>{
        ele.token !=token
      })


      await user.save()


      resp.clearCookie("jwt")
      resp.render("login")


    } catch (error) {
      
    }
      
})

router.get("/logoutall",auth,async(req,resp)=>{


  try {
    
    const user = req.user
    const token = req.token

    user.Tokens = [];
    await user.save()


    resp.clearCookie("jwt")
    resp.render("login")


  } catch (error) {
    
  }
    
})


router.get("/do_delete",auth,async(req,resp)=>{
  try {
    const id = req.query.did
    const data =  await User.findByIdAndDelete(id);
    const filepath = path.join(__dirname,"../public/img/"+data.img);
    await fs.unlinkSync(filepath)
   
    resp.redirect("home")

  } catch (error) {
    console.log(error);
  }
})

router.get("/do_edit",auth,async(req,resp)=>{
  try {
    const id = req.query.eid
    const udata = await User.findOne({_id:id})
   
    
    resp.render("index",{udata:udata})

  } catch (error) {
    console.log(error);
  }
})

module.exports=router