var Promise = require('promise');

var SQL = {
  insertEntity: 'INSERT INTO log_aggregate_db.entities' +
                  '(updated_at, created_at, contentType, owner)' +
                'VALUES' +
                  '(NOW(), NOW(), $1, $2)' +
                'RETURNING id'
};

function Client(db) {
  this.db = db;
}

Client.prototype = {
  /**
  Create an entity in the log database.

  @param {Object} [config] for the entity.
  @param {String} [config.contentType] content type for the entity.
  @param {String} [config.owner] owner of the entity.
  @return {Promise}
  */
  createEntity: function(config) {
    var query = Promise.denodeify(this.db.query.bind(this.db));
    return query(SQL.insertEntity, [
      (config && config.contentType) || '',
      (config && config.owner) || ''
    ]).then(
      function(result) {
        return result.rows[0].id;
      }
    );
  }
};

module.exports = Client;
