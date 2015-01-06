/**
 * SMPP statuses supported in response of the fake SMPP.
 */
function Statuses(list) {
    this.availabile_delivery_statuses = ['DELIVRD', 'EXPIRED', 'UNDELIV', 'UNKNOWN', 'REJECTD'];
    this.items = [];
    for(var i in list) {
        if (this.availabile_delivery_statuses.indexOf(list[i]) >= 0) {
            this.items.push(list[i].toUpperCase());
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

    return this.items[this.i];
}

exports.Statuses = Statuses;
