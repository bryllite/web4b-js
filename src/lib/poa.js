"use strict";

var Poa = function Poa(web3) {
    this.callback;

    web3.extend({
        property: 'poa',
        methods: [{
            name: 'response',
            call: 'poa_response',
            params: 3,
            inputFormatter: [null, null, null]
        }]
    });

    //poa_request_subscription call
    web3._provider.on('data', (eventObj) => {
        return this.callback(eventObj);
    });

    this.InitCallback = function (callback) {
        this.callback = callback;
    };

    this.Response = function (uid, address, accessToken) {
        return web3.poa.response(uid, address, accessToken);
    };
};

module.exports = Poa;