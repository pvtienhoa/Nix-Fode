const mariadb = require('mariadb');
const common = require('./common.js');
const msgutils = require('./msgutils.js');

class DBConnector {
    constructor(opt) {
        this.pool = mariadb.createPool({
            //host: opt.DBHost,
            socketPath: opt.DBSocketPath,
            user: opt.DBUserName,
            password: opt.DBPassword,
            database: opt.DBDatabase
        });
    }
    async querySymbols() {
        debugger
        const conn = await this.pool.getConnection();
        const rows = await conn.query("Select * From Symbols Where LiveQuotes = ?", [1]);
        if (rows) {
            conn.end();
            return rows;
        }
        else {
            common.showError('Cannot get rows');
            return false;
        };
    }
    async updateLiveQuotes(msgObj) {
        try {
            common.showNotify('Trying to update Live Quotes');
            console.log(msgObj);
            const conn = await this.pool.getConnection();
            await conn.query(`
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
                msgObj.Symbol]);
            conn.end();
        } catch (err) {
            common.showError("not connected due to error: " + err);
        }


        // this.pool.getConnection()
        //     .then(conn => {
        //         common.showNotify("connected ! connection id is " + conn.threadId);
        //         conn.query(`
        //             UPDATE LiveQuotesLD SET 
        //                 TimeStamp = ?, 
        //                 BrokerName = ?, 
        //                 Bid = ?, 
        //                 Ask = ?, 
        //                 Spread = ?  
        //             WHERE Symbol = ?;`,
        //             [(msgObj.TimeStamp) ? msgObj.TimeStamp : 'TimeStamp',
        //             (msgObj.BrokerName) ? msgObj.BrokerName : 'BrokerName',
        //             (msgObj.Bid) ? msgObj.Bid : 'Bid',
        //             (msgObj.Ask) ? msgObj.Ask : 'Ask',
        //             (msgObj.Spread) ? msgObj.Spread : 'Spread',
        //             msgObj.Symbol]).then().catch(err => {
        //                 common.showError(err);
        //             });
        //         conn.end();//release to pool
        //     }).catch(err => {
        //         common.showError("not connected due to error: " + err);
        //     });
    }
    async insertAvg(spreadAvg, options) {
        try {
            common.showNotify('Trying to insert average Quotes');
            const conn = await this.pool.getConnection();
            spreadAvg.forEach(avg => {
                avg.calculate();
                conn.query("INSERT INTO AverageSpreads(TimeStamp, Duration, BrokerName, Symbol, AvgSpread) VALUES (?, ?, ?, ?, ?)", [msgutils.getCurrentTimeStamp(), options.AvgTerm, options.FBrokerName, avg.symbol, avg.avgSpread]);
            });
            conn.end();
        } catch (err) {
            common.showError("not connected due to error: " + err);
        }

        // this.pool.getConnection()
        //     .then(conn => {
        //         common.showNotify("connected ! connection id is " + conn.threadId);
        //         spreadAvg.forEach(avg => {
        //             avg.calculate();
        //             if (avg.avgSpread != 0) {
        //                 conn.query("INSERT INTO AverageSpreads(TimeStamp, Duration, BrokerName, Symbol, AvgSpread) VALUES (?, ?, ?, ?, ?)", [msgutils.getCurrentTimeStamp(), options.AvgTerm, options.FBrokerName, avg.symbol, avg.avgSpread]).then().catch(err => {
        //                     common.showError(err);
        //                 });
        //             }
        //             //conn.end();//release to pool
        //         });
        //     })
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
