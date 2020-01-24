const express = require('express')
const AuthService = require('./auth-service')

const authRouter = express.Router()
const jsonParser = express.json()

authRouter
  .post('/login', jsonParser, (req, res, next) => {
    const { user_name, password } = req.body
    const loginUser = { user_name, password }

    for (const [key, value] of Object.entries(loginUser)) {
      if (value == null)
        return res.status(400).json({
          error: `Missing ${key} in request body`
        })
    }
    AuthService.getUserWithUserName(
      req.app.get('db'),
      loginUser.user_name
    )
      .then(dbuser => {
        if (!dbuser)
          return res.status(400, { error: `Invalid user name or password` })

        return AuthService.comparePasswords(loginUser.password, dbuser.password)
          .then(passwordsMatch => {
            if (!passwordsMatch)
              return res.status(400, { error: `Invalid user name or password` })

            res.send('ok')
          })
      })
      .catch(next)
  })

module.exports = authRouter