"use strict";

var Cyprus = require('./cyprus.js');
var Poa = require('./poa.js');

var ClientLib = function ClientLib(web3Cyprus, web3Poa) {
    var cyprus_ = new Cyprus(web3Cyprus);
    var poa_ = new Poa(web3Poa);

    //cyprus export
    this.cyprus = cyprus_;

    //poa export
    this.poa = poa_;

    //balance
    this.GetBalance = async function (address) {
        var tag = 'latest'
        return await cyprus_.GetBalance(address, tag);
    };

    //transactionReceipt
    this.GetReceipt = async function (txid) {
        return await cyprus_.GetTransactionReceipt(txid);
    };

    //transactionHistory
    this.GetHistory = async function (address, isTxHash) {
        return await cyprus_.GetTransactionsByAddress(address, isTxHash);
    };

    //poa callback
    this.PoaCallback = function (callback) {
        poa_.InitCallback(callback);
    };

    //poa response call
    this.PoaResponse = function (uid, address, accessToken) {
        return poa_.Response(uid, address, accessToken);
    };
};

module.exports = ClientLib;