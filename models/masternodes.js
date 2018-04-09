var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var MasternodesSchema = new Schema({
  txhash: { type: String, default: "" },
  status: { type: String, default: ""  },
  address: { type: String, default: "" },
  pubkey: { type: String, default: "" },
  lastseen: { type: String, default: "" },
  activesec: { type: Number, default: 0 }
});

module.exports = mongoose.model('Masternodes', MasternodesSchema);
