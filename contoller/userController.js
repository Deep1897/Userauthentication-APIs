const express = require('express');
const jwt=require("jsonwebtoken");
require("dotenv").config();
const ejs=require("ejs");
const model=require("../src/models/user_model.js")
const app = express();
const bcrypt=require("bcrypt");
const transporter=require("../CONFIG/emailConfig.js")
const nodemailer=require("nodemailer");
const path=require("path");
const generateOtp= require("./otpGenerator.js")

console.log("ejs: ",ejs);
template_path=path.join(__dirname,"../template/")
console.log("template_path: ",template_path);


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.set("views",template_path);

// hbs.registerPartials(template_path);




const registerUsers= async (req,res)=>{

    
    try {

        const {username,email,password} =req.body;
        


        if(!username || !email || !password){
            console.log(username,email,password);
         
            res.status(400).send({message:"all fieilds are mendatory"});
            
        }
        else{
            const useravailable= await model.findOne({email});
            if(useravailable){
                res.status(400).json({message:"user already registerd"});
            }else{
               //hashpassword
               console.log(username,password,email);
               const hashPassword=await bcrypt.hash(password,10);
               console.log("hashpassword : ",hashPassword);
               const user= await model.create({
                username,
                email,
                password: hashPassword
               });

               console.log(`user created ${user}`);
               if(user){
                res.status(201).json({_id:user.id,email:user.email})
               }else{
                res.status(400).json({message:"danger error"})
               }

               res.json({message:"register the user"})
            }
        }
    
        res.json({message: "hi i am register"})
    } catch (error) {
        console.log(error);
    }
  
};


const loginUser = async (req,res,next) => {

    try {
        const {email,password}= req.body;
      if(!email || !password){
        res.status(400).json({message:"All fielsd are manatory"});

      }else{
        const user = await model.findOne({email});
        // mcompare password with original password

        if(user && (await bcrypt.compare(password,user.password))){
              
            const accessToken = jwt.sign({
                user:{
                    username: user.username,
                    email: user.email,
                    id: user.id
                },
            },
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn:"60m"}

            
            );
         
            res.status(200).json({accessToken})
        }else{
            res.status(401).json({message:"email and password are not valid"})
        }

      }

    } catch (error) {
        res.status(400).json({message:"password is incorrect"})
    }



};


const currentUser = async (req,res)=>{

    res.json(req.user);
}

const changePassword=async(req,res) =>{

    const {password,cpassword}=req.body;

    console.log(password,cpassword);
   
      
      if(password!=cpassword){
        res.status(400).json({message:"password is not match"})
      }else{
        const newhashPassword=await bcrypt.hash(password,10);   
           console.log(req.user);
        console.log("userid: ",req.user.id);

        try {
            // const myHeaders = new Headers();
            const changeinfo=await model.findByIdAndUpdate(req.user.id,{$set:{password:newhashPassword}});
            console.log("changeinfo : ",changeinfo);
            // res.setHeader("deep","password changed")
            // res.status(200).json({message:"password change successfully"})
            // myHeaders.set("Content-Type", "password changed");
            res.status(200).send("password changed succesfully")
            
        } catch (error) {
           res.status(400).json({message:"user not define"})
        }

         
        //    res.status(200).json({message:"user is exist in the data but some error ocured"})
      }



    res.json({message:"this is change password page"})
}

const DeleteAccount=async(req,res) =>{

    const {email,password}=req.body;

    console.log(email,password);
    req.user;
    await model.deleteOne({email})
      

    res.status(200).json({message:"Deleted succesfully"})
}



const loggedUser= async (req,res)=>{

    res.send(req.user)

}


const sendPasswordResetmail= async(req,res)=>{

    const {email}=req.body;
    if(email){
        const user= await model.findOne({email})
        if(user){
            console.log(user);
            const secret=user._id+process.env.ACCESS_TOKEN_SECRET;
            console.log("secret key fetching",secret);
            const token=jwt.sign({userId:user._id},secret,{expiresIn:"60m"});
             console.log("deep            ",secret,token);
            const link=`http://127.0.0.1:3000/api/user/rest/${user._id}/${token}`;

            // /api/user/rest/:id/:token
            console.log(link);

            // code for sent email
//-----------------------------------------------------------------------------------------------------

            let infomail=await transporter.sendMail({
                from:process.env.EMAIL_FROM,
                to:user.email,
                subject:"password reset link",
                html:`<a href=${link}>click here </a> to reset your password`
            })
// -----------------------------------------------------------------------------------------------------------------------
           

            res.send({"status":"success","message":"email sent please chek your email"})

          
        }
        else{
            res.send("email does not exist")
        }

    }
    else{
        res.send("email is required");
    }




}


