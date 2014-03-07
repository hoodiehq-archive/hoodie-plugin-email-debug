# Debug Email

Listens for outgoing email snd records them into the `plugin/email-debug` database.

Sets up a webhook (currently hardcoded for the Mandrill format) and records responses into the `plugin/email-debug` database.

A clever view function allows to list all outgoinng mails with their delivery status(es). The view result shows for which emails there is no status, so you can investiate further.

```js
function(doc) {
  if(doc.type == 'email-debug') {
    var id = doc._id.split('/')[1];
    emit([doc.createdAt, doc.createdBy], {_id: 'mandrill/' + id + '-0'});
  }
}
```

There can be more than one event per email, we enumerate them with `-1`, `-2` etc.

Currently depends on https://github.com/hoodiehq/hoodie-server/pull/248


TODO: If multiple events come in more than one webhook call, we get id collisions, should not happen