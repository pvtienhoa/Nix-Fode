const notify = require('./notify.js');
const chalk = require('chalk');
const fs = require('fs');

function stats(fixentity, sessionID, message) {
  var sess = fixentity.getSession(sessionID);
  var ret = {
    sessionID: sessionID,
    senderSeqNum: sess.senderSeqNum,
    targetSeqNum: sess.targetSeqNum
  };
  if (message) {
    ret.message = message;
  }
  return ret;
}

function printStats(fixentity) {
  var sessions = fixentity.getSessions();
  var sessionId = sessions[0];
  var sess = fixentity.getSession(sessionId);
  console.log('senderSeqNum', sess.senderSeqNum, 'targetSeqNum', sess.targetSeqNum);
}

function loadOptions(path) {
  try {
    var rawData = fs.readFileSync(path);
    if (!rawData) throw 'Error reading config.json';
    const ret = JSON.parse(rawData);
    return ret;
  } catch (error) {
    notify.showError(error);
  };
}

function loadFixOptions(options) {
  var ret = {
    credentials: {
      username: options.FUserName,
      password: options.FPassword
    },
    ssl: false,
    settings: `[DEFAULT]\n
    ConnectionType=initiator\n
    FileStorePath=./support/data\n
    FileLogPath=./support/log\n
    BeginString=${options.FMsgType}\n
    UseDataDictionary=Y\n
    DataDictionary=${options.FDictPath}\n
    [SESSION]\n
    SocketConnectHost=${options.FHost}\n
    SocketConnectPort=${options.FPort}\n
    TargetCompID=${options.FTargetID}\n
    SenderCompID=${options.FSenderID}\n
    StartTime=00:00:00\n
    EndTime=23:59:59\n
    HeartBtInt=30\n
    ResetOnLogon=Y`
    //propertiesFile: path.join(__dirname, '/support/initiator.fiximulator.properties')
    // propertiesFile: path.join(__dirname, '/support/initiator.properties')
  };
  return ret;
}

const showError = (message) => {
  if (message) console.log(chalk.red.bold.inverse(message));
}

const showNotify = (message) => {
  if (message) console.log(chalk.green.bold.inverse(message));
}

module.exports = {
  stats,
  printStats,
  loadOptions,
  loadFixOptions,
  showError,
  showNotify
};
