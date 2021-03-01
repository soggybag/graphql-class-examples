const express = require('express')
const express_graphql = require('express-graphql')
const { buildSchema } = require('graphql')

const courseData = require('./course-data')

// GraphQL Schema
const schema = buildSchema(`
  type Query {
    course(id: Int!): Course
    courses(topic: String!): [Course]
  }

  type Mutation {
    updateCourseTopic(id: Int!, newTopic: String!)
  }

  type Course {
    id: Int
    title: String
    author: String
    desc: String
    url: String
    topic: String
  }
`)

const getCourse = ({ id }) => {
  return courseData.filter(course => {
    return course.id === id
  })[0]
}

const getCourses = ({ topic }) => {
  if(topic) {
    return courseData.filter(course => {
      return course.topic === topic
    })
  }
  return courseData
}

const updateCourseTopic = ({ id, newTopic }) => {
  courseData.map(course => {
    if(course.id === id) {
      course.topic = newTopic
    }
    return course
  })
}

// root resolver
const root = {
  course: getCourse,
  courses: getCourses,
  updateCourseTopic
}

// create server endpoint
const app = express()
app.use('/graphql', express_graphql({
  schema,
  rootValue: root,
  graphiql: true
}))

app.listen(4000, () => console.log('grapghql server running on 4000'))
