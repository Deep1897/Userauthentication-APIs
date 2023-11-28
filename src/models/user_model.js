const express=require("express");
const mongoose=require("mongoose");

const schemadata= new mongoose.Schema({

    username:{
        type:String,
        required:[true,"please add the username"],

    },
  
    email:{
         type:String,
         required:[true, "please enter you email"],
         unique:[true, "email address already taken"],
    },
    password:{
        type:String,
        required:[true,"please add the password"],

    }
    

},{
    timestamps:true,

})


const Models=new mongoose.model("JWT-Data",schemadata);
module.exports=Models;