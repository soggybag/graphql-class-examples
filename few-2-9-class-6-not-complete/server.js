// ===========================================
// Import dependencies 

require('dotenv').config()
const express = require('express')
const graphqlHTTP = require('express-graphql')
const { buildSchema } = require('graphql')
const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')
const { makeExecutableSchema } = require('graphql-tools')

// https://marmelab.com/blog/2017/09/06/dive-into-graphql-part-iii-building-a-graphql-server-with-nodejs.html#handling-relationships
const MongoClient = require('mongodb').MongoClient
const DataLoader = require('dataloader')
const getUsersById = (ids) => {
  return []
}
const dataLoaders = () => ({
  userById: new DataLoader(getUsersById)
})


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
// Fake DB

const tweets = [
  { id: 1, body: 'Test', date: new Date(), author_id: 1 }, 
  { id: 2, body: 'Hello', date: new Date(), author_id: 2 },
]

const authors = [
  { id: 1, username: 'Catman', first_name: 'Andrew', last_name: 'Akerman' }, 
  { id: 2, username: 'DogDude', first_name: 'Bob', last_name: 'Baker' },
]

const stats = [
  { tweet_id: 1, views: 123, likes: 4, retweets: 1, responses: 0 },
  { tweet_id: 2, views: 234, likes: 6, retweets: 3, responses: 5 }, 
]

class Tweet {
  constructor(id, author_id, body) {
    this.id = id
    this.author_id = author_id
    this.body = body
    this.date = new Date()
  }
}

// ====================================
// This root object provides resolver functions 
// Resolvers return the data asked for by queries 

const resolvers = {
  Query: {
    Tweets: () => tweets, 
    // Defines a resolver for Tweet
    Tweet: (_, { id }) => tweets.find(tweet => tweet.id == id), 
  },
  Tweet: {
    // Resolve each field in a Tweet
    id: tweet => tweet.id,
    body: tweet => tweet.body,
    Author: tweet => authors.find(author => author.id == tweet.author_id),
    Stats: tweet => stats.find(stat => stat.tweet_id == tweet.id)
  }, 
  User: {
    full_name: (author) => `${author.first_name} ${author.last_name}`
  },
  Mutation: {
    createTweet: (_, { body }) => {
      const nextTweetId = tweets.reduce((id, tweet) => {
        return Math.max(id, tweet.id)
      }, -1) + 1
      const newTweet = new Tweet(nextTweetId, currentUserId, body)
      tweets.push(newTweet)
      return newTweet
    }
  }
}

// ====================================
// Create and express app and configure middleware

const start = async () => {
  const mongoClient = await MongoClient.connect('mongodb://localhost:27017/bar', { useNewUrlParser: true })

  const app = express()
  app.use((req, res, next) => {
    console.log('ip:', req.ip)
    next()
  })

  const schemaFile = path.join(__dirname, 'schema.graphql')
  const typeDefs = fs.readFileSync(schemaFile, 'utf8')
  const schema = makeExecutableSchema({ typeDefs, resolvers })

  // Use the graphql browser
  app.use('/graphql', graphqlHTTP({
    schema, 
    graphiql: true,
    context: { mongoClient, dataloaders: Dataloaders() }, // This context object is passed as the 3rd arg to all resolvers
  }))

  // Launch the app on port 4000
  app.listen(4000, () => {
    console.log('Running GraphQL at localhost:4000')
  })
}

start()