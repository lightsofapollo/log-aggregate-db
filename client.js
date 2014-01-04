var Promise = require('promise'),
    promiseProxy = require('proxied-promise-object');

var SQL = {
  insertEntity: 'INSERT INTO log_aggregate_db.entities' +
                  '(updated_at, created_at, content_type, owner)' +
                'VALUES' +
                  '(NOW(), NOW(), $1, $2)' +
                'RETURNING id',

  insertPart: 'INSERT INTO log_aggregate_db.parts ' +
                '(entities_id, part_offset, part_length, content) ' +
              'VALUES ' +
                '($1, $2, $3, $4)'
};

function Client(db) {
  this.db = promiseProxy(Promise, db);
}

Client.prototype = {
  /**
  Create an entity in the log database.

  @param {Object} [config] for the entity.
  @param {String} [config.contentType] content type for the entity.
  @param {String} [config.owner] owner of the entity.
  @return {Promise}
  */
  create: function(config) {
    return this.db.query(SQL.insertEntity, [
      (config && config.contentType) || '',
      (config && config.owner) || ''
    ]).then(
      function(result) {
        return result.rows[0].id;
      }
    );
  },

  /**
  Insert a piece of the stream into a particular entity.

  @param {Number} id of entity (returned by create)
  @param {Number} offset of the buffer.
  @param {Number} length (in bytes) of the buffer.
  @param {String|Buffer} buffer content to insert.
  */
  addPart: function(id, offset, length, buffer) {
    return this.db.query(SQL.insertPart, [
      id,
      offset,
      length,
      buffer
    ]);
  }
};

module.exports = Client;
