
const express = require('express')
const graphqlHTTP = require('express-graphql')
const { buildSchema } = require('graphql')


// Define a schema
const schema = buildSchema(`
  type About {
    message: String
  }

  type Post {
    title: String 
    date: Time
  }

  type Time {
    time: String
    date: String
  }

  type Roll {
    rolls: [Int]
    total: Int
  }

  type Query {
    getAbout: About
    getTime: Time
    roll(sides: Int!, dice: Int!): Roll
  }
`)

// Define a resolver 
const root = {
  getAbout: () => {
    return { message: 'Hello World' }
  }, 
  getTime: {
    time: () => new Date().toLocaleTimeString(),
    date: () => new Date().toLocaleDateString()
  }, 
  Time: {
    time: () => new Date().toLocaleTimeString(),
    date: () => new Date().toLocaleDateString()
  }, 
  roll: ({ sides, dice }) => {
    const rolls = []
    let total = 0
    for (let i = 0; i < dice; i += 1) {
      const n = Math.floor(Math.random() * sides) + 1
      rolls.push(n)
      total += n
    }

    const t = rolls.reduce((aac, n) => {
      return acc + n
    }, 0)

    return { rolls, total }
  }
    // getTime: () => {
    //   return { time: new Date().toLocaleTimeString() }
    // }
}

// Define a new app 
const app = express()

// Apply middleware
app.use('/graphql', graphqlHTTP({
  schema, 
  rootValue: root, 
  graphiql: true
}))

const port = 4000
app.listen(port, () => {
  console.log('Running on port:'+port)
})






