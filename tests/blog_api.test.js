const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

let token;

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(note=> note.save())
  await Promise.all(promiseArray)

  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('secret',10)
  const user = new User({
    username: 'root',
    name:'root',
    passwordHash: passwordHash})

  await user.save()
  const login = await api.post('/api/login').send({username: 'root', password: 'secret'})
  token = 'bearer '.concat(login.body.token)
})

describe('when there are initially some blogs stored', () => {

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

})

describe('adding blogs', () => {
  test('a valid blog can be added when correctly authorized', async () => {
    const newBlog = {
      title: 'testing POST requests are easy',
      author: 'Jasper Sarrazin',
      url: 'inspiring-blogs.com',
      likes: '684'
    }

    await api
      .post('/api/blogs')
      .set('Authorization',token)
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

  test('unauthorized adding of a blog fails with the correct status and message', async () => {

    const newBlog = {
      title: 'testing POST requests are easy',
      author: 'Jasper Sarrazin',
      url: 'inspiring-blogs.com',
      likes: '684'
    }

    const result = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
      .expect('Content-Type',/application\/json/)

    expect(result.body.error).toContain('invalid token')

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)



  })

  test('a valid blog with empty likes is stored with 0 likes', async ()=> {
    const newBlog = {
      title: 'This is the worst blog ever',
      author: 'Tom Riddle',
      url: 'voldemort-stories.com'
    }

    await api
      .post('/api/blogs')
      .set('Authorization',token)
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
      .set('Authorization',token)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

  })

})

describe('viewing a specific blog', () => {

  test('succeeds with a valid id', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToView = blogsAtStart[0]
    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type',/application\/json/)

    expect(resultBlog.body).toEqual(blogToView)

  })

  test('fails with an invalid id', async () => {
    const nonExistingId = await helper.nonExistingId()

    await api
      .get(`/api/blogs/${nonExistingId}`)
      .expect(404)
  })
})

describe('deleting blogs', () => {
  test('succeeds with status 204 if id is valid', async () => {
    const newBlog = {
      title: 'testing POST requests are easy',
      author: 'Jasper Sarrazin',
      url: 'inspiring-blogs.com',
      likes: '684'
    }

    const addedBlog = await api
      .post('/api/blogs')
      .set('Authorization',token)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type',/application\/json/)


    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = addedBlog

    await api
      .delete(`/api/blogs/${blogToDelete.body.id}`)
      .set('Authorization',token)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

    expect(blogsAtEnd).not.toContainEqual(blogToDelete)
  })

  test('unauthorized deleting of a blog fails', async () => {
    const newBlog = {
      title: 'testing POST requests are easy',
      author: 'Jasper Sarrazin',
      url: 'inspiring-blogs.com',
      likes: '684'
    }

    const addedBlog = await api
      .post('/api/blogs')
      .set('Authorization',token)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type',/application\/json/)


    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = addedBlog

    const result = await api
      .delete(`/api/blogs/${blogToDelete.body.id}`)
      .expect(401)

    expect(result.body.error).toContain('invalid token')
    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length +1)
  })
})

describe('updating blogs', () => {
  test('update a blog with a valid id succeeds', async() => {
    blogsAtStart = await helper.blogsInDb()
    blogToUpdate = blogsAtStart[0]

    const newBlog = {
      likes: Number(blogToUpdate.likes)+100
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type',/application\/json/)

    const updatedBlog = await api.get(`/api/blogs/${blogToUpdate.id}`)

    expect(updatedBlog.body.likes).toBe(blogToUpdate.likes + 100)

  })

  test('update a blog with an invalid id fails with status code 404' , async () => {
    const nonExistingId = await helper.nonExistingId()

    await api
      .put(`/api/blogs/${nonExistingId}`)
      .expect(404)
  })



})


afterAll(() => {
  mongoose.connection.close()
})
