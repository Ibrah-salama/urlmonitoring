const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')

const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const userRouter = require('./routes/userRoutes')
const checkRoute = require('./routes/checkRoutes')
const reportRoute = require('./routes/reportRoutes')
const app = express()
app.use(cors())
const limiter = rateLimit({
    max:100,
    windowMs: 60*60*1000,
    message : 'Too many requests from this ip, Please try again in an hour.'
})
 
app.use('/api',limiter)
app.use(express.json({limit:'10kb'}))
app.use(express.urlencoded({extended:true, limit:'10kb'}))
app.use(mongoSanitize())
app.use(xss())

app.use('/api/users',userRouter);
app.use('/api/checks',checkRoute)
app.use('/api/reports',reportRoute)

app.all('*',(req,res,next)=>{
    // res.status(404).json({
    //     status:"fail",
    //     message:`Can't find ${req.originalUrl} on this server`
    // })
    // const err = new Error(`Can't find ${req.originalUrl} on this server`)
    // err.statusCode = 404
    // err.status = 'fail'
    // next(err)
    // next(new AppError(`Can't find ${req.originalUrl} on this server`,404))
})


module.exports = app 