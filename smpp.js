/**
 * Fake SMPP.
 */
var smpp = require('smpp');
var winston = require('winston');
var strftime = require('strftime');
var optimist = require('optimist');
var argv = optimist
    .options('port', {alias: 'p', default: 2775, describe: 'Port which server listen to.'})
    .options('ddmin', {default: 0, describe: 'Minimum delay after submit_sm requested and deliver_sm request to ESME.'}) // delivery min delay
    .options('ddmax', {default: 0, describe: 'Maximum delay after submit_sm requested and deliver_sm request to ESME.'}) // delivery max delay
    .options('statuses', {alias: 's', default: 'delivered', describe: "Comma separated list of statuses, server send in deliver_sm request to ESME."})
    .options('auth', {default: 'user:pass', describe: 'Comma separated auth credentials in format [system_id]:[password]'})
    .options('help', {default: false, alias: 'h', describe: 'Current help.'})
    .argv;

if (argv.help) {
    optimist.showHelp();
    return;
}

var Statuses = require('./statuses').Statuses;
// Read auth data
var auth_data = function(str) {
    var auth = {};
    str.split(",").map(function(str) {
        var l = str.split(":");
        if (l.length > 0 && l[0] != '') {
            var val = "";
            var key = l[0];
            if (l.length > 1) {
                val = l[1];
            }
            auth[key] = val;
        }
    });
    return auth;
}(argv.auth);
// Init logger
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({ json: false, timestamp: true })
    ]});

// List of statuses which we iterate in response.
var statuses = new Statuses(argv.statuses.split(','));//.map(function (val) {return val.toUpperCase()}));

// Validate options
if (argv.ddmax < argv.ddmin) {
    logger.error("ddmin(%d) > ddmax(%d)", argv.ddmin, arg.ddmax);
}

var server = smpp.createServer(function(session) {
    session.on('bind_transceiver', function(pdu) {
        logger.info("bind_transceiver requested.", {system_id: pdu.system_id});
        session.on('submit_sm', function(pdu) {
            var msg_received_on = new Date();
            var r = Math.floor(Math.random() * (99 - 10) + 10);
            var msg_id = ""+msg_received_on.getTime() + "." + r;
            var delivery_delay = getDeliveryDelay(argv.ddmin, argv.ddmax);
            logger.info("Msg was received, id=%s assigned.", msg_id, {From: pdu.source_addr, To: pdu.destination_addr, Msg: pdu.short_message.message.toString(), ScheduleDeliveryTime: pdu.schedule_delivery_time});
            
            logger.info("Send submit_sm_resp for id=%s.", msg_id);
            session.send(pdu.response({
                message_id: msg_id,
            }));

            // Send request to ESME to confirm delivery
            setTimeout(function() {
                var status = statuses.next();
                var dr = getDeliveryReceipt(msg_id, status, msg_received_on, new Date(), pdu.short_message.message.toString());
                logger.info("delivery_sm.short_message=%s", dr);
                logger.info("Send deliver_sm for id=%d with status.stat=%s, status.err=%s.", msg_id, status.stat, status.err);
                session.deliver_sm({
                    source_addr: pdu.source_addr,
                    source_addr_ton: pdu.source_addr_ton,
                    source_addr_npi: pdu.source_addr_npi,
                    dest_addr_ton: pdu.dest_addr_ton,
                    dest_addr_npi: pdu.dest_addr_npi,
                    destination_addr: pdu.destination_addr,
                    short_message: dr,
                    esm_class: smpp.ESM_CLASS.MC_DELIVERY_RECEIPT,
                    sequence_number: pdu.sequence_number,
                }, function(pdu) {
                    logger.info("deliver_sm_resp received.");
                });
            }, delivery_delay);
        });

        // Availability check
        session.on('enquire_link', function(pdu) {
            session.send(pdu.response());
        });   
        session.on('unbind', function(pdu) {
            session.send(pdu.response());
            session.close();
        });
        // we pause the session to prevent further incoming pdu events,
        // untill we authorize the session with some async operation.
        session.pause();
        checkAsyncUserPass(pdu.system_id, pdu.password, function(err) {
            if (err) {
                logger.error("bind_transceiver failed. Incorrert credentials.");
                session.send(pdu.response({
                    command_status: smpp.ESME_RBINDFAIL
                }));
                session.close();
                return;
            }
            session.send(pdu.response());
            logger.info("bind_transceiver completed successfully.", {system_id: pdu.system_id});
            session.resume();
        });
    });
});
server.listen(argv.port);
logger.info("Server listen port #%d", argv.port);

//
// Check if system_id with password has access to send messages.
//
function checkAsyncUserPass(system_id, password, func) {
    if (system_id in auth_data && auth_data[system_id] == password) {
        func(false);
    } else {
        func(true);
    }
}

//
// Return random delay for delivery_sm answer
//
function getDeliveryDelay(min, max) {
    if (min == max) {
        return min;
    }

    return Math.random() * (max - min) + min;
}

//
// Return SMPP protocol formatted delivery_receipt.
//
function getDeliveryReceipt(msg_id, status, received_on, done_on, message) {
    var receipt = {
        id: msg_id, 
        sub: "001", // not used in fact
        dlvrd: 1, // not used in fact
        "submit date": strftime("%y%m%d%H%M", received_on), 
        "done date": strftime("%y%m%d%H%M", done_on), 
        stat: status.stat, 
        err: status.err,
        text: message.substring(0, 20) // first 20 symbols of the message
    };
    var delivery_receipt_a = [];
    for (var k in receipt) {
        delivery_receipt_a.push(k + ":" + receipt[k]);
    }

    return delivery_receipt_a.join(" ")
}

