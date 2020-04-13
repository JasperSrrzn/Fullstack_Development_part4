const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'This is how a blog looks like',
    author: 'Engelbert Humperdinck',
    url: 'engelberthumperdinck-blogs.com',
    likes: 65
  },
  {
    title: 'what is the chinese virus',
    author: 'Donald T.',
    url: 'ihavenoideawhatimtalkingabout-blogs.com',
    likes: 1
  }
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog=>blog.toJSON())
}

const nonExistingId = async () => {
  const newBlog = new Blog({
    title: 'to be removed',
    author: 'to be removed',
    url: 'to be removed',
    likes: 0
  })

  await newBlog.save()
  await newBlog.delete()

  return newBlog._id.toString()

}

const usersInDb = async () =>{
  const users = await User.find({})
  return users.map(u=>u.toJSON())
}

module.exports = {
  initialBlogs,
  blogsInDb,
  nonExistingId,
  usersInDb
}
