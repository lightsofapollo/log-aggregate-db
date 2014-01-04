var Promise = require('promise'),
    TransformStream = require('stream').Transform,
    promiseProxy = require('proxied-promise-object'),
    QueryStream = require('pg-query-stream');

var SQL = {
  insertEntity: 'INSERT INTO log_aggregate_db.entities' +
                  '(updated_at, created_at, content_type, owner)' +
                'VALUES' +
                  '(NOW(), NOW(), $1, $2)' +
                'RETURNING id',

  updateEntity: 'UPDATE log_aggregate_db.entities SET updated_at = NOW(),',

  insertPart: 'INSERT INTO log_aggregate_db.parts ' +
                '(entities_id, part_offset, part_length, content) ' +
              'VALUES ' +
                '($1, $2, $3, $4)',

  findContent: 'SELECT content, part_offset FROM log_aggregate_db.parts ' +
               'WHERE entities_id = $1 AND part_offset >= $2'
};

function ContentStream() {
  TransformStream.call(this);
  // Sorta hacky but the idea is we get written to by objects and the
  // stream outputs binary.
  this._writableState.objectMode = true;
}

ContentStream.prototype = {
  __proto__: TransformStream.prototype,

  /**
  Starting offset
  */
  offset: 0,

  /**
  Current offset inside the parts.
  */
  currentOffset: 0,

  _transform: function(chunk, encoding, done) {
    this.currentOffset += chunk.part_offset;
    this.push(chunk.content);
    done();
  }
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
  Update a particular entity's settings.

    client.update(111, { complete: true });

  @param {Number} id for entity
  @param {Object} options for entity
  @param {Boolean} [options.complete]
    when true no more parts are expected to be added.
  @param {String} [options.owner] Current owner of the entity
  */
  update: function(id, options) {
    var query = SQL.updateEntity;

    if (!options) throw new Error('options are required');

    var hasUpdate = ('complete' in options) ||
                    ('owner' in options);

    if (!hasUpdate) throw new Error('must pass either complete or owner');

    // we can't set random $N placeholders we must go sequentially
    var nth = 1;

    var values = [];
    var set = [];

    if (options.owner) {
      values.push(options.owner);
      set.push('owner = $' + nth++);
    }

    if (options.complete) {
      values.push(options.complete);
      set.push('complete = $' + nth++);
    }

    query += set.join(', ');
    query += ' WHERE id = $' + nth++;
    values.push(id);

    return this.db.query(query, values);
  },

  /**
  Insert a piece of the stream into a particular entity.

  XXX: We don't have a use case for streaming a series of parts as one
       transaction so there is no way to do this right now.

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
  },

  /**
  Fetches the content of a particular entity starting from an offset

  @param {Number} id of entity.
  @param {Number} [startingOffset=0] (inclusive) starting offset in the stream.
  @return {ReadableStream} readable stream to consume from.
  */
  content: function(id, startingOffset) {
    var contentStream = new ContentStream({
      offset: startingOffset
    });

    var stream = new QueryStream(SQL.findContent, [id, startingOffset || 0]);

    stream.pipe(contentStream);
    this.db.query(stream);

    return contentStream;
  },
};

module.exports = Client;
