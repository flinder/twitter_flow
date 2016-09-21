var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var mongo_api = require('../models/mongo_api.js');

/* GET /todos listing. */
router.get('/', function(req, res, next) {
  mongo_api.findOne({}, function (err, docs) {
    if (err) return next(err);
    res.json(docs);
  });
});

// Test: Retrieve one document
router.get('/one', function(req, res, next) {
  mongo_api.find({}, function (err, doc) {
    if (err) return next(err);
    res.json(doc);
  });
});

router.get('/lang=:lang&spd=:spd', function(req, res, next) {
  mongo_api.find({lang: req.params.lang, spd: {$gt: req.params.spd}} , '-tweets',  function (err, doc) {
    if (err) return next(err);
    res.json(doc);
  }).limit(req.params.limit);
});

router.get('/lang=:lang', function(req, res, next) {
  mongo_api.find({lang: req.params.lang} , '-tweets',  function (err, doc) {
    if (err) return next(err);
    res.json(doc);
  }).limit(req.params.limit);
});


module.exports = router;
