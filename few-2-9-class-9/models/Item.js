const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Author = require('./Author')

const ItemSchema = new Schema({
  title: String, 
  post_date: Date,
  content: String, 
  url: String,
  author: { type: Schema.Types.ObjectId, ref: 'Author', required: true }
})

module.exports = mongoose.model('Item', ItemSchema)