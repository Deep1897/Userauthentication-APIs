const express = require('express');
const router = express.Router();
const app=express();
const ejs=require("ejs");
const {registerUsers,loginUser,currentUser,changePassword,loggedUser,DeleteAccount,sendPasswordResetmail,userpasswordReset,sendOtpMail,userpasswordResetOtp} =require("../contoller/userController.js")
const validateToken=require("../middleware/validateTokenHandler.js")
const path=require("path");



// template_path=path.join(__dirname,"../template/views/")
// console.log("template_path: ",template_path);
// app.use(express.static("public"));
// app.set("view engine","ejs");
// app.set("views",template_path);

// // hbs.registerPartials(template_path);

// router.get("/",homePage);
//---------------------------------------------------------------------------------------------------------------------------
router.route("/register").post(registerUsers)
router.route("/login").post(loginUser)
// router.route("/current").get(validateToken,loginUser)
router.get("/current",validateToken,currentUser)
router.post("/change_password",validateToken,changePassword);

router.get("/logged_user",validateToken,loggedUser );

router.get("/delete_account",validateToken,DeleteAccount );

router.get("/sendmail",validateToken,sendPasswordResetmail);

router.post("/reset-password/:id/:token",validateToken,userpasswordReset);

router.get("/sendOtp",validateToken,sendOtpMail)
router.post("/reset-password-otp/:id/:token",validateToken,userpasswordResetOtp)


module.exports = router;