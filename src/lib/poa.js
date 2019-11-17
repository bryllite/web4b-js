"use strict";

var Poa = function Poa(web3) {
    this.callback;

    web3.extend({
        property: 'poa',
        methods: [{
            name: 'response',
            call: 'poa_response',
            params: 2,
            inputFormatter: [null, null],
            outputFormatter: null
        }]
    });

    //poa_request_subscription call
    web3._provider.on('data', (eventObj) => {
        return this.callback(eventObj);
    });

    this.InitCallback = function (callback) {
        this.callback = callback;
    };

    this.Response = function (address, accessToken) {
        return web3.poa.response(address, accessToken);
    };
};

module.exports = Poa;