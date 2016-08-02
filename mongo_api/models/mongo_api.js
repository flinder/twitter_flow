var mongoose = require('mongoose');

var MoverUserSchema = new mongoose.Schema({
  _id: String,
  cntries: Array,
  lang: String,
  cntryCount: Number,
  tweets: Array,
  spd: Number},
  {collection: 'alldata'});

module.exports = mongoose.model('MoverUser', MoverUserSchema);
