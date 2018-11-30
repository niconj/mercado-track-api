const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SnapshotSchema = new Schema({
  price: Number,
  date: {
    type: Date,
    default: new Date()
  }
}, { _id: false })

module.exports = mongoose.model('Snapshot', SnapshotSchema)
