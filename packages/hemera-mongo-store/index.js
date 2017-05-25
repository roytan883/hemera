'use strict'

const Mongodb = require('mongodb')
const ObjectID = Mongodb.ObjectID
const MongoStore = require('./store')
const StorePattern = require('hemera-store/pattern')
const serialize = require('mongodb-extended-json').serialize
const deserialize = require('mongodb-extended-json').deserialize

exports.plugin = function hemeraMongoStore (options, next) {
  const hemera = this
  const topic = 'mongo-store'
  const serializeResult = (result) => {
    return (options.serializeResult === true) ? serialize(result) : result
  }

  Mongodb.MongoClient.connect(options.mongo.url, options.mongos.options, function (err, db) {
    if (err) throw err

    hemera.expose('db', db)
    hemera.expose('mongodb', Mongodb)

    hemera.add({
      topic,
      cmd: 'dropCollection'
    }, function (req, cb) {
      const collection = db.collection(req.collection)
      collection.drop(cb)
    })

    hemera.add(StorePattern.create(topic), function (req, cb) {
      const collection = db.collection(req.collection)
      const store = new MongoStore(collection)
      store.ObjectID = ObjectID
      req.data = deserialize(req.data)

      store.create(req, cb)
    })

    hemera.add(StorePattern.update(topic), function (req, cb) {
      const collection = db.collection(req.collection)
      const store = new MongoStore(collection)
      store.ObjectID = ObjectID
      req.query = deserialize(req.query)

      store.update(req, deserialize(req.data), (err, result) => {
        (err) ? cb(err) : cb(err, serializeResult(result))
      })
    })

    hemera.add(StorePattern.updateById(topic), function (req, cb) {
      const collection = db.collection(req.collection)
      const store = new MongoStore(collection)
      store.ObjectID = ObjectID

      store.updateById(req, deserialize(req.data), (err, result) => {
        (err) ? cb(err) : cb(err, serializeResult(result))
      })
    })

    hemera.add(StorePattern.remove(topic), function (req, cb) {
      const collection = db.collection(req.collection)
      const store = new MongoStore(collection)
      store.ObjectID = ObjectID
      req.query = deserialize(req.query)

      store.remove(req, cb)
    })

    hemera.add(StorePattern.removeById(topic), function (req, cb) {
      const collection = db.collection(req.collection)
      const store = new MongoStore(collection)
      store.ObjectID = ObjectID

      store.removeById(req, (err, result) => {
        (err) ? cb(err) : cb(err, serializeResult(result))
      })
    })

    hemera.add(StorePattern.replace(topic), function (req, cb) {
      const collection = db.collection(req.collection)
      const store = new MongoStore(collection)
      store.ObjectID = ObjectID
      req.query = deserialize(req.query)

      store.replace(req, deserialize(req.data), cb)
    })

    hemera.add(StorePattern.replaceById(topic), function (req, cb) {
      const collection = db.collection(req.collection)
      const store = new MongoStore(collection)
      store.ObjectID = ObjectID

      store.replaceById(req, deserialize(req.data), (err, result) => {
        (err) ? cb(err) : cb(err, serializeResult(result))
      })
    })

    hemera.add(StorePattern.findById(topic), function (req, cb) {
      const collection = db.collection(req.collection)
      const store = new MongoStore(collection)
      store.ObjectID = ObjectID

      store.findById(req, (err, result) => {
        (err) ? cb(err) : cb(err, serializeResult(result))
      })
    })

    hemera.add(StorePattern.find(topic), function (req, cb) {
      const collection = db.collection(req.collection)
      const store = new MongoStore(collection)
      store.ObjectID = ObjectID
      req.query = deserialize(req.query)

      store.find(req, req.options, (err, result) => {
        (err) ? cb(err) : cb(err, serializeResult(result))
      })
    })

    hemera.log.debug('DB connected!')
    next()
  })
}

exports.options = {
  mongos: {},
  mongo: {
    url: 'mongodb://localhost:27017/'
  }
}

exports.attributes = {
  pkg: require('./package.json')
}
