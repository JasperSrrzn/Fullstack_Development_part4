const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(note=> note.save())
  await Promise.all(promiseArray)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type',/application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('unique identifier is called id', async () => {
  const response = await api.get('/api/blogs')
  const blogs = response.body
  blogs.forEach(blog=>{
    expect(blog.id).toBeDefined()
  })
  ids = blogs.map(blog=>blog.id)
  const allDifferent = true
  for (let i=1;i<ids.length;i++){
    if(ids.slice(0,i).includes(ids[i])){
      allDifferent = false
    }
  }
  expect(allDifferent).toBe(true)
})


test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'testing POST requests are easy',
    author: 'Jasper Sarrazin',
    url: 'inspiring-blogs.com',
    likes: '684'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type',/application\/json/)

  const blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
  expect(blogsAtEnd.map(blog=>blog.title)).toContain(newBlog.title)
  expect(blogsAtEnd.map(blog=>blog.url)).toContain(newBlog.url)
  expect(blogsAtEnd.map(blog=>blog.likes)).toContain(Number(newBlog.likes))
  expect(blogsAtEnd.map(blog=>blog.author)).toContain(newBlog.author)
})

test('a valid blog with empty likes is stored with 0 likes', async ()=> {
  const newBlog = {
    title: 'This is the worst blog ever',
    author: 'Tom Riddle',
    url: 'voldemort-stories.com'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type',/application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  filteredBlogs = blogsAtEnd
  .filter(b => b.title === newBlog.title && b.author === newBlog.author && b.url===newBlog.url)

  expect(filteredBlogs).toHaveLength(1)

  addedBlog = filteredBlogs[0]

  expect(addedBlog.likes).toBe(0)

})

test('an invalid blog with empty url and title is not stored', async () => {
  const newBlog = {
    author: 'Spongebob Squarepants',
    likes: 986
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

})


afterAll(() => {
  mongoose.connection.close()
})
