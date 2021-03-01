// ===========================================
// Import dependencies 

require('dotenv').config()
const express = require('express')
const graphqlHTTP = require('express-graphql')
const fs = require('fs')
const path = require('path')
const { makeExecutableSchema } = require('graphql-tools')

const initDB = require('./database')
const Item = require('./models/Item')

const itemLoader = require('./dataloaders')

initDB()

// ======================================================
// Define some resolvers

const resolvers = {
  Query: {
    // Resolves an array of Item
    Items: () => Item.find(),
    // Resolves a single Item by it's ID
    // itemById: (_, { id }) => Item.findById(id)
    itemById: (_, { id }, { itemLoader }) => itemLoader.load(id)
  },
  Mutation: {
    addItem: (_, args) => {
      const newItem = new Item({...args, post_date: new Date()})
      return newItem.save()
    },
    updateItem: (_, args) => {
      return Item.findOneAndUpdate(args)
    },
    removeItem: (_, { id }) => {
      return Item.findOneAndDelete({ _id: id })
    }
  }
}

// ====================================
// Create and express app and configure middleware

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
  context: { itemLoader: itemLoader(Item) }, 
  formatError: error => ({
    message: error.message,
    locations: error.locations,
    stack: error.stack ? error.stack.split('\n') : [],
    path: error.path
  })
}))

// Launch the app on port 4000
const port = 4000
app.listen(4000, () => {
  console.log('Running GraphQL at localhost:'+port)
  // Item.find().then(items => console.log(items)).catch(err => console.log(err.message))
})