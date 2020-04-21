require('dotenv').config({ path: 'elainaRebuild-config/.env' })
const log = require('../elainaRebuild-utils/log.js')
const mongodb = require('mongodb')

module.exports = (function() {
    var maindb = '';
  
    return { // public interface
        initConnection: function () {
            let uri = process.env.MONGODB_CONNECTION_STRING
            mongodb.MongoClient.connect(uri, {useNewUrlParser: true}, function(err, db) {
                if (err) throw err;
                maindb = db.db('ElainaDB');
                console.log("db connection established");
            })
        },
        getConnection: function () {
            if (maindb === '') this.initConnection
            return maindb
        }
    };
})();