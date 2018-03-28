var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var MasternodesSchema = new Schema({
  rank: { type: Number, default: 0 },
  network: { type: String },
  txhash: { type: String },
  outidx: { type: Number },
  status: { type: String },
  addr: { type: String, index: true },
  version: { type: Number },
  lastseen: { type: Number },
  activetime: { type: Number },
  lastpaid: { type: Number }
}, {id: false});

module.exports = mongoose.model('Masternodes', MasternodesSchema);
