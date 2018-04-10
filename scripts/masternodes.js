var mongoose = require('mongoose')
    , lib = require('../lib/explorer')
    //, db = require('../lib/database')
    , settings = require('../lib/settings')
    //, Masternodes = require('../models/masternodes')
    , request = require('request');
var geolite2 = require('geolite2');
var maxmind = require('maxmind');
var geodata = maxmind.openSync(geolite2.paths.country);

mongoose.set('debug', false);

var dbString = 'mongodb://' + settings.dbsettings.user;
dbString = dbString + ':' + settings.dbsettings.password;
dbString = dbString + '@' + settings.dbsettings.address;
dbString = dbString + ':' + settings.dbsettings.port;
dbString = dbString + '/' + settings.dbsettings.database;

var MasternodesSchema = new mongoose.Schema({
    txhash: {type: String, default: ""},
    status: {type: String, default: ""},
    address: {type: String, default: ""},
    pubkey: {type: String, default: ""},
    lastseen: {type: String, default: ""},
    activesec: {type: Number, default: 0},
    country: { type: String, default: "" },
    countrycode: { type: String, default: ""}
});

function trim(s, mask) {
    while (~mask.indexOf(s[0])) {
        s = s.slice(1);
    }
    while (~mask.indexOf(s[s.length - 1])) {
        s = s.slice(0, -1);
    }
    return s;
}

const conn = mongoose.createConnection(dbString);
const MyModel = conn.model('Masternodes', MasternodesSchema);

function exit() {
    mongoose.disconnect();
    process.exit(0);
}

var lookup = function(err, data) {
  if (err) throw err; // Check for the error and throw if it exists.
//  console.log('got data: '+data); // Otherwise proceed as usual.
var lookup = maxmind.open(geolite2.paths.country);
var country = lookup.get(data);

};


function Action() {
    var req = request({
        uri: 'http://127.0.0.1:' + settings.port + '/api/masternodelist?mode=full',
        json: true
    }, function (error, response, body) {
        var mn_hash = Object.keys(body);

        lib.syncLoop(mn_hash.length, function (loop) {
            var mn = mn_hash[loop.iteration()];
            var mn_data = body[mn].split(/\s+/);
            var mn_status = mn_data[1];
            var mn_pubkey = mn_data[3];
            var mn_address_raw = mn_data[4].split(':')[0];;
            var mn_address = trim(mn_data[4].substring(0, mn_data[4].lastIndexOf(":")), "[]");
            var mn_lastseen = mn_data[5];
            var mn_activesec = mn_data[6];
            var mn_country = geodata.get(mn_address).country.names.en;
            var mn_countrycode =  geodata.get(mn_address).country.iso_code;
            //console.log(mn_address + " " + mn_country + " " + mn_countrycode);

            var newmn = MyModel.findOneAndUpdate({txhash: mn},{

                status: mn_status,
                address: mn_address,
                pubkey: mn_pubkey,
                lastseen: mn_lastseen,
                activesec: mn_activesec,
                country: mn_country,
                countrycode: mn_countrycode

            }, {returnNewDocument: true, upsert: true}, function () {
                loop.next();
            });

        }, function () {
            exit();
        });
    });
}

Action();
