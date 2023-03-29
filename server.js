require('dotenv').config()                                        // to use the env variables as process.env we have to require this

const express = require('express');
const app = express()
const jwt = require('jsonwebtoken')

app.use(express.json())
const posts = [
    {
        name: "Madan",
        title: "Post 1"
    },
    {
        name: "Adit",
        title: "Post 2"
    }
]

app.get('/posts',authenticateToken,(req,res)=>{
    res.json(posts.filter(post => post.username === req.body.username))  // checking if the user is passing the correct name or else it returns nothing
})

app.post('/login',(req,res)=>{
    const username = req.body.username;                              // fetch the username from the request body
    const user = { name:username }                                   // for this username the token will be generated

    const acessToken = jwt.sign(user,process.env.ACESS_TOKEN_SECRET)  //jwt is imported and "sign" is a function which takes user details and a secret key
    res.json({acessToken: acessToken})                                // secret key would be passed from the .env file
})

function authenticateToken(req,res,next){                            // this function is passed as middleware
    const authHeader = req.headers['authorization'];                 // we are taken the token from headers
    const token = authHeader && authHeader.split(' ')[1]            // removing the bearer from there
    if(token==null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACESS_TOKEN_SECRET, (err,user)=>{
        if(err) return res.sendStatus(403);                         // if token is expired we send a 403 status 
        req.user = user;                                            // or else we show the user details
        next()
    })
}

app.listen(3000)