const mariadb = require('mariadb');
const common = require('./common.js');
const msgutils = require('./msgutils.js');

class DBConnector {
    constructor(opt) {
        this.option = {
            host: opt.DBHost,
            socketPath: opt.DBSocketPath,
            user: opt.DBUserName,
            password: opt.DBPassword,
            database: opt.DBDatabase
        }
    }
    createPool() {
        this.pool = mariadb.createPool(this.option);
    }
    querySymbols() {
        let ret = [];
        this.pool.getConnection()
            .then(conn => {
                common.showNotify("connected ! connection id is " + conn.threadId);
                conn.query("Select * From Symbols Where LiveQuotes = '1';").then(rows => {
                    Array.prototype.push.apply(ret, rows);
                    debugger
                }).catch(err => {
                    common.showError(err);
                });
                conn.end();
            })
            .catch(err => {
                common.showNotify("not connected due to error: " + err);
            });
            debugger
        return ret;

    }
    updateLiveQuotes(msgObj) {
        this.pool.getConnection()
            .then(conn => {
                common.showNotify("connected ! connection id is " + conn.threadId);
                conn.query(`
                    UPDATE LiveQuotesLD SET 
                        TimeStamp = ?, 
                        BrokerName = ?, 
                        Bid = ?, 
                        Ask = ?, 
                        Spread = ?  
                    WHERE Symbol = ?;`,
                    [(msgObj.TimeStamp) ? msgObj.TimeStamp : 'TimeStamp',
                    (msgObj.BrokerName) ? msgObj.BrokerName : 'BrokerName',
                    (msgObj.Bid) ? msgObj.Bid : 'Bid',
                    (msgObj.Ask) ? msgObj.Ask : 'Ask',
                    (msgObj.Spread) ? msgObj.Spread : 'Spread',
                    msgObj.Symbol]).then().catch(err => {
                        common.showError(err);
                    });
                conn.end();//release to pool
            })
            .catch(err => {
                common.showNotify("not connected due to error: " + err);
            });
    }
    insertAvg(spreadAvg, options) {
        this.pool.getConnection()
            .then(conn => {
                common.showNotify("connected ! connection id is " + conn.threadId);
                spreadAvg.forEach(avg => {
                    avg.calculate();
                    if (avg.avgSpread != 0) {
                        conn.query("INSERT INTO AverageSpreads(TimeStamp, Duration, BrokerName, Symbol, AvgSpread) VALUES (?, ?, ?, ?, ?)", [msgutils.getCurrentTimeStamp(), options.AvgTerm, options.FBrokerName, avg.symbol, avg.avgSpread]).then().catch(err => {
                            common.showError(err);
                        });
                    }
                    conn.end();//release to pool
                });
            })
    }
}
module.exports = DBConnector;



// export default function dbconnector(option) {
//     const connection = mariadb.createConnection({ ///var/run/mysqld/mysqld.sock
//         // host: 'localhost',
//         // user: 'nfuser',
//         // password: 'nodefix',
//         // connectionLimit: 5,
//         // database: 'nixfode'
//         socketPath: '/var/run/mysqld/mysqld.sock',
//         user: 'nfuser',
//         password: 'nodefix'
//     });

//     const insertLiveQuotes = (record) => {
//         //insert live quotes records
//     }

//     const start = () => {
//         //start connector
//     }
//     const stop = () => {
//         //stop connector
//     }

//     pool.getConnection()
//         .then(conn => {

//             conn.query(`CREATE TABLE Symbols (
//         ID bigint(20) NOT NULL AUTO_INCREMENT,      
//         currencypairname longtext CHARACTER SET utf8mb4,      
//         requestId longtext CHARACTER SET utf8mb4,      
//         Digit int(11) DEFAULT NULL,      
//         LiveQuotes tinyint(1) DEFAULT NULL,      
//         PRIMARY KEY (ID)      
//       ) ENGINE=InnoDB AUTO_INCREMENT=623 DEFAULT CHARSET=utf8;`)
//                 .then((rows) => {
//                     console.log(rows); //[ {val: 1}, meta: ... ]
//                     //Table must have been created before 
//                     // " CREATE TABLE myTable (id int, val varchar(255)) "
//                     return conn.query(`CREATE TABLE LiveQuotesLD (
//             ID bigint(20) NOT NULL,          
//             TimeStamp bigint(20) DEFAULT NULL,          
//             BrokerName longtext CHARACTER SET utf8mb4,          
//             Symbol longtext CHARACTER SET utf8mb4,          
//             Bid double DEFAULT NULL,          
//             Ask double DEFAULT NULL,          
//             Spread double DEFAULT NULL,          
//             SpreadAvg double DEFAULT NULL,          
//             PRIMARY KEY (ID),          
//             KEY idx_LivequotesLD_TimeStamp (TimeStamp),          
//             KEY idx_LivequotesLD_Symbol (Symbol(20))          
//           ) ENGINE=InnoDB DEFAULT CHARSET=utf8;`);
//                 })
//                 .then((res) => {
//                     console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
//                     conn.end();
//                 })
//                 .catch(err => {
//                     //handle error
//                     console.log(err);
//                     conn.end();
//                 })

//         }).catch(err => {
//             //not connected
//         });
// }
