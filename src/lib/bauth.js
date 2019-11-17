"use strict";

var util = require("./util");

var BAuth = function BAuth(seed, iv) {
  var seed_ = seed !== undefined ? Buffer.from(seed.slice(2), 'hex') : undefined;
  var iv_ = iv !== undefined ? Buffer.from(iv.slice(2), 'hex') : undefined;

  var TIME_BYTES = 4;
  var TOKEN_BYTES = 12;
  var CHECKSUM_BYTES = 4;
  var ACCESS_TOKEN_BYTES = TIME_BYTES +TOKEN_BYTES + CHECKSUM_BYTES;

  this.seedCode = function () {
    return iv_ === undefined ?  this.Hash256(seed_) : this.Hash256(Buffer.concat([seed_, iv_], seed_.length+iv_.length));
  }

  this.GetAccessToken = function (salt, time) {
    var time_ = time === undefined ? Buffer.from(this.UnixTime().toString(16), 'hex') : Buffer.from(this.stripHexPrefix(time), 'hex');
    var token = this.CreateToken(time_, salt);

    // token body : time + token
    var tokenBody = Buffer.concat([time_, token], time_.length+token.length);

    // add check sum : time + token + checksum
    var checksum = this.Hash256(tokenBody).slice(0, CHECKSUM_BYTES);
    var accessToken = Buffer.concat([tokenBody, checksum], tokenBody.length + checksum.length);

    return accessToken;
  };

  this.Verify = function (accessToken, salt, expire) {
    var accessToken_ = Buffer.from(accessToken, 'base64');

    // token length check
    if (accessToken_ === undefined || accessToken_.length != ACCESS_TOKEN_BYTES)
    {
      console.log('invalid token length!');
      return false;
    }

    // time factor
    var time = this.GetTime(accessToken_);
    var token = this.GetToken(accessToken_);
    var checksum = this.GetChecksum(accessToken_);
    var checksumHash = this.Hash256(Buffer.concat([time, token], time.length+token.length)).slice(0, CHECKSUM_BYTES);

    // checksum check
    if(Buffer.compare(checksum, checksumHash) !== 0){
      console.log('invalid token checksum!');
      return false;
    }

    // token expire check
    var timeDiff = this.UnixTime() - time.readUInt32BE(0).toString();
    if (expire > 0 && Math.abs(timeDiff) > expire)
    {
        console.log('token expired!');
        return false;
    }

    // token check
    return Buffer.compare(token, this.CreateToken(time, salt)) === 0 ? true : false;
  };

  this.CreateToken = function (time, salt) {
    var time_ = Buffer.from(this.stripHexPrefix(time), 'hex');
    var salt_ = Buffer.from(this.stripHexPrefix(salt), 'hex');
    
    var tokenBase = Buffer.concat([time_, salt_], time_.length+salt_.length);
    var seedCode = this.seedCode();
    var seedCodeHash = this.Hash256(Buffer.concat([seedCode, tokenBase], seedCode.length+ tokenBase.length));

    return seedCodeHash.slice(0, TOKEN_BYTES);
  };

  this.GetTime = function (accessToken) {
    var accessToken_ = Buffer.from(this.stripHexPrefix(accessToken), 'hex');
    return accessToken_.slice(0, TIME_BYTES);
  };

  this.GetToken = function (accessToken) {
    var accessToken_ = Buffer.from(this.stripHexPrefix(accessToken), 'hex');
    return accessToken_.slice(TIME_BYTES, TIME_BYTES+TOKEN_BYTES);
  };

  // get checksum from access token
  this.GetChecksum = function (accessToken) {
    var accessToken_ = Buffer.from(this.stripHexPrefix(accessToken), 'hex');
    return accessToken_.slice(TIME_BYTES + TOKEN_BYTES, TIME_BYTES + TOKEN_BYTES + CHECKSUM_BYTES);
  };

  this.Hash256 = function (a) {
    return util.keccak(a, 256);
  }

  this.UnixTime = function (date) {
    date = date === undefined ? new Date() :  new Date(date);
    return Math.floor(date.getTime() / 1000);
  }

  this.stripHexPrefix = function (str) {
    return str.slice(0, 2) === '0x' ? str.slice(2) : str
  }
};

module.exports = BAuth;