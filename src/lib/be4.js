"use strict";

var Tx = require('./transaction').default;
var util = require('./util');

var Be4 = function Be4(web3) {

    // network id
    const MainNet = 0x00;

    web3.extend({
        property: 'be4',
        methods: [{
            name: 'getVersion',
            call: 'web4b_getVersion'
        },{
            name: 'getTime',
            call: 'web4b_getTime'
        },{
            name: 'sha3',
            call: 'web4b_sha3',
            params: 1
        },{
            name: 'coinbase',
            call: 'web4b_coinbase'
        },{
            name: 'mining',
            call: 'web4b_mining'
        },{
            name: 'blockNumber',
            call: 'be4_blockNumber'
        },{
            name: 'getBalance',
            call: 'be4_getBalance',
            params: 2
        },{
            name: 'getTransactionCount',
            call: 'be4_getTransactionCount',
            params: 2
        },{
            name: 'getBlockTransactionCountByHash',
            call: 'be4_getBlockTransactionCountByHash',
            params: 1
        },{
            name: 'getBlockTransactionCountByNumber',
            call: 'be4_getBlockTransactionCountByNumber',
            params: 1
        },{
            name: 'sendRawTransaction',
            call: 'be4_sendRawTransaction',
            params: 1
        },{
            name: 'getBlockByHash',
            call: 'be4_getBlockByHash',
            params: 2
        },{
            name: 'getBlockByNumber',
            call: 'be4_getBlockByNumber',
            params: 2
        },{
            name: 'getTransactionByHash',
            call: 'be4_getTransactionByHash',
            params: 1
        },{
            name: 'getTransactionsByAddress',
            call: 'be4_getTransactionsByAddress',
            params: 2
        },{
            name: 'getTransactionByBlockHashAndIndex',
            call: 'be4_getTransactionByBlockHashAndIndex',
            params: 2
        },{
            name: 'getTransactionByBlockNumberAndIndex',
            call: 'be4_getTransactionByBlockNumberAndIndex',
            params: 2
        },{
            name: 'getTransactionReceipt',
            call: 'be4_getTransactionReceipt',
            params: 1
        },{
            name: 'pendingTransactions',
            call: 'be4_pendingTransactions'
        }]
    });

    this.GetVersion = function () {
        return web3.be4.getVersion();
    };

    this.GetTime = function () {
        return web3.be4.getTime();
    };

    this.Sha3 = function (data) {
        return web3.be4.sha3(data);
    };

    this.Coinbase = function () {
        return web3.be4.coinbase();
    };

    this.Mining = function () {
        return web3.be4.mining();
    };

    this.BlockNumber = function () {
        return web3.be4.blockNumber();
    };

    this.GetBalance = function (address, tag) {
        return web3.be4.getBalance(address, tag);
    };

    this.GetTransactionCount = function (address, tag) {
        return web3.be4.getTransactionCount(address, tag);
    };

    this.GetTransactionByHash = function (txid) {
        return web3.be4.getTransactionByHash(txid);
    };

    this.GetTransactionByBlockNumberAndIndex = function (number, index) {
        return web3.be4.getTransactionByBlockNumberAndIndex(number, index);
    };

    this.GetTransactionByBlockHashAndIndex = function (hash, index) {
        return web3.be4.getTransactionByBlockHashAndIndex(hash, index);
    };

    this.SendRawTransaction = function (tx) {
        return web3.be4.sendRawTransaction(tx);
    };

    this.SendTransaction = async function (signer, to, value, gas, extra, nonce) {
        var tx = await this.CreateTransaction(signer, to, value, gas, extra, nonce);
        return await this.SendRawTransaction(tx);
    };

    this.CreateTransaction = async function (signer, to, value, gas, extra, nonce) {
        // var _timestamp = util.UnixTime();
        var _nonce = nonce;
        var _value = web3.utils.toHex(value*100000000);
        var _gas = web3.utils.toHex(gas);
        if(nonce === undefined){
            var fromAddress = util.privateToAddress(signer).toString('hex');
            _nonce = await this.GetTransactionCount('0x'+fromAddress, 'pending');
        }
        const privateKey = Buffer.from(signer.replace('0x',''), 'hex');

        if(extra !== undefined && extra !== ""){
            extra = util.MakeExtras(extra);
            console.log('extra:', extra);
        }
                
        const txParams = {
            chainId: MainNet,
            version: '0x00',
            to: to,
            value: _value,
            gas: _gas,
            nonce: _nonce,
            data: '',   
            extra: extra
        };
        const tx = new Tx(txParams);
        tx.sign(privateKey);
        const serializedTx = '0x' + tx.serialize().toString('hex');
        return serializedTx;
    };

    this.PendingTransaction = function () {
        return web3.be4.pendingTransactions();
    };

    this.GetTransactionReceipt = function (txid) {
        return web3.be4.getTransactionReceipt(txid);
    };

    this.GetBlockByNumber = function (number, type) {
        return web3.be4.getBlockByNumber(number, type);
    };

    this.GetBlockByHash = function (blockHash, type) {
        return web3.be4.getBlockByHash(blockHash, type);
    };

    this.GetBlockTransactionCountByHash = function (blockHash) {
        return web3.be4.getBlockTransactionCountByHash(blockHash);
    };

    this.GetBlockTransactionCountByNumber = function (blockNumber) {
        return web3.be4.getBlockTransactionCountByNumber(blockNumber);
    };

    this.GetTransactionsByAddress = function (address, isTxHash) {
        return web3.be4.getTransactionsByAddress(address, isTxHash);
    };
};

module.exports = Be4;