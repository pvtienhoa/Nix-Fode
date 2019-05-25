const quickfix = require('node-quickfix');
const path = require('path');
const events = require('events');
const initiator = quickfix.initiator;
const mariadb = require('mariadb/callback');

const common = require('./support/common.js');
const msgutils = require('./support/msgutils.js');
const SpreadAvg = require('./support/SpreadAvg.js');
const DBConnector = require('./support/dbconnector.js');

const optionPath = path.join(__dirname, '/support/config.json');
debugger
const options = common.loadOptions(optionPath);
const foptions = common.loadFixOptions(options);

const spreadAvg = [];

const dbConn = new DBConnector(options);
const emitter = new events.EventEmitter();

const connection = mariadb.createConnection({
    // host: options.localhost,
    socketPath: options.DBSocketPath,
    user: options.DBUserName,
    password: options.DBPassword,
    database: options.DBDatabase
});

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
            fixClient.emit('toAdmin', common.stats(fixClient, sessionID, message));
        },
        fromAdmin: function (message, sessionID) {
            fixClient.emit('fromAdmin', common.stats(fixClient, sessionID, message));
        },
        fromApp: function (message, sessionID) {
            fixClient.emit('fromApp', common.stats(fixClient, sessionID, message));
        }
    }, foptions);

const showLog = (obj) => {
    common.printStats(fixClient);
    if (obj.message) {
        common.showNotify(`Message: `);
        console.log(obj.message);
    }
    if (obj.message.groups) {
        common.showNotify(`Groups: `);
        obj.message.groups[268].forEach(g => {
            console.log(g);
        });
    }
};

const onCreateHandler = (obj) => {
    //common.showNotify(`onCreate event Emitted`);
    //showLog(obj);
};
const onLogonHandler = (obj) => {
    common.showNotify(`onLogon event Emitted`);
    // showLog(obj);
    sendMarktRequestData();
};
const onLogoutHandler = (obj) => {
    //common.showNotify(`onLogout event Emitted`);
    //showLog(obj);
};
const onLogonAttempHandler = (obj) => {
    common.showNotify(`onLogon event Emitted`);
    //showLog(obj);
};
const toAdminHandler = (obj) => {
    //obj.message.header[57] = 'U100D1';  // Set Tag 57 - TargetSubID on hearbeat msg
    common.showNotify(`toAdmin event Emitted`);
    showLog(obj);
};
const fromAdminHandler = (obj) => {
    common.showNotify(`fromAdmin event Emitted`);
    showLog(obj);
};
const fromAppHandler = (obj) => {
    common.showNotify(`fromApp event Emitted`);
    if (obj.message) receiveMessage(obj.message);
};

fixClient.on('onCreate', onCreateHandler);
fixClient.on('onLogon', onLogonHandler);
fixClient.on('onLogout', onLogoutHandler);
fixClient.on('onLogonAttempt', onLogonAttempHandler);
fixClient.on('toAdmin', toAdminHandler);
fixClient.on('fromAdmin', fromAdminHandler);
fixClient.on('fromApp', fromAppHandler);

const receiveMessage = (message) => {
    if (message.header[35] !== 'W' && message.header[35] !== 'X') {
        common.showError('Not a "W" or "X" message!');
        return;
    }
    //msgutils.showParse(obj.message);
    var p = msgutils.parse(message);
    emitter.emit('PriceReceived', p);

    var a = spreadAvg.filter(avg => avg.symbol == p.Symbol)[0];
    //console.log(a.symbol+ '=='+ p.Symbol);
    if (a) a.addSum(p.Spread);
};

const recordAvg = () => {
    connection.connect(err => {
        if (err) {
            common.showError("not connected due to error: " + err);
        } else {
            common.showNotify("connected ! connection id is " + connection.threadId);
            spreadAvg.forEach(avg => {
                avg.calculate();
                if (avg.avgSpread != 0) {
                    connection.query("INSERT INTO AverageSpreads(TimeStamp, Duration, BrokerName, Symbol, AvgSpread) VALUES (?, ?, ?, ?, ?)", [msgutils.getCurrentTimeStamp(), options.AvgTerm, options.FBrokerName, avg.symbol, avg.avgSpread], (err, res) => {
                        if (err) {
                            common.showError("cannot query due to error:: " + err);
                            return;
                        }
                        //console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
                    });
                }
                // common.showNotify('This record will be insert into db');
                // console.log('Symbol: ' + avg.symbol);
                // console.log('duration: ' + avg.duration);
                // console.log('brokerName: ' + avg.brokerName);
                // console.log('avgSpread: ' + avg.avgSpread);
                // console.log('sum: ' + avg.sum);
                // console.log('count: ' + avg.count);
                avg.reset();
            });
        };

    });

};

