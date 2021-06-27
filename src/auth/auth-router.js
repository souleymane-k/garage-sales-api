const express = require('express')
const AuthService = require('./auth-service')
const { requireAuth } = require('../middleware/jwt-auth')

const authRouter = express.Router()
const jsonBodyParser = express.json()

authRouter
  .post('/login', jsonBodyParser, (req, res, next) => {
    const {username, password } = req.body
    const loginUser = {username, password}

    for (const [key, value] of Object.entries(loginUser))
      if (value == null)
        return res.status(400).json({
          message: `username and password required`
        })

    AuthService.getUserWithUserName(
      req.app.get('db'),
      loginUser.username
    )
      .then(dbUser => {
        if (!dbUser)
          return res.status(401).json({
            message: 'invalid username',
          })

        return AuthService.comparePasswords(loginUser.password, dbUser.password)
          .then(compareMatch => {
            if (!compareMatch)
              return res.status(401).json({
                message: 'invalid password',
              })

            const sub = dbUser.username
            const payload = { user_id: dbUser.id }
            res.send({
              authToken: AuthService.createJwt(sub, payload),
            })
          })
      })
      .catch(next)
  })

authRouter.post('/refresh', requireAuth, (req, res) => {
  const sub = req.user.username
  const payload = { user_id: req.user.id }
  res.send({
    authToken: AuthService.createJwt(sub, payload),
  })
});
authRouter
  .route('/user')
  .get(requireAuth, async (req, res, next) => {
    const user = UsersService.serialize(req.user);
    try {
      const product = await ProductsService.findCurrentByUserId(req.app.get('db'), user.id);
      user.hasCurrentProduct = product ? true : false;
      res.json(user);
    } catch(err) {
      next({status: 500, message: err.message});
    }
  });

module.exports = authRouter