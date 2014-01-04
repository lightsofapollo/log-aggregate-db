/**
Our logging is based on storing rows in Postgres so we need to build a schema.
*/
var Promise = require('promise'),
    Transaction = require('pg-transaction'),
    fs = require('fs');

function define(pgclient) {
  // like a require we use sync IO to load the sql file.
  var sql = fs.readFileSync('sql/schema.sql', 'utf8');
  var txn = new Transaction(pgclient);

  var begin = Promise.denodeify(txn.begin.bind(txn));
  var commit = Promise.denodeify(txn.commit.bind(txn));
  var rollback = Promise.denodeify(txn.rollback.bind(txn));
  var exec = Promise.denodeify(pgclient.query.bind(pgclient));

  return new Promise(function(accept, reject) {
    // begin by opening a new transaction
    return begin().then(
      function() {
        return exec(sql);
      }
    ).then(
      function() {
        return commit();
      }
    ).then(
      accept,
      // rollback transaction but pass the error along (reject the promise)
      function handleError(err) {
        var done = reject.bind(null, err);
        rollback().then(done, done);
      }
    );

  });
}

module.exports.define = define;

function destroy(pgclient) {
  var sql = require('./sql/statements');

  var exec = Promise.denodeify(pgclient.query.bind(pgclient));
  return exec(sql.destroy);
}

module.exports.destroy = destroy;
