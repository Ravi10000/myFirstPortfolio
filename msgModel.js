const mongoose = require('mongoose')
const Schema = mongoose.Schema

const msgSchema = new Schema({
    email: String,
    content: String
})

module.exports = mongoose.model('Msg', msgSchema)