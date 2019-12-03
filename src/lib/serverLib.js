"use strict";

var Cyprus = require('./cyprus');
var BAuth = require("./bauth");
var util = require("./util");

var ServerLib = function ServerLib(web3, key, rAddress) {

    var gameKey = key;
    var retrieveAddress = rAddress;
    var seed;
    var seedTimestamp = 0;
    var seedRefreshSec = 30;

    var cyprus_ = new Cyprus(web3);

    //cyprus export
    this.cyprus = cyprus_;

    //SetGameKey
    this.SetGameKey = function (key) {
        gameKey = key;
    }

    //SetRetrieveAddress
    this.SetRetrieveAddress = function (address) {
        retrieveAddress = address;
    }

    //balance
    this.GetBalance = async function (address) {
        var tag = 'latest'
        return await cyprus_.GetBalance(address, tag);
    };
    
    //reward
    this.SendReward = async function (to, value, extra) {
        var signer = this.getGamePrivateKey();
        var gas = 0;
        return await cyprus_.SendTransfer(signer, to, value, gas, extra);
    };

    //buy
    this.SendBuy = async function (signer, value, extra) {
        var to = retrieveAddress;
        var gas = 0;
        return await cyprus_.SendTransfer(signer, to, value, gas, extra);
    };

    //transfer
    this.SendTransfer = async function (signer, to, value, extra) {
        var gas = 0;
        return await cyprus_.SendTransfer(signer, to, value, gas, extra);
    };

    //payout
    this.SendPayout = async function (signer, to, value, gas, extra) {
        var gas = 0;
        return await cyprus_.SendPayout(signer, to, value, gas, extra);
    };

    //transactionrReceipt
    this.GetReceipt = async function (txid) {
        return await cyprus_.GetTransactionReceipt(txid);
    };
    
    //transactionHistory
    this.GetHistory = async function (address, isTxHash) {
        return await cyprus_.GetTransactionsByAddress(address, isTxHash);
    };

    //accessToken
    this.GetAccessToken = async function (hash, iv, address) {
        // salt create
        var hasBuf = Buffer.from(hash.slice(2), 'hex');
        var ivBuf =  Buffer.from(iv.slice(2), 'hex');
        var addressBuf = Buffer.from(address.slice(2), 'hex');
        var salt = Buffer.concat([hasBuf, ivBuf, addressBuf], hasBuf.length + ivBuf.length + addressBuf.length);

        //update poa token seed (per 30sec)
        var timestamp = util.UnixTime();        
        if(seed == undefined || timestamp > seedTimestamp + seedRefreshSec){
            var hxTimestamp = Buffer.from(timestamp.toString(16), 'hex');
            var timestampHash = util.keccak(hxTimestamp, 256);
            var privateKey = Buffer.from(gameKey.replace('0x',''), 'hex');
            var signature = util.ecsignHex(timestampHash, privateKey);
            var serialized = '0x' + signature.toString('hex');
            var rtn = await cyprus_.GetPoATokenSeed('0x' + timestamp.toString(16), serialized);
            seed = rtn[0];
            seedTimestamp = timestamp;
        }

        // accessToken create
        var bAuth = new BAuth(seed);
        var accessToken = bAuth.GetAccessToken(salt).toString('base64');

        return accessToken;
    };

    //userAddress
    this.getUserAddress = function (uid) {
        return util.CKD(gameKey, uid).address;
    };

    //userPrivateKey
    this.getUserPrivateKey = function (uid) {
        return util.CKD(gameKey, uid).privateKey;
    };
    
    //gameAddress
    this.getGameAddress = function () {
        return '0x' + util.privateToAddress(gameKey.slice(2, 34)).toString('hex');
    };

    //gamePrivateKey
    this.getGamePrivateKey = function () {
        return gameKey;
    };

    this.GetPoATokenSeed = async function () {
        return await cyprus_.GetPoATokenSeed(timestamp, signature);
    };

};

module.exports = ServerLib;