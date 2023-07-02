import express from "express";
import mongoose from "mongoose";
import path from "path";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

const app = express();


mongoose.connect("mongodb://127.0.0.1:27017",{
    dbName:"user"
}).then(()=>{console.log("db connected")}).catch(e=>console.log(e));

const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String
})

const User = mongoose.model("User",userSchema);

app.set("view engine","ejs");
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(path.resolve(),"/public")));
//jab bhi data base mein kam karoge tab async await ka yaad rakhana
const isAuthenticated = async (req,res,next) =>{
    const { token } = req.cookies ;
    if(token){
        const decoded = jwt.verify(token,"asdfsagasfsadf");
        //  console.log(decoded); 
        req.user = await User.findById(decoded._id);
       next();
    }else{
       res.render('login');
    }
}

app.get('/',isAuthenticated,(req,res)=>{
    // jahan jahan isAuthenticated use hoga hamlog req.user ka use kar sakte haui , a
    // aur baki jinme mein ham woh middle ware use nhi karenge usme req.user undefined hoga , kyunki ehle se uski koi value nhi hai woh undefined 
    // console.log(req.user);
    res.render('logout',{name:req.user.name});
})

// app.get("/",(req,res)=>{
//     // console.log(req.cookies);

//     const { token } = req.cookies;
//     console.log(token);
//     if(token){
//         res.render('logout');
//     }
//     else{
//         res.render('login');
//     }
    
// })

app.get("/register",(req,res)=>{
    res.render("register");
})

app.post("/login",async (req,res)=>{
    //console.log(req.body);

    const {name,email,password} = req.body;
   // ._id ko cookie mein store karenge
    let user = await User.findOne({email});
    if(!user){
      return  res.redirect("/register");
    }
    user =  await User.create({name,email});
   //directly aise user._id ko publicly dal nhi sakte , yani visibke nhi kara sakte 
   //uski wajah se ham json web token use karte hai 
    const token = jwt.sign({_id:user._id},"asdfsagasfsadf"); 
    // console.log(token);    
   
  // user id ko cookie mein directly ni dal sakte kyunki woh publicly available hoga
    res.cookie("token",token,{
        httpOnly:true,
        expires: new Date(Date.now()+60*1000)
    });
    res.redirect("/");
})

app.get("/logout",(req,res)=>{
   
    res.cookie("token",null,{
      httpOnly:true,
      expires:new Date(Date.now()),  
    })
    res.redirect('/');
})

app.listen("5000",()=>{
    console.log('server is working');
})