const sendMarktRequestData = () => {
    //Create request message template
    

    //Query Rows from Symbol tables
    debugger
    dbConn.querySymbols().then(rows => {
        var mrd = {
            header: {
                8: options.FMsgType,
                35: 'V',
                49: options.FSenderID,
                56: options.FTargetID,
                57: options.FTargetSubID
            },
            tags: {
                262: options.FBrokerName, //MDReqID
                263: 1,                 //SubscriptionRequestType - 1:SNAPSHOT PLUS UPDATES
                264: 0,                 //MarketDepth
                265: 1,                 //MDUpdateType - 0: FULL REFRESH - 1:INSCREMENTAL
            },
            groups: [{
                'index': 146,           //NoRelatedSym
                'delim': 55,
                'entries': []   //MDEntryType - 1: OFFER - 0: BID { 55: 'EUR/USD' }
            },
            {
                'index': 267,
                'delim': 269,
                'entries': [{ 269: 0 }, { 269: 1 }]   //MDEntryType - 1: OFFER - 0: BID
            }]
    
        };
        debugger
        rows.forEach(row => {
            mrd.groups[0].entries.push({ 55: row.currencypairname });
            var a = new SpreadAvg(options.FBrokerName, row.currencypairname, row.Digit);
            spreadAvg.push(a);
            //console.log(a);
        });
        fixClient.send(mrd, function () {
            common.showNotify("Market Data Request sent!");
            common.printStats(fixClient);
            console.log(mrd);
            mrd.groups.forEach(g => {
                console.log(g);
            });
        });
    });
    debugger
    //Push Symbols into message template

    //Send message


    // connection.connect(err => {
    //     if (err) {
    //         common.showError("not connected due to error: " + err);
    //     } else {
    //         common.showNotify("connected for load symbols! connection id is " + connection.threadId);
    //         connection.query("Select * From Symbols Where LiveQuotes = '1';", (err, res) => {
    //             const rows = res;
    //             if (rows.length > 0) {
    //                 rows.forEach(row => {
    //                     mrd.groups[0].entries.push({ 55: row.currencypairname });
    //                     var a = new SpreadAvg(options.FBrokerName, row.currencypairname, row.Digit);
    //                     spreadAvg.push(a);
    //                     //console.log(a);
    //                 });
    //             }

    //             fixClient.send(mrd, function () {
    //                 common.showNotify("Market Data Request sent!");
    //                 //common.printStats(fixClient);
    //             });

    //             if (err) {
    //                 common.showError("cannot query due to error:: " + err);
    //                 return;
    //             }
    //         });

    //     }
    // });

};

//Main
fixClient.start(() => {
    common.showNotify("FIX Initiator Started");
    //Start connector
    //dbConn.createPool();

    //set timer for record Average Spread
    setInterval(() => {
        recordAvg();
    }, options.AvgTerm);

    //Set listner on Price Received
    emitter.on('PriceReceived', (msgObj) => {
        console.log('price received!');
        dbConn.updateLiveQuotes(msgObj);
    });
    process.stdin.resume();
    // connection.connect(err => {
    //     if (err) {
    //         common.showError("not connected due to error: " + err);
    //     } else {
    //         setInterval(() => {
    //             recordAvg();
    //         }, options.AvgTerm);
    //         common.showNotify("connected ! connection id is " + connection.threadId);
    //         //Listen to event
    //         emitter.on('PriceReceived', (msgObj) => {
    //             connection.query(`
    //                 UPDATE LiveQuotesLD SET 
    //                     TimeStamp = ?, 
    //                     BrokerName = ?, 
    //                     Bid = ?, 
    //                     Ask = ?, 
    //                     Spread = ?  
    //                 WHERE Symbol = ?;`,
    //                 [(msgObj.TimeStamp) ? msgObj.TimeStamp : 'TimeStamp',
    //                 (msgObj.BrokerName) ? msgObj.BrokerName : 'BrokerName',
    //                 (msgObj.Bid) ? msgObj.Bid : 'Bid',
    //                 (msgObj.Ask) ? msgObj.Ask : 'Ask',
    //                 (msgObj.Spread) ? msgObj.Spread : 'Spread',
    //                 msgObj.Symbol], (err, res) => {
    //                     if (err) {
    //                         common.showError("not inserted due to error: " + err);
    //                         process.exit();
    //                         return;
    //                     }
    //                     //console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
    //                 });
    //             //console.clear();
    //             //common.showNotify('Price has been updated!');
    //             //console.log(msgObj);
    //         });
    //         process.stdin.resume();
    //     }
    // });
});


