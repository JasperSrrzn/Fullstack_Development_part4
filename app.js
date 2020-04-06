const config = require('./utils/config')
const express = require('express')
const app = express()
const logger = require('./utils/logger')
const cors = require('cors')
const mongoose = require('mongoose')
const Blog = require('./models/blog')

logger.info('connecting to', config.MONGODB_URI)


mongoose
  .connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=>{
    logger.info('connected to MongoDB')
  })
  .catch(error=>{
    logger.error('error connection to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.json())


app.get('/api/blogs', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
})

app.post('/api/blogs', (request, response) => {
  const blog = new Blog(request.body)

  blog
    .save()
    .then(result => {
      response.status(201).json(result)
    })
})

module.exports = app
