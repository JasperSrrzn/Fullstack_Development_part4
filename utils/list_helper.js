const _ = require('lodash')
const logger = require('./logger')
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => {
    return sum+blog.likes
  }
  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length===0){
    return undefined
  } else {
    const reducer = (max, blog) => {
      return (blog.likes<max.likes)?max:blog
    }
    return blogs.reduce(reducer,blogs[0])
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length===0){
    return undefined
  } else {
    mostBlogger = _.maxBy(_.entries(_.countBy(blogs, 'author')), _.last)
    return {
      author: mostBlogger[0],
      blogs: mostBlogger[1]
    }
  }
}

const mostLikes = (blogs) => {
  if (blogs.length===0){
    return undefined
  } else {

    const authorsWithTotalLikes = _(blogs)
                        .groupBy('author')
                        .map((objs, key) => ({
                          'author': key,
                          'likes': _.sumBy(objs, 'likes') }))
                        .value();

    const reducer = (max, author) => {
      return (author.likes<max.likes)?max:author
    }

    return authorsWithTotalLikes.reduce(reducer,authorsWithTotalLikes[0])
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
