class SpreadAvg {
    constructor(brokerName, symbol, fpoint) {
        this.brokerName = brokerName;
        this.symbol = symbol;
        this.sum = 0.0;
        this.count = 0;
        this.avgSpread = 0.0;
        this.lastAvg = 0.0
        this.fpoint = fpoint;
    }    
    reset() {
        this.sum = 0.0;
        this.count = 0;
    };
    calculate() {
        if (this.count === 0) return this.avgSpread;
        this.avgSpread = (this.sum / this.count).toFixed(this.fpoint);
    };
    addSum(s) {
        this.sum += s;
        this.count ++;
    }
}
module.exports = SpreadAvg;