//---------------------------------------------------send otp on mail------------------------------------------

const sendOtpMail= async(req,res)=>{

    const {email}=req.body;
    if(email){
        const user= await model.findOne({email})
        if(user){
            console.log(user);
            const otp=generateOtp();
            const secret=user._id+process.env.ACCESS_TOKEN_SECRET+otp;
            console.log("secret key fetching",secret);
            const token=jwt.sign({userId:user._id},secret,{expiresIn:"60m"});
             console.log("deep            ",secret,token);
            const link=`http://127.0.0.1:3000/api/user/rest/${user._id}/${token}`;

            // /api/user/rest/:id/:token
            console.log(link);

            // code for sent email

            
//-----------------------------------------------------------------------------------------------------

            let infomail=await transporter.sendMail({
                from:process.env.EMAIL_FROM,
                to:user.email,
                subject:"password reset otp",
                text:`Your otp is : ${otp} to reset your password`
            })
// -----------------------------------------------------------------------------------------------------------------------
           

            res.send({"status":"success","message":"email sent please chek your email"})

          
        }
        else{
            res.send("email does not exist")
        }

    }
    else{
        res.send("email is required");
    }




}


const userpasswordResetOtp= async(req,res)=>{

    const {password,cpassword,otp}=req.body;
    console.log("otp: ",otp);
    const {id,token}=req.params;
    console.log("vdnjvininisvni:            ",id,token);
    const user =await model.findById(id);
    console.log(user);
    const new_secret=user._id+process.env.ACCESS_TOKEN_SECRET+otp;
    console.log(new_secret);

    try {
        
          
        if(password && cpassword && otp){

            console.log(token,new_secret);

            try {
                const verified= jwt.verify(token,new_secret);
                if(verified){
                    console.log("verified");
    
                if(password !=cpassword){
                    res.status(400).josn({message:"does not match password"})
                }else{
                    const newhashPassword=await bcrypt.hash(password,10);  
                    const changeinfo=await model.findByIdAndUpdate(user._id,{$set:{password:newhashPassword}});
                    console.log("infochane:   ",changeinfo);
                    console.log("userid",user._id);
    
                    res.status(200).json({message:"password change successfully"})
    
                }
    
                }else{
                    res.status(400).josn({message:"all fields are mandatory"})
                }
            } catch (error) {
                res.status(400).send({message:"otp is not matched"})
            }
            
            
            
              
        }else{
            res.status(400).send({message:"all fields are mandatory"})
        }
        



    } catch (error) {
        console.log(error);
    }


   

}


const userpasswordReset= async(req,res)=>{

    const {password,cpassword}=req.body;
    const {id,token}=req.params;
    console.log("vdnjvininisvni:            ",id,token);
    const user =await model.findById(id);
    console.log(user);
    const new_secret=user._id+process.env.ACCESS_TOKEN_SECRET;
    console.log(new_secret);

    try {
        console.log(token,new_secret);
        jwt.verify(token,new_secret);
        console.log("verified");
          
        if(password && cpassword){

            if(password !=cpassword){
                res.status(400).josn({message:"does not match password"})
            }else{
                const newhashPassword=await bcrypt.hash(password,10);  
                const changeinfo=await model.findByIdAndUpdate(user._id,{$set:{password:newhashPassword}});
                console.log("infochane:   ",changeinfo);
                console.log("userid",user._id);

                res.status(200).json({message:"password change successfully"})

            }
              
        }else{
            res.status(400).josn({message:"all fields are mandatory"})
        }
        



    } catch (error) {
        console.log(error);
    }


   

}

// const homePage= (req,res)=>{

//     res.render("index");
// }

module.exports={registerUsers,loginUser,currentUser,changePassword,loggedUser,DeleteAccount,sendPasswordResetmail,userpasswordReset,sendOtpMail,userpasswordResetOtp};