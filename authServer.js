require('dotenv').config()                                        // to use the env variables as process.env we have to require this

const express = require('express');
const app = express()
const jwt = require('jsonwebtoken')

app.use(express.json())

let refreshTokens = []

app.post('/token', (req, res) => {
    const refreshToken = req.body.token                                         // we will pass the token from the body
    if (refreshToken == null) return res.sendStatus(401)                        // if the token is null we send a 401 status
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)       // if the refreshtoken does not taken the new token it throws a 403 error
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403)                                       // if the token is not correct then we throw an error
      const accessToken = generateAccessToken({ name: user.name })              // or else we generate a new access token
      res.json({ accessToken: accessToken })
    })
})

app.delete('/logout', (req, res) => {                                                  
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)  // refresh token will be deleted after 15s and then new one will be taken
    res.sendStatus(204)
})

app.post('/login',(req,res)=>{
    const username = req.body.username;                                    // fetch the username from the request body
    const user = { name:username }                                         // for this username the token will be generated

    const acessToken = generateAccessToken(user)  
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET) // refresh token which is created using referesh token key
    refreshTokens.push(refreshToken)
    res.json({acessToken: acessToken , refreshToken: refreshToken})       // secret key would be passed from the .env file
})

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' })
}

app.listen(4000)