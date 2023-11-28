const asynHandler= require("express-async-handler");
const jwt=require("jsonwebtoken");


const validateToken=asynHandler(async(req,res,next)=>{
  
    let token;
    // let authHeader = req.headers[Authorization] || req.header.authorization
    // let authHeader = req.headers[Authorization] || req.header.authorization

    token= req.headers && req.headers["authorization"].split(' ')[1]
   

    //  console.log("authHeader : ",authHeader);
    if(token) {
      
        // token=authHeader.split(" ")[1];
        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
            if(err){
                res.status(401).json({message:"user is not autherised"});
                console.log(err);
            }else{
                // console.log(decoded);
                req.user=decoded.user;
                // res.status(200).json({message:decoded});
                next();
                
            }
        });

       
    }
    else{
        res.status(400).json({message:"authorization is not valid"})
    }
})

module.exports=validateToken;