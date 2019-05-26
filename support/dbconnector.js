const mariadb = require('mariadb');
const common = require('./common.js');
const msgutils = require('./msgutils.js');

class DBConnector {
    constructor(opt) {
        this.options = opt;
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
        const rows = await conn.query(`Select * From ${this.options.TblSymbols} Where LiveQuotes = ?`, [1]);
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
        UPDATE ${this.options.TblLiveQuotes} SET 
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
    }
    async insertAvg(spreadAvg) {
        try {
            common.showNotify('Trying to insert average Quotes');
            const conn = await this.pool.getConnection();
            spreadAvg.forEach(avg => {
                avg.calculate();
                conn.query(`INSERT INTO ${this.options.TblAverageSpreads}(TimeStamp, Duration, BrokerName, Symbol, AvgSpread) VALUES (?, ?, ?, ?, ?)`, [common.getTimeStamp(), this.options.AvgTerm, this.options.FBrokerName, avg.symbol, avg.avgSpread]);
                avg.reset();
            });
            conn.end();
        } catch (err) {
            common.showError("not connected due to error: " + err);
        }
    }
}
module.exports = DBConnector;