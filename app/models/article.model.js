const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Snapshot = require('./snapshot.model')
const { constants } = require('../utils')

const ArticleSchema = new Schema({
  currency_id: String,
  id: { type: String, unique: true, required: true },
  title: String,
  status: String,
  permalink: String,
  thumbnail: String,
  images: { type: [String], default: [] },
  history: [Snapshot.schema]
})

ArticleSchema.methods.getLastPrice = function () {
  const lastSnapshot = this.history[this.history.length - 1]
  return lastSnapshot && lastSnapshot.price
}

ArticleSchema.methods.getLastSnapshot = function () {
  const lastSnapshot = this.history[this.history.length - 1]
  return lastSnapshot
}

ArticleSchema.methods.shouldUpdate = function (item, images) {
  const lastSnapshot = this.getLastSnapshot()
  const pricesOutdated = lastSnapshot !== null && (lastSnapshot.price !== item.price || lastSnapshot.original_price !== item.original_price)
  const photosOutdated = images.some(i => this.images.toObject().indexOf(i) === -1)

  return pricesOutdated || photosOutdated
}

ArticleSchema.methods.shouldCreate = function () {
  return this.status === constants.articleStatus.active
}

module.exports = mongoose.model('Article', ArticleSchema)
