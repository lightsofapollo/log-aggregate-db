  var Promise = require('promise'),
      PromiseProxy = require('proxied-promise-object');

function createClient() {
  var pg = require('pg');
  var result = {};
  setup(function() {
    result.client = new PromiseProxy(
      Promise,
      new pg.Client(process.env.POSTGRES_URI)
    );

    return result.client.connect();
  });

  var schema = require('../schema');
  setup(function() {
    return schema.define(
      result.client.subject
    );
  });

  teardown(function() {
    return schema.destroy(
      result.client.subject
    );
  });

  return result;
}

module.exports = createClient;
