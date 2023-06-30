import express from "express";
import mongoose from "mongoose";
import path from "path";
import cookieParser from "cookie-parser";

const app = express();

// mongoose.connect("")
app.set("view engine","ejs");
app.use(cookieParser());
app.use(express.static(path.join(path.resolve(),"/public")))

app.get("/",(req,res)=>{
    // console.log(req.cookies);

    const { token } = req.cookies;
    console.log(token);
    if(token){
        res.render('logout');
    }
    else{
        res.render('login');
    }
    
})

app.post("/login",(req,res)=>{
    res.cookie("token","iamin",{
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