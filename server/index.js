const express =require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app=express();
require("dotenv").config();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("db connection working");
    })
    .catch((err) => {
        console.error("db connection error:", err);
    });


const server =app.listen(process.env.PORT,()=>{
    console.log(`server started on port ${process.env.PORT}`);
})