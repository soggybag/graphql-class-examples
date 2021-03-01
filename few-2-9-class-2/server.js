// ===========================================
// Import dependencies 

const express = require('express')
const graphqlHTTP = require('express-graphql')
const { buildSchema } = require('graphql')

// ===========================================
// Build a schema
// The schema inlcudes the types that can be returned 
// This example includes About and Weather 
// It must also include a Query type 

const schema = buildSchema(`
  type About {
    message: String
  }

  type Weather {
    desc: String
    temp: Float
  }
  
  type Query {
    getAbout: About
    getWeather: Weather
    fetchWeather(zip: Int = 94122): Weather
  }
`)

// ====================================
// This example will return a Weather Object type 
// We define it here
class Weather {
  constructor(desc = 'overcast', temp = 56) {
    this.desc = desc
    this.temp = temp
  }
}

// ====================================
// This root object provides resolver functions 
// Resolvers return the data asked for by queries 

const root = {
  // Simple resolver returns a string
  getAbout: () => {
    return { message: 'Hello World' }
  }, 
  // Resolver returns an Object with fields 
  getWeather: () => {
    return new Weather()
  },
  // This resolver receives params from the query 
  fetchWeather: ({ zip }) => {
    // runs some code here...
    // then return an object
    return new Weather('Humid', 78)
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
const port = 4000
app.listen(port, () => {
  console.log('Running GraphQL at localhost:'+port)
})