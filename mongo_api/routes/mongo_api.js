var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var mongo_api = require('../models/mongo_api.js');

/* GET /todos listing. */
router.get('/', function(req, res, next) {
  mongo_api.find(function (err, docs) {
    if (err) return next(err);
    res.json(docs);
  });
});

router.get('/one', function(req, res, next) {
  mongo_api.findOne({}, function (err, doc) {
    if (err) return next(err);
    res.json(doc);
  });
});


module.exports = router;
