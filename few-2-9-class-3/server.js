// ===========================================
// Import dependencies 

const express = require('express')
const graphqlHTTP = require('express-graphql')
const { buildSchema } = require('graphql')

// ===========================================
// Build a schema
// Look at the Mutation type. This type takes
// subject and content as args and returns 
// a post type

const schema = buildSchema(`
  type About {
    message: String
  }

  type Post {
    subject: String
    content: String
    date: String
  }
  
  type Query {
    getAbout: String
    getPosts: [Post]
    getPost(id: Int): Post
  }

  type Mutation {
    createPost(subject: String, content: String): Post
  }
`)


// ====================================
// Fake DB. This example stores all of it's 
// data in an object this will be lost when  
// the server is stopped. 

// For the example this will store an 
// array of posts 

const fakeDB = []


// ====================================
// This class represents a post

class Post {
  constructor(subject, content) {
    this.subject = subject
    this.content = content
    this.date = new Date().toLocaleString()
    this.id = fakeDB.length
  }
}


// ====================================
// This root object provides resolver functions 
// Resolvers return the data asked for by queries 

const root = {
  // Simple resolver returns a string
  getAbout: (args, req) => {
    return 'Hello World'
  }, 
  // Resolver returns an Object with fields 
  getPosts: () => {
    return fakeDB
  },
  // This resolver receives params from the query 
  getPost: ({ id }) => {
    // runs some code here...
    // then return an object
    return fakeDB[id]
  },
  createPost: ({ subject, content }) => {
    const newPost = new Post(subject, content)
    fakeDB.push(newPost)
    return newPost
  }
}

// ====================================
// Create and express app and configure middleware

const app = express()
app.use((req, res, next) => {
  console.log('ip:', req.ip)
  next()
})

// Use the graphql browser
app.use('/graphql', graphqlHTTP({
  schema, 
  rootValue: root,
  graphiql: true
}))

// Launch the app on port 4000
app.listen(4000, () => {
  console.log('Running GraphQL at localhost:4000')
})