/**
Our logging is based on storing rows in Postgres so we need to build a schema.
*/
var Promise = require('promise'),
    fs = require('fs');

function define(pgclient) {
  // like a require we use sync IO to load the sql file.
  var sql = fs.readFileSync('sql/schema.sql', 'utf8');

  return Promise(function(accept, reject) {
    var exec = Promise.denodeify(pgclient.query.bind(pgclient));
    return exec(sql).then(accept, reject);
  });
}

module.exports.define = define;
