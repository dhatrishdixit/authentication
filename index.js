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
    email:String
})

const User = mongoose.model("User",userSchema);

app.set("view engine","ejs");
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(path.resolve(),"/public")));

const isAuthenticated = (req,res,next) =>{
    const { token } = req.cookies ;
    if(token){
       next();
    }else{
       res.render('login');
    }
}

app.get('/',isAuthenticated,(req,res)=>{
    res.render('logout');
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

app.post("/login",async (req,res)=>{
    //console.log(req.body);

    const {name,email} = req.body;
   // ._id ko cookie mein store karenge

   const user =  await User.create({name,email});
   //directly aise user._id ko publicly dal nhi sakte , yani visibke nhi kara sakte 
   //uski wajah se ham json web token use karte hai 
    res.cookie("token",user._id,{
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