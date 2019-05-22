const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: 'localhost', 
    user:'nfuser', 
    password: 'nodefix',
    connectionLimit: 5,
    database: 'nixfode'
});
const getPool = () => {
    return pool;
}
pool.getConnection()
   .then(conn => {
   
     conn.query(`CREATE TABLE Symbols (
        ID bigint(20) NOT NULL AUTO_INCREMENT,      
        currencypairname longtext CHARACTER SET utf8mb4,      
        requestId longtext CHARACTER SET utf8mb4,      
        Digit int(11) DEFAULT NULL,      
        LiveQuotes tinyint(1) DEFAULT NULL,      
        PRIMARY KEY (ID)      
      ) ENGINE=InnoDB AUTO_INCREMENT=623 DEFAULT CHARSET=utf8;`)
       .then((rows) => {
         console.log(rows); //[ {val: 1}, meta: ... ]
         //Table must have been created before 
         // " CREATE TABLE myTable (id int, val varchar(255)) "
         return conn.query(`CREATE TABLE LiveQuotesLD (
            ID bigint(20) NOT NULL,          
            TimeStamp bigint(20) DEFAULT NULL,          
            BrokerName longtext CHARACTER SET utf8mb4,          
            Symbol longtext CHARACTER SET utf8mb4,          
            Bid double DEFAULT NULL,          
            Ask double DEFAULT NULL,          
            Spread double DEFAULT NULL,          
            SpreadAvg double DEFAULT NULL,          
            PRIMARY KEY (ID),          
            KEY idx_LivequotesLD_TimeStamp (TimeStamp),          
            KEY idx_LivequotesLD_Symbol (Symbol(20))          
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8;`);
       })
       .then((res) => {
         console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
         conn.end();
       })
       .catch(err => {
         //handle error
         console.log(err); 
         conn.end();
       })
       
   }).catch(err => {
     //not connected
   });