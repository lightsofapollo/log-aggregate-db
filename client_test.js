suite('client', function() {
  var db = require('./test/db')();
  var Client = require('./client');

  var subject;
  setup(function() {
    subject = new Client(db.client);
  });

  suite('#create', function() {
    test('no options', function() {
      return subject.create().then(
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

      return subject.create(opts).then(
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

  suite('#insert', function() {
    var buffer = new Buffer('woot!');

    var id;
    setup(function() {
      return subject.create().then(function(result) {
        id = result;
      });
    });

    setup(function() {
      return subject.addPart(id, 0, buffer.length, buffer);
    });

    test('part is added', function() {
      var query = 'SELECT * FROM log_aggregate_db.parts WHERE entities_id = $1';
      return db.client.query(query, [id]).then(
        function(result) {
          assert.ok(result);
          assert.equal(result.rowCount, 1);

          var row = result.rows[0];
          assert.equal(row.part_offset, 0);
          assert.equal(row.part_length, buffer.length);
          assert.equal(buffer.toString(), row.content.toString());
        }
      );
    });

    test('part integrity', function(done) {
      subject.addPart(6666666, 0, 1, buffer).then(
        null,
        function(err) {
          assert.ok(err.message.indexOf('violates foreign key constraint'));
          done();
        }
      );
    });
  });
});
