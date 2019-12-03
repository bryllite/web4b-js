"use strict";

var buffer_1 = require("buffer");
var util = require("./util");

var Transaction = (function () {

    function Transaction(data) {
        if (data === void 0) { data = {}; }
        // Define Properties
        var fields = [
            {
                name: 'chainId',
                length: 1,
                allowLess: true,
                default: new buffer_1.Buffer([])
            },
            {
                name: 'version',
                length: 1,
                allowLess: true,
                default: new buffer_1.Buffer([])
            },
            {
                name: 'to',
                length: 24,
                allowLess: true,
                default: new buffer_1.Buffer([])
            },
            {
                name: 'value',
                length: 32,
                allowLess: true,
                allowZero: true,
                default: new buffer_1.Buffer([])
            },
            {
                name: 'gas',
                length: 32,
                allowLess: true,
                allowZero: true,
                default: new buffer_1.Buffer([])
            },
            {
                name: 'nonce',
                length: 32,
                allowLess: true,
                allowZero: true,
                default: new buffer_1.Buffer([])
            },
            {
                name: 'data',
                alias: 'input',
                allowZero: true,
                allowLess: true,
                default: new buffer_1.Buffer([])
            },
            {
                name: 'extra',
                alias: 'input',
                allowZero: true,
                allowLess: true,
                default: new buffer_1.Buffer([])
            },
            {
                name: 'r',
                length: 32,
                allowZero: true,
                allowLess: true,
                default: new buffer_1.Buffer([])
            },
            {
                name: 's',
                length: 32,
                allowZero: true,
                allowLess: true,
                default: new buffer_1.Buffer([])
            },
            {
                name: 'v',
                length: 8,
                allowZero: true,
                allowLess: true,
                default: new buffer_1.Buffer([])
            }
        ];
        // attached serialize
        util.defineProperties(this, fields, data);
    }

    /**
     * Computes a sha3-256 hash of the serialized tx
     * @param includeSignature - Whether or not to include the signature
     */
    Transaction.prototype.hash = function () {
        var items = this.raw.slice(0, 8);
        // create hash
        return util.rlpHash(items);
    };

    /**
     * sign a transaction with a given private key
     * @param privateKey - Must be 32 bytes in length
     */
    Transaction.prototype.sign = function (privateKey) {
        // We clear any previous signature before signing it. Otherwise, _implementsEIP155's can give
        // different results if this tx was already signed.
        this.v = new buffer_1.Buffer([]);
        this.s = new buffer_1.Buffer([]);
        this.r = new buffer_1.Buffer([]);
        var msgHash = this.hash(false);
        var sig = util.ecsign(msgHash, privateKey);
        Object.assign(this, sig);
    };

    /**
     * Returns the rlp encoding of the transaction
     */
    Transaction.prototype.serialize = function () {
        // Note: This never gets executed, defineProperties overwrites it.
        return util.rlpEncode(this.raw);
    };
    Transaction.prototype.toJSON = function (labels) {
        if (labels === void 0) { labels = false; }
        // Note: This never gets executed, defineProperties overwrites it.
        return {};
    };
    
    return Transaction;
}());
exports.default = Transaction;