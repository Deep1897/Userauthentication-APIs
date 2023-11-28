const express = require('express');
const app = express();
const router = require("../routes/router.js");
require('../src/db/conn.js');
const port=process.env.PORT || 3001

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static('Public'));
app.use("/", router);



app.listen(port,()=>{
    console.log("running at port "+port);
})