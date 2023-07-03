const express = require("express")
const app = express()
const mongoose = require("mongoose")
require("dotenv").config()
const PORT = process.env.PORT
const path = require("path")
const hbs = require("hbs")
const bodyParser = require("body-parser")
const DBURL = process.env.DBURL
const cookieparser = require("cookie-parser")

mongoose.connect(DBURL).then(()=>{
    console.log("DB connected");
})

app.use(bodyParser())
app.use(cookieparser())
const viewPath = path.join(__dirname,"../templates/views")
const partialPAth = path.join(__dirname,"../templates/partials")
const publicPath = path.join(__dirname,"../public")

app.set("view engine","hbs")
app.set("views",viewPath)
hbs.registerPartials(partialPAth)
app.use(express.static(publicPath))


app.use("/",require("../router/userrouter"))

app.listen(PORT,()=>{
    console.log("Servewr running on port : "+PORT);
})

