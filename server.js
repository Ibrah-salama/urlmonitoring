const express = require('express');
const mongoose = require('mongoose');
const dotEnv = require('dotenv')
const app = require('./app')

dotEnv.config({path:'./config.env'})


const DB = process.env.DATABASE; 

mongoose.connect(DB,{
    useNewUrlParser:true,
    useUnifiedTopology: true
}).then(con =>{
    console.log('Connected successfully with atlas!');    
})

const port = process.env.PORT || 3000;

const server = app.listen(port , err=>{ 
    if(err) return console.log(err.message);
    console.log(`Server connected on port ${port}`);
})

