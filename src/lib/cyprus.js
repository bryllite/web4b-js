"use strict";

var Tx = require('./transaction').default;
var util = require('./util');

var Cyprus = function Cyprus(web3) {
    
    const TransactionType = {
        Transfer: 0x80,
        Withdraw: 0x81,
        Deposit: 0x82
    }

    web3.extend({
        property: 'cyprus',
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
            call: 'cyprus_blockNumber'
        },{
            name: 'getBalance',
            call: 'cyprus_getBalance',
            params: 2
        },{
            name: 'getBalanceByUid',
            call: 'cyprus_getBalanceByUid',
            params: 2
        },{
            name: 'getTransactionCount',
            call: 'cyprus_getTransactionCount',
            params: 2
        },{
            name: 'getTransactionCountByUid',
            call: 'cyprus_getTransactionCountByUid',
            params: 2
        },{
            name: 'getBlockTransactionCountByHash',
            call: 'cyprus_getBlockTransactionCountByHash',
            params: 1
        },{
            name: 'getBlockTransactionCountByNumber',
            call: 'cyprus_getBlockTransactionCountByNumber',
            params: 1
        },{
            name: 'sendRawTransaction',
            call: 'cyprus_sendRawTransaction',
            params: 1
        },{
            name: 'getBlockByHash',
            call: 'cyprus_getBlockByHash',
            params: 2
        },{
            name: 'getBlockByNumber',
            call: 'cyprus_getBlockByNumber',
            params: 2
        },{
            name: 'getTransactionByHash',
            call: 'cyprus_getTransactionByHash',
            params: 1
        },{
            name: 'getTransactionsByAddress',
            call: 'cyprus_getTransactionsByAddress',
            params: 2
        },{
            name: 'getTransactionsByUid',
            call: 'cyprus_getTransactionsByUid',
            params: 2
        },{
            name: 'getTransactionByBlockNumberAndIndex',
            call: 'cyprus_getTransactionByBlockNumberAndIndex',
            params: 2
        },{
            name: 'getTransactionByBlockHashAndIndex',
            call: 'cyprus_getTransactionByBlockHashAndIndex',
            params: 2
        },{
            name: 'getTransactionReceipt',
            call: 'cyprus_getTransactionReceipt',
            params: 1
        },{
            name: 'pendingTransactions',
            call: 'cyprus_pendingTransactions'
        },{
            name: 'getPoATokenSeed',
            call: 'cyprus_getPoATokenSeed',
            params: 2
        }]
    });

    this.GetVersion = function () {
        return web3.cyprus.getVersion();
    };

    this.GetTime = function () {
        return web3.cyprus.getTime();
    };

    this.Sha3 = function (data) {
        return web3.cyprus.sha3(data);
    };

    this.Coinbase = function () {
        return web3.cyprus.coinbase();
    };

    this.Mining = function () {
        return web3.cyprus.mining();
    };

    this.BlockNumber = function () {
        return web3.cyprus.blockNumber();
    };

    this.GetBalance = function (address, tag) {
        return web3.cyprus.getBalance(address, tag);
    };

    this.GetBalanceByUid = function (uid, tag) {
        return web3.cyprus.getBalanceByUid(uid, tag);
    };

    this.GetTransactionCount = function (address, tag) {
        return web3.cyprus.getTransactionCount(address, tag);
    };

    this.GetTransactionCountByUid = function (uid, tag) {
        return web3.cyprus.getTransactionCountByUid(uid, tag);
    };

    this.GetTransactionByHash = function (txid) {
        return web3.cyprus.getTransactionByHash(txid);
    };

    this.GetTransactionByBlockNumberAndIndex = function (number, index) {
        return web3.cyprus.getTransactionByBlockNumberAndIndex(number, index);
    };

    this.GetTransactionByBlockHashAndIndex = function (hash, index) {
        return web3.cyprus.getTransactionByBlockHashAndIndex(hash, index);
    };

    this.SendRawTransaction = function (tx) {
        return web3.cyprus.sendRawTransaction(tx);
    };

    this.SendTransfer = async function (signer, to, value, gas, extra, nonce) {
        var tx = await this.CreateTransaction(signer, to, value, gas, TransactionType.Transfer, extra, nonce);
        return await this.SendRawTransaction(tx);
    };

    this.SendPayout = async function (signer, to, value, gas, extra, nonce) {
        var tx = await this.CreateTransaction(signer, to, value, gas, TransactionType.Withdraw, extra, nonce);
        return await this.SendRawTransaction(tx);
    };

    this.CreateTransaction = async function (signer, to, value, gas, transactionType, extra, nonce) {
        var _nonce = nonce;
        var _value = web3.utils.toHex(value*100000000);
        var _gas = web3.utils.toHex(gas);
        if(nonce === undefined){
            var fromAddress = util.privateToAddress(signer).toString('hex');
            var rtnNonce = await this.GetTransactionCount('0x'+fromAddress, 'pending');
            _nonce = rtnNonce[0];
        }
        const privateKey = Buffer.from(signer.replace('0x',''), 'hex');

        if(extra !== undefined && extra !== ""){
            extra = util.MakeExtras(extra);
        }

        const txParams = {
            chainId: transactionType,
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
        return web3.cyprus.pendingTransactions();
    };

    this.GetTransactionReceipt = function (txid) {
        return web3.cyprus.getTransactionReceipt(txid);
    };

    this.GetBlockByNumber = function (number, type) {
        return web3.cyprus.getBlockByNumber(number, type);
    };

    this.GetBlockByHash = function (blockHash, type) {
        return web3.cyprus.getBlockByHash(blockHash, type);
    };

    this.GetBlockTransactionCountByHash = function (blockHash) {
        return web3.cyprus.getBlockTransactionCountByHash(blockHash);
    };

    this.GetBlockTransactionCountByNumber = function (blockNumber) {
        return web3.cyprus.getBlockTransactionCountByNumber(blockNumber);
    };

    this.GetTransactionsByAddress = function (address, isTxHash) {
        return web3.cyprus.getTransactionsByAddress(address, isTxHash);
    };

    this.GetTransactionsByUid = function (uid, isTxHash) {
        return web3.cyprus.getTransactionsByUid(uid, isTxHash);
    };

    this.GetPoATokenSeed = function (timestamp, signature) {
        return web3.cyprus.getPoATokenSeed(timestamp, signature);
    };    
};

module.exports = Cyprus;