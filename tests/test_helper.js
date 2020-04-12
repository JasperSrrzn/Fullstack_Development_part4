const Blog = require('../models/blog')

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

module.exports = {
  initialBlogs,
  blogsInDb
}
