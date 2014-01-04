suite('client', function() {
  var db = require('./test/db')();
  var Client = require('./client');

  var subject;
  setup(function() {
    subject = new Client(db.client);
  });

  suite('#createEntity', function() {
    test('no options', function(done) {
      return subject.createEntity().then(
        function(id) {
          assert.ok(id, 'passes id');
          assert(typeof id === 'number', 'is a number');
        }
      );
    });
  });
});
