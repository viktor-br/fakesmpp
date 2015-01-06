fakesmpp
========

Simple fake SMPP server based on nodejs smpp package (https://www.npmjs.com/package/smpp).

Required node packages:
smpp
winston -- logging
strftime -- date format
optimistic -- command options

Running on default 2775 port and always answer Ok status (DELIVRD) and authorize user (service_id) with pass password.

[sudo] nodejs smpp.js

Running on custom 9999 port with delay between 5 and 10 seconds for message delivered (deliver_sm) request and return status delivrd for incomming message, then answer expired, then delivrd agiain and so on. u1 (service_id) with password pass1 and u2 with password pass2 will be authorized on SMPP server.

[sudo] nodejs smpp.js --port=9999 --ddmin=5000 --ddmax=10000 --auth=u1:pass1,u2:pass2 --statuses=delivrd,expired
