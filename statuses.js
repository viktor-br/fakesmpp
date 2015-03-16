/**
 * SMPP statuses supported in deliver_sm request of the fake SMPP to ESME.
 * see http://smpp.w2wts.com/SMPP_Developers.aspx
 */
function Statuses(list) {
    this.availabile_delivery_statuses = {
        'delivered': {stat: 'DELIVRD', err: "000"},
        'provider_failure': {stat: 'UNKNOWN', err: "02f"},
        'undelivered': {stat: 'UNDELIV',  err: "023"},
        'phone_not_exists': {stat: 'REJECTD', err: "035"},
        'billing_error': {stat: 'REJECTD', err: "038"},
        'spam_rejected': {stat: 'REJECTD', err: "039"},
        'flooding': {stat: 'REJECTD', err: "03a"},
        'blacklisted': {stat: 'REJECTD', err: "03c"},
        'retrying': {stat: 'ACCEPTD', err: "044"},
        'canceled': {stat: 'REJECTD', err: "052"},
        'expired': {stat: 'EXPIRED', err: "058"},
        'deleted_by_sender': {stat: 'DELETED', err: "05f"},
        'deleted_by_admin': {stat: 'DELETED', err: "060"},
        'invalid_format': {stat: 'REJECTD', err: "778"},
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
