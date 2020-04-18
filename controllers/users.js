const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
  const body = request.body
  if (!body.password){
    return response.status(400).json({error: 'missing password'})
  } else if (body.password.length<3){
    return response.status(400).json({error: 'too short password (>3)'})
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash: passwordHash
  })

  const savedUser = await user.save()

  response.json(savedUser)
})

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', {title:1, author: 1, url: 1, id: 1})
  response.json(users)
})

module.exports = usersRouter
