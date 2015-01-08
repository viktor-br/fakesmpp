/**
 * SMPP statuses supported in deliver_sm request of the fake SMPP to ESME.
 */
function Statuses(list) {
    this.availabile_delivery_statuses = {
        'delivered': {stat: 'DELIVRD', err: "000"},
        'expired': {stat: 'EXPIRED', err: "000"},
        'deleted': {stat: 'DELETED', err: "000"},
        'undelivered': {stat: 'UNDELIV',  err: "000"},
        'rejected': {stat: 'REJECTD', err: "001"},
        'billing_error': {stat: 'REJECTD', err: "002"},
        'blacklisted': {stat: 'REJECTD', err: "003"},
        'unknown': {stat: 'UNKNOWN', err: "000"},
    };
    this.items = [];
    for(var i in list) {
        if (list[i] in this.availabile_delivery_statuses) {
            this.items.push(list[i]);
        }
    }
    if (this.items.length == 0) {
        throw 'Empty statuses list.';
    }
    this.i = -1;
}
Statuses.prototype.next = function() {
    this.i++;
    if (this.i >= this.items.length) {
        this.i = 0;
    }
    return this.availabile_delivery_statuses[this.items[this.i]];
}

exports.Statuses = Statuses;
