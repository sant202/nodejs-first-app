
import express  from "express";
import path from 'path';
import mongoose, { Schema } from "mongoose";
import cookieParser from "cookie-parser";
import  Jwt  from "jsonwebtoken";
import bcrypt, { hash } from 'bcrypt';



mongoose.connect("mongodb://localhost:27017" ,{
    dbname:"Userdetails"
}).then(()=>console.log("db connected")).catch((e)=>console.log(e));


const usersSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
})
      
const User = mongoose.model("Users",usersSchema);


const app = express();
// using middlewares


app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

// /setting up view engine

app.set("view engine", "ejs");

// get, post and listen server

const isauthenticate = async(req,resp,next) =>{
    const {token} =  req.cookies

    if(token){
     
        const data = Jwt.verify(token, "ajshfgajhfvkj")
         req.user = await User.findById(data._id);

        next();
    }
    else{
      resp.redirect("/login")
    }
}

app.get("/",isauthenticate,(req,resp)=>{
    resp.render("logout", {name : req.user.name})
})

app.get("/register",(req,resp)=>{
    resp.render("register")
})
app.get("/login",(req,resp)=>{
    resp.render("login");
})

app.post("/login",async(req,resp)=>{
      
    const {email,password} = req.body;
     const user = await User.findOne({email});

     if(!user) return resp.redirect("/register");

     const isMatch = await bcrypt.compare(password,user.password);

     if(!isMatch){
        return resp.render("login", {email,message : "Incorrect Password"});
     }

     const token = Jwt.sign({_id:user._id}, "ajshfgajhfvkj");

     resp.cookie("token", token,{
         httpOnly:true, expires: new Date(Date.now()+120*1000)
     });
     resp.redirect("/");
})

app.post("/register",async(req,resp)=>{
    
    const {name,email,password} = req.body;

    const  u = await  User.findOne({email});
     if(u){
       return  resp.redirect("/login")
     }
    
     const hashedpassword = await bcrypt.hash(password, 10)

    const user = await User.create({
        name,
        email,
        password: hashedpassword,
    })

      const token = Jwt.sign({_id:user._id}, "ajshfgajhfvkj");

    resp.cookie("token", token,{
        httpOnly:true, expires: new Date(Date.now()+120*1000)
    });
    resp.redirect("/");
})
app.get("/logout",(req,resp)=>{
    resp.cookie("token",null,{
        httpOnly:true, expires: new Date(Date.now())
    });
    resp.redirect("/");
})




app.listen(5000,()=>{
    console.log("server work")
})