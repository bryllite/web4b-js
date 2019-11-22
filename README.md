# web4b-js
Bryllite JavaScript API

`web4b` is a set of `bryllite API` and `web4b-js` is web4b package for JS  
web4b supports http(s), WebSocket.  

web4b Endpoint API:
* [JsonRpc.Be4](https://github.com/bryllite/web4b-cs/wiki/JsonRpc.Be4)  
* [JsonRpc.Cyprus](https://github.com/bryllite/web4b-cs/wiki/JsonRpc.Cyprus)  

web4b-js:
* [web4b-js](https://github.com/bryllite/web4b-js)

web4b-js samples:
* [web4b-js-samples](https://github.com/bryllite/web4b-js-sample)


## Installation

### Node.js

```bash
npm install --save web4b
```

### In the Browser

Use the prebuild `dist/web4b.min.js`

~~~html
<script type="text/javascript" src="./web4b.min.js"></script>
~~~

Then include `dist/web4b.min.js` in your html file.
This will expose `Web4b` on the window object.

## Usage
### ServerLib
~~~js
// Create ApiService Instance
var Web3 = require('web3');
var Web4bServerLib = require("web4b").ServerLib;

var bridgeUrl = "ws://localhost:9627";
var gameKey = "{gameKey}";
var coinBoxAddress = "{coinBoxAddress}";    //coin retrieveAddress
var web3Cyprus = new Web3(new Web3.providers.WebsocketProvider(brylliteCyprusHost));
var web4bServerLib = new Web4bServerLib(web3Cyprus, gameKey, coinBoxAddress);

// getUserAddress
var userAddress = web4bServerLib.getUserAddress(uid);

// getUserPrivateKey
var signer = web4bServerLib.getUserPrivateKey(uid);

// getGameAddress
var gameServerAddress = web4bServerLib.getGameAddress();

// GetAccessToken
var accessToken = web4bServerLib.GetAccessToken(hash, iv, address);

// GetBalance
web4bServerLib.GetBalance(userAddress).then(console.log).catch(console.log);

// SendReward
web4bServerLib.SendReward(userAddress, value, extra).then(console.log).catch(console.log);

// SendBuy
web4bServerLib.SendBuy(signer, value, extra).then(console.log).catch(console.log);

// SendTransfer
web4bServerLib.SendTransfer(signer, to, value, extra).then(console.log).catch(console.log);

// SendPayout
web4bServerLib.SendPayout(signer, to, value, extra).then(console.log).catch(console.log);

// GetReceipt
web4bServerLib.GetReceipt(txid).then(console.log).catch(console.log);

// GetHistory
web4bServerLib.GetHistory(userAddress, isTxidOnly).then(console.log).catch(console.log);
~~~

<!-- #### GetBalance
#### SendReward
#### SendBuy
#### SendTransfer
#### SendPayout
#### GetReceipt
#### GetHistory
#### GetAccessToken
#### getUserAddress
#### getUserPrivateKey
#### getGameAddress -->

### ClientLib
~~~js
// create api instance
var Web3 = require('web3');
var Web4bClientLib = require("web4b").ClientLib;

var bridgeUrl = "ws://localhost:9627";  // bridge endpoint
var poaUrl = "ws://localhost:4742";     // poa endpoint

var web3Cyprus = new Web3(new Web3.providers.WebsocketProvider(bridgeUrl));
var web3Poa = new Web3(new Web3.providers.WebsocketProvider(poaUrl));  
web4bClientLib = new Web4bClientLib(web3Cyprus, web3Poa);

// PoaCallback
web4bClientLib.PoaCallback(this.onPoaRequest);

// GetBalance
web4bClientLib.GetBalance(userAddress).then(console.log).catch(console.log);

// GetReceipt
web4bClientLib.GetReceipt(txid).then(console.log).catch(console.log);

// GetHistory
web4bClientLib.GetHistory(userAddress, isTxidOnly).then(console.log).catch(console.log);

// PoaResponse
web4bClientLib.PoaResponse(userAddress, accessToken).then(console.log).catch(console.log);
~~~
<!-- #### GetBalance
#### GetReceipt
#### GetHistory
#### PoaCallback
#### PoaResponse -->
