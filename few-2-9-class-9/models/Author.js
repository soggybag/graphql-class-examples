const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AuthorSchema = new Schema({
  name: String, 
  join_date: Date,
  email: String,
})

module.exports = mongoose.model('Author', AuthorSchema)