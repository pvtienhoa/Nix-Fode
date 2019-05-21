const notify = require('./support/notify.js');
var quickfix = require('node-quickfix');
var path = require('path');
var events = require('events');
var common = require('./support/common.js');
var initiator = quickfix.initiator;
//var df = require('dateformat');

var options = {
    credentials: {
        // username: "D103289979",
        // password: "5020"
    },
    ssl: false,
    // propertiesFile: path.join(__dirname, '/support/initiator.fxcm.properties')
    //propertiesFile: path.join(__dirname, '/support/initiator.fiximulator.properties')
    propertiesFile: path.join(__dirname, '/support/initiator.properties')
};

// extend prototype
function inherits(target, source) {
    for (var k in source.prototype)
        target.prototype[k] = source.prototype[k];
}

inherits(initiator, events.EventEmitter);

var fixClient = new initiator(
    {
        onCreate: function (sessionID) {
            fixClient.emit('onCreate', common.stats(fixClient, sessionID));
        },
        onLogon: function (sessionID) {
            fixClient.emit('onLogon', common.stats(fixClient, sessionID));
        },
        onLogout: function (sessionID) {
            fixClient.emit('onLogout', common.stats(fixClient, sessionID));
        },
        onLogonAttempt: function (message, sessionID) {
            fixClient.emit('onLogonAttempt', common.stats(fixClient, sessionID, message));
        },
        toAdmin: function (message, sessionID) {
            //message.header['57'] = 'somesubid';
            //console.log(message.tags[56]);
            fixClient.emit('toAdmin', common.stats(fixClient, sessionID, message));
        },
        fromAdmin: function (message, sessionID) {
            fixClient.emit('fromAdmin', common.stats(fixClient, sessionID, message));
        },
        fromApp: function (message, sessionID) {
            fixClient.emit('fromApp', common.stats(fixClient, sessionID, message));
        }
    }, options);

const showLog = (obj) => {
    common.printStats(fixClient);
    if (obj.message) {
        notify.showNotify(`Message: `);
        console.log(obj.message);
    }
};

const onCreateHandler = (obj) => {
    notify.showNotify(`onCreate event Emitted`);
    showLog(obj);
};

const onLogonHandler = (obj) => {
    notify.showNotify(`onLogon event Emitted`);
    showLog(obj);
};

const onLogoutHandler = (obj) => {
    notify.showNotify(`onLogout event Emitted`);
    showLog(obj);
};

const onLogonAttempHandler = (obj) => {
    notify.showNotify(`onLogon event Emitted`);
    showLog(obj);
    
};

const toAdminHandler = (obj) => {
    debugger
    //obj.message.header[57] = 'somesubid111';
    notify.showNotify(`toAdmin event Emitted`);
    showLog(obj);
};

const fromAdminHandler = (obj) => {
    notify.showNotify(`fromAdmin event Emitted`);
    showLog(obj);
};

const fromAppHandler = (obj) => {
    notify.showNotify(`fromApp event Emitted`);
    showLog(obj);
};

fixClient.on('onCreate', onCreateHandler);
fixClient.on('onLogon', onLogonHandler);
fixClient.on('onLogout', onLogoutHandler);
fixClient.on('onLogonAttempt', onLogonAttempHandler);
fixClient.on('toAdmin', toAdminHandler);
fixClient.on('fromAdmin', fromAdminHandler);
fixClient.on('fromApp', fromAppHandler);
debugger
fixClient.start(() => {
    notify.showNotify("FIX Initiator Started");
  var order = {
    header: {
      8: 'FIX.4.4',
      35: 'D',
      49: "INITIATOR",
      56: "ACCEPTOR"
    },
    tags: {
      11: "0E0Z86K00000",
      48: "06051GDX4",
      22: 1,
      38: 200,
      40: 2,
      54: 1,
      55: 'BAC',
      218: 100,
      //60: df(new Date(), "yyyymmdd-HH:MM:ss.l"),
      423: 6
    }
  };

  fixClient.send(order, function() {
    console.log("Order sent!");
    common.printStats(fixClient);
    process.stdin.resume();
  });
});

// var mdr = {
//     header: {
//         8: 'FIX.4.4',
//         35: 'A',
//         49: "D103289979_client1",
//         56: 'FXCM',
//         57: 'U100D1'
//     },
//     tags: {
//         262: 'EUR/USD_Request', //MDReqID
//         263: 1,                 //SubscriptionRequestType - 1:SNAPSHOT PLUS UPDATES
//         264: 0,                 //MarketDepth
//         265: 0,                 //MDUpdateType - 0: FULL REFRESH - 1:INSCREMENTAL
//         146: 1,                 //NoRelatedSym
//         55: 'USD/JPY',          //Symbol
//         267: 2,                 //NoMDEntryTypes
//         269: 0,                 //MDEntryType - 0: BID
//         269: 1                 //MDEntryType - 1: OFFER
//     },
//     trailer: {}
// };

// fixClient.send(mdr, function () {
//     console.log("Order sent!");
//     common.printStats(fixClient);
//     process.stdin.resume();
// });
// setTimeout(() => {
//     fixClient.stop(() => {
//         console.log('Clident Stopped');
//     });
// }, 600000);

