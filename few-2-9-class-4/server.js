// ===========================================
// Import dependencies 

require('dotenv').config()
const express = require('express')
const graphqlHTTP = require('express-graphql')
const { buildSchema } = require('graphql')
const fetch = require('node-fetch')

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
    humidity: Float
  }

  type Time {
    time: String
    date: String
  }

  type Horoscope {
    time: Time
    weather: Weather
    about: About
    
  }
  
  type Query {
    getAbout: String
    getWeather: Weather
    fetchWeather(zip: Int = 94122): Weather
    getHoroscope: Horoscope
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
    return 'Hello World'
  }, 
  // Resolver returns an Object with fields 
  getWeather: () => {
    return new Weather()
  },
  Time: {
    time: () => new Date().toLocaleTimeString(), 
    date: () => new Date().toLocaleDateString()
  },
  getHoroscope: {
    Time: 
  },
  // More complex resolver fetches data 
  // then returns an object with fields 
  fetchWeather: ({ zip }) => {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY
    const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zip},us&appid=${apiKey}`
    return fetch(url).then((res) => {
      return res.json()
    }).then((json) => {
      const desc = json.weather[0].description
      const k = Number(json.main.temp)
      const temp = ((k - 273.15) * 9/5 + 32).toFixed(2)
      return new Weather(desc, temp)
    }).catch((err) => {
      return err
    })
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

/* 

Challenges 
Your goal is to make a graphql endpoint that returns
data from several sources. 

*/