suite('postgres', function() {
  var sql = require('./sql/statements');
  var subject = require('./schema');
  var pg = require('pg');

  // connect
  var client;
  setup(function(done) {
    client = new pg.Client('postgres://vagrant:vagrant@localhost/vagrant');
    client.connect(done);
  });

  suite('#define', function() {
    setup(function(done) {
      client.query(sql.destroy, done);
    });

    setup(function(done) {
      return subject.define(client).then(null, function(err) {
        console.log(err);
        done(err);
      });
    });

    test('version', function(done) {
      client.query(sql.get_version, function(err, data) {
        assert.equal(data.rows.length, 1);
        assert.equal(data.rows[0].version, 1);
        done();
      });
    });

    teardown(function(done) {
      // drop the schema and all data!
      client.query(sql.destroy, done);
    });
  });
});
