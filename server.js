const express = require('express')
require('dotenv').config()
const app= express()
const PORT = process.env.PORT
const mongoconnection = require('./connection')


const userRoute = require('./routes/userRoutes')
const candidateRoute = require('./routes/candidateRoutes')

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/user',userRoute)
app.use('/candidate',candidateRoute)






app.listen(PORT,()=>console.log("SERVER STARTED"))