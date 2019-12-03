"use strict";

var createKeccakHash = require('keccak');
var secp256k1 = require('secp256k1');
var assert = require('assert');
var rlp = require("./rlp");

const ExtraOpCode = 0x90;
/**
 * Attempts to turn a value into a `Buffer`. As input it supports `Buffer`, `String`, `Number`, null/undefined, `BN` and other objects with a `toArray()` method.
 * @param v the value
 */
exports.toBuffer = function (v) {
    if (!Buffer.isBuffer(v)) {
        if (Array.isArray(v)) {
            v = Buffer.from(v);
        }
        else if (typeof v === 'string') {
            if (exports.isHexString(v)) {
                v = Buffer.from(exports.padToEven(exports.stripHexPrefix(v)), 'hex');
            }
            else {
                v = Buffer.from(v);
            }
        }
        else if (typeof v === 'number') {
            v = exports.intToBuffer(v);
        }
        else if (v === null || v === undefined) {
            v = Buffer.allocUnsafe(0);
        }
        // else if (BN.isBN(v)) {
        //     v = v.toArrayLike(Buffer);
        // }
        else if (v.toArray) {
            // converts a BN to a Buffer
            v = Buffer.from(v.toArray());
        }
        else {
            throw new Error('invalid type');
        }
    }
    return v;
};

/**
 * Creates Keccak hash of the input
 * @param a The input data (Buffer|Array|String|Number)
 * @param bits The Keccak width
 */
exports.keccak = function (a, bits) {
    if (bits === void 0) { bits = 256; }
    a = exports.toBuffer(a);
    if (!bits)
        bits = 256;
    return createKeccakHash("keccak" + bits)
        .update(a)
        .digest();
};

exports.CKD = function(key, seed) {
    var keyBuf = Buffer.from(exports.stripHexPrefix(key), 'hex');
    var keyHashBuf = exports.keccak(keyBuf);
    var seedBuf = Buffer.from(seed);

    const totalLength = keyBuf.length + keyHashBuf.length + seedBuf.length;
    var newBuffer = Buffer.concat([keyBuf, keyHashBuf, seedBuf], totalLength);
    var outerHex = exports.keccak(newBuffer, 512);

    return {
        address: '0x' + exports.privateToAddress(outerHex.slice(0, 32)).toString('hex'),
        privateKey: '0x' + outerHex.slice(0, 32).toString('hex')
    };
};

/**
 * Creates SHA-3 hash of the RLP encoded version of the input.
 * @param a The input data
 */
exports.rlpHash = function (a) {
    return exports.keccak(rlp.encode(a));
};

exports.rlpEncode = function (a) {
    return rlp.encode(a);
};

exports.MakeExtras = function (a) {
    var arr = [ExtraOpCode, a];
    return rlp.encodeExtra(arr);
};

/**
 * Returns the ECDSA signature of a message hash.
 */
exports.ecsign = function (msgHash, privateKey) {    
    var sig = secp256k1.sign(msgHash, privateKey);
    var recovery = sig.recovery;
    var ret = {
        r: sig.signature.slice(0, 32),
        s: sig.signature.slice(32, 64),
        v: recovery
    };
    return ret;
};

exports.ecsignHex = function (msgHash, privateKey) {    
    var ret = exports.ecsign(msgHash, privateKey);

    let rBuf = Buffer.from(ret.r); //r
    let sBuf = Buffer.from(ret.s); //s
    var v = ret.v.toString(16);
    v = v.length % 2 ? "0" + v : v;
    var vBuf =  Buffer.from(v, 'hex'); //v

    const totalLength = rBuf.length + sBuf.length + vBuf.length;
    let newBuffer = Buffer.concat([rBuf.reverse(), sBuf.reverse(), vBuf.reverse()], totalLength);

    return newBuffer;
};

/**
 * Returns the ethereum address of a given private key.
 * @param privateKey A private key must be 256 bits wide
 */
exports.privateToAddress = function (privateKey) {
    return exports.publicToAddress(exports.privateToPublic(privateKey));
};

/**
 * Returns the ethereum address of a given public key.
 * Accepts "Ethereum public keys" and SEC1 encoded keys.
 * @param pubKey The two points of an uncompressed key, unless sanitize is enabled
 * @param sanitize Accept public keys in other formats
 */
exports.publicToAddress = function (pubKey, sanitize) {
    if (sanitize === void 0) { sanitize = false; }
    pubKey = exports.toBuffer(pubKey);
    if (sanitize && pubKey.length !== 64) {
        pubKey = secp256k1.publicKeyConvert(pubKey, false).slice(1);
    }
    assert(pubKey.length === 64);
    // Only take the lower 160bits of the hash
    return exports.keccak(pubKey).slice(-20);
};

/**
 * Returns the ethereum public key of a given private key.
 * @param privateKey A private key must be 256 bits wide
 */
exports.privateToPublic = function (privateKey) {
    privateKey = exports.toBuffer(privateKey);
    // skip the type flag and use the X, Y points
    return secp256k1.publicKeyCreate(privateKey, false).slice(1);
};

/**
 * Converts a `Buffer` or `Array` to JSON.
 * @param ba (Buffer|Array)
 * @return (Array|String|null)
 */
exports.baToJSON = function (ba) {
    if (Buffer.isBuffer(ba)) {
        return "0x" + ba.toString('hex');
    }
    else if (ba instanceof Array) {
        var array = [];
        for (var i = 0; i < ba.length; i++) {
            array.push(exports.baToJSON(ba[i]));
        }
        return array;
    }
};
/**
 * Defines properties on a `Object`. It make the assumption that underlying data is binary.
 * @param self the `Object` to define properties on
 * @param fields an array fields to define. Fields can contain:
 * * `name` - the name of the properties
 * * `length` - the number of bytes the field can have
 * * `allowLess` - if the field can be less than the length
 * * `allowEmpty`
 * @param data data to be validated against the definitions
 */
exports.defineProperties = function (self, fields, data) {
    self.raw = [];
    self._fields = [];
    self.toJSON = function (label) {
        if (label === void 0) { label = false; }
        if (label) {
            var obj_1 = {};
            self._fields.forEach(function (field) {
                obj_1[field] = "0x" + self[field].toString('hex');
            });
            return obj_1;
        }
        return exports.baToJSON(self.raw);
    };
    fields.forEach(function (field, i) {
        self._fields.push(field.name);
        function getter() {
            return self.raw[i];
        }
        function setter(v) {
            v = exports.toBuffer(v);
            if (v.toString('hex') === '00' && !field.allowZero) {
                v = Buffer.allocUnsafe(0);
            }
            if (field.allowLess && field.length) {
                // v = exports.stripZeros(v);
                assert(field.length >= v.length, "The field " + field.name + " must not have more " + field.length + " bytes");
            }
            else if (!(field.allowZero && v.length === 0) && field.length) {
                assert(field.length === v.length, "The field " + field.name + " must have byte length of " + field.length);
            }
            self.raw[i] = v;
        }
        Object.defineProperty(self, field.name, {
            enumerable: true,
            configurable: true,
            get: getter,
            set: setter,
        });
        if (field.default) {
            self[field.name] = field.default;
        }
        if (field.alias) {
            Object.defineProperty(self, field.alias, {
                enumerable: false,
                configurable: true,
                set: setter,
                get: getter,
            });
        }
    });

    if (data) {
        if (typeof data === 'string') {
            data = Buffer.from(exports.stripHexPrefix(data), 'hex');
        }
        if (Buffer.isBuffer(data)) {
            data = rlp.decode(data);
        }
        if (Array.isArray(data)) {
            if (data.length > self._fields.length) {
                throw new Error('wrong number of fields in data');
            }
            data.forEach(function (d, i) {
                self[self._fields[i]] = exports.toBuffer(d);
            });
        }
        else if (typeof data === 'object') {
            var keys_1 = Object.keys(data);
            fields.forEach(function (field) {
                if (keys_1.indexOf(field.name) !== -1)
                    self[field.name] = data[field.name];
                if (keys_1.indexOf(field.alias) !== -1)
                    self[field.alias] = data[field.alias];
            });
        }
        else {
            throw new Error('invalid data');
        }
    }
};

exports.stripHexPrefix = function (str) {
    if (typeof str !== 'string') {
        return str;
      }
    
      return exports.isHexPrefixed(str) ? str.slice(2) : str;
};

exports.isHexPrefixed = function (str) {
    if (typeof str !== 'string') {
        throw new Error("[is-hex-prefixed] value must be type 'string', is currently type " + (typeof str) + ", while checking isHexPrefixed.");
      }
    
      return str.slice(0, 2) === '0x';
};

exports.isHexString = function (value, length) {
    if (typeof value !== 'string' || !value.match(/^0x[0-9A-Fa-f]*$/)) {
    return false;
    }

    if (length && value.length !== 2 + 2 * length) {
    return false;
    }

    return true;
};

exports.padToEven = function (value) {
    var a = value; // eslint-disable-line

    if (typeof a !== 'string') {
        throw new Error('[ethjs-util] while padding to even, value must be string, is currently ' + typeof a + ', while padToEven.');
    }

    if (a.length % 2) {
        a = '0' + a;
    }

    return a;
};

exports.intToBuffer = function (i) {
    var hex = exports.intToHex(i);
    return new Buffer(exports.padToEven(hex.slice(2)), 'hex');
}

exports.intToHex = function (i) {
    var hex = i.toString(16); // eslint-disable-line  
    return '0x' + hex;
}

exports.UnixTime = function (date) {
    date = date === undefined ? new Date() :  new Date(date);
    return Math.floor(date.getTime() / 1000);
}