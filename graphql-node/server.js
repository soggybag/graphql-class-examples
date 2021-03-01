var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  input MessageInput {
    content: String
    author: String
  }

  type Message {
    id: ID!
    content: String
    author: String
  }

  type Mutation {
    setMessage(message: String): String
    createMessage(input: MessageInput): Message
    updateMessage(id: ID!, input: MessageInput): Message
  }

  type RandomDie {
    numSides: Int!
    rollOnce: Int!
    roll(numRolls: Int!): [Int]
  }

  type Query {
    getMessage(id: ID!): Message
    quoteOfTheDay: String
    random: Float!
    rollThreeDice: [Int]
    rollDice(numDice: Int!, numSides: Int): [Int]
    getDie(numSides: Int): RandomDie
    ip: String
  }
`);

function loggingMiddleware(req, res, next) {
  console.log('ip:', req.ip)
  next()
} 

class Message {
  constructor(id, { content, author }) {
    this.id = id
    this.content = content 
    this.author = author
  } 
}

class RandomDie {
  constructor(numSides) {
    this.numSides = numSides;
  }

  rollOnce() {
    return 1 + Math.floor(Math.random() * this.numSides);
  }

  roll({numRolls}) {
    var output = [];
    for (var i = 0; i < numRolls; i++) {
      output.push(this.rollOnce());
    }
    return output;
  }
}

var fakeDatabase = {}
// The root provides a resolver function for each API endpoint
var root = {
  ip: function(args, req) {
    return req.ip
  }, 
  setMessage: function({message}) {
    fakeDatabase.message = message
    return message
  },
  getMessage: function({id}) {
    if (!fakeDatabase[id]) {
      throw new Error('no message exists with id '+id)
    }
    return new Message(id, fakeDatabase[id])
  },
  createMessage: function({input}) {
    var id = require('crypto').randomBytes(10).toString('hex')
    fakeDatabase[id] = input
    return new Message(id, input)
  },
  updateMessage: function({id, input}) {
    if (!fakeDatabase[id]) {
      throw new Error('no message exists with is '+id)
    }
    fakeDatabase[id] = input
    return new Message(id, input)
  },
  quoteOfTheDay: () => {
    return Math.random() < 0.5 ? 'Take it easy' : 'Salvation lies within';
  },
  random: () => {
    return Math.random();
  },
  rollThreeDice: () => {
    return [1, 2, 3].map(_ => 1 + Math.floor(Math.random() * 6));
  },
  rollDice: function (args) {
    var output = [];
    for (var i = 0; i < args.numDice; i++) {
      output.push(1 + Math.floor(Math.random() * (args.numSides || 6)));
    }
    return output;
  }, 
  getDie: function({numSides}) {
    return new RandomDie(numSides || 6)
  } 
};

var app = express();
app.use(loggingMiddleware)
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root, 
  graphiql: true,
}))

app.listen(4000, () => {
  console.log('Running a GraphQL API server at localhost:4000/graphql');
});
