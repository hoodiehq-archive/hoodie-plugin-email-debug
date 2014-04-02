var util = require('util');
var uuid = require('uuid');

var plugin_db_name = 'plugin/email-debug';

module.exports = function (hoodie) {
  console.log('loaded email-debug deynamic hoooks');
  return {
    'server.api.plugin-request': function (request, reply) {
      console.log('handle email-debug web hook');

      if (!request.payload) {
        reply({status: 'error', error: 'no_payload'});
        return; // ignore
      }

      if (!request.payload.mandrill_events) {
        reply({status: 'error', error: 'not_mandrill'});
        return; // ignore
      }

      var events = JSON.parse(request.payload.mandrill_events);

      events.forEach(function (mandrillEvent, eventNr) {
        var email_id = null;
        if (mandrillEvent.msg
            && mandrillEvent.msg.metadata
            && mandrillEvent.msg.metadata.email_id) {
          email_id = mandrillEvent.msg.metadata.email_id;
        } else {
          email_id = util.format("%s-%s",
            new Date().toISOString(),
            uuid.v4());
        }

        mandrillEvent.id = util.format('%s-%d',
          email_id);

        hoodie.database(plugin_db_name).add(
          'mandrill',
          mandrillEvent,
          function (error) {
            if (error) {
              console.log('could not add mandrill event: %j because of %s',
                mandrillEvent,
                error);
            }
          });
      });

      reply({status: 'ok'});
    }
  };
};
