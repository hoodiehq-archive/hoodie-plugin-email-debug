var assert = require('chai').assert;
var request = require('request');

var PORT = process.env.INTEGRATION_PORT;

suite('test _api hook', function () {
  test('show if plugin loaded correctly', function (done) {

    var url = 'http://127.0.0.1:' + PORT + '/_api/_plugins';
    request(url, function(error, response, body) {
      var json_body = JSON.parse(body);
      assert.equal('email-debug', json_body[0].name, 'we should be in the list of plugins');
      done();
    });

  });

  test('test with no payload', function (done) {

    var url = 'http://127.0.0.1:' + PORT + '/_api/_plugins/email-debug/_api';
    request(url, function(error, response, body) {
      var json_body = JSON.parse(body);
      assert.equal('error', json_body.status, 'status should be error')
      assert.equal('no_payload', json_body.error, 'error should be "no_payload"');
      assert.equal(200, response.statusCode, 'status should be 200');
      done();
    });

  });

  test('test with not mandrill', function (done) {

    var url = 'http://127.0.0.1:' + PORT + '/_api/_plugins/email-debug/_api';
    request({
      method: 'POST',
      url: url,
      json: true,
      body: {
        hello: 'kitty'
      }
    }, function(error, response, body) {
      assert.equal('error', body.status, 'status should be error')
      assert.equal('not_mandrill', body.error, 'error should be "not_mandrill"');
      assert.equal(200, response.statusCode, 'status should be 200');
      done();
    });

  });

  test('test with mandrill payload', function (done) {

    var url = 'http://127.0.0.1:' + PORT + '/_api/_plugins/email-debug/_api';
    var body = {
      mandrill_events: JSON.stringify([
        {
          ts: 1396095083,
          event: 'send',
          _id: 'email-id',
          msg: {
            'metadata': {
              'email_id': 'email_id'
            }
          }
        }
      ])
    };
    request({
      method: 'POST',
      url: url,
      json: true,
      body: body
    }, function(error, response, body) {
      console.log(body);
      assert.equal('ok', body.status, 'status should be ok')
      assert.equal(200, response.statusCode, 'status should be 200');
      done();
    });

  });


});
