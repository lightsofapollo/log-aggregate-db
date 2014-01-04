suite('client', function() {
  var db = require('./test/db')();
  var Client = require('./client');

  var subject;
  setup(function() {
    subject = new Client(db.client);
  });

  suite('#createEntity', function() {
    test('no options', function() {
      return subject.createEntity().then(
        function(id) {
          assert.ok(id, 'passes id');
          assert(typeof id === 'number', 'is a number');
        }
      );
    });

    test('contentType + owner', function() {
      var opts = {
        contentType: 'application/json',
        owner: 'owna'
      };

      return subject.createEntity(opts).then(
        function(id) {
          return db.client.query(
            'SELECT * FROM log_aggregate_db.entities WHERE id = $1',
            [id]
          );
        }
      ).then(
        function(results) {
          var row = results.rows[0];
          assert.equal(row.owner, opts.owner);
          assert.equal(row.content_type, opts.contentType);
        }
      );
    });
  });
});
