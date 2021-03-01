require('dotenv').config()
const mongoose = require('mongoose')

const user = process.env.MLAB_USER
const password = process.env.MLAB_PASSWORD

const initDB = () => {
  mongoose.connect(
    `mongodb://${user}:${password}@ds149365.mlab.com:49365/msgraphql`,
    { useNewUrlParser: true }
  )
}

module.exports = initDB

// mongodb://<dbuser>:<dbpassword>@ds149365.mlab.com:49365/msgraphql
