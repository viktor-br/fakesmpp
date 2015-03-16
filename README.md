fakesmpp
========

Simple fake SMPP server based on node.js smpp package (https://www.npmjs.com/package/smpp). By default server listen port 2775. It able to authorize
ESME (by default system_id=user and password=pass, but you can use --auth option to set up your own parameters). By default server request ESME with deliver_sm 
(message delivered) successed just after submit_sm request from ESME, but you can manage time delay and statuses of the answer.

Required node packages:

- smpp -- SMPP realisation 
- winston -- logging
- strftime -- date format
- optimistic -- command options

##Install

```bash
git clone https://github.com/viktor-br/fakesmpp.git
cd [folder with fakesmpp code]
npm install smpp winston strftime optimist
```

##Usage
1. Listen 2775 port and always answer Ok status (DELIVRD) and authorize user (service_id) with pass password
```bash
[sudo] node smpp.js
```
2. Listen 9999 port with delay between 5 and 10 seconds for message delivered (deliver_sm) request to ESME and return iterated one by one statuses (delivered, then status expired, then delivered again and so on). u1 (service_id) with password pass1 and u2 with password pass2 will be authorized on SMPP server.
You can find available status values list in statuses.js.
```bash
[sudo] node smpp.js --port=2775 --ddmin=5000 --ddmax=10000 --auth=user:pass,u1:pass1,u2:pass2 --statuses=delivered,expired,spam_rejected
```