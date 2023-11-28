const mongoose=require("mongoose");
const express=require("express");


mongoose.connect("mongodb://localhost:27017/JWT_Users",{useNewUrlParser: true, 
useUnifiedTopology: true}).then(()=>{

    console.log("connection successfull");
}).catch((e)=>{
    console.log(e);
})