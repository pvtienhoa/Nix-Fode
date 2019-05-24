const parse = (msg) => {
    if (msg.header[35] !== 'W' && msg.header[35] !== 'X') return false;
    var ret = {
        TimeStamp: getTimeStamp(msg.header[52]),
        BrokerName: msg.header[56],
        Symbol: msg.header[35] == 'W' ? msg.tags[55] : msg.groups[268][0].tags[55],
        Bid: getBid(msg),
        Ask: getAsk(msg),
        Spread: getSpread(msg)
    }
    return ret
};

const showParse = (msg) => {
    if (msg.header[35] !== 'W' && msg.header[35] !== 'X') return false
    var ret = {
        TimeStamp: getTimeStamp(msg.header[52]),
        BrokerName: msg.header[56],
        Symbol:  msg.header[35] == 'W' ? msg.tags[55] : msg.groups[268][0].tags[55],
        Bid: getBid(msg),
        Ask: getAsk(msg),
        Spread: getSpread(msg)
    }
    console.log(ret);
};

const getBid = (msg) => {
    if (msg.header[35] !== 'W' && msg.header[35] !== 'X') return '';
    const bidGroup = msg.groups[268].filter(g => g.tags[269] == 0)[0];
    if (bidGroup && bidGroup.tags[270]) return Number(bidGroup.tags[270])
    else return null;
}

const getAsk = (msg) => {
    if (msg.header[35] !== 'W' && msg.header[35] !== 'X') return '';
    const askGroup = msg.groups[268].filter(g => g.tags[269] == 1)[0];
    if (askGroup && askGroup.tags[270]) return Number(askGroup.tags[270]);
    else return null;
}

const getSpread = (msg) => {
    const a = getAsk(msg);
    const b = getBid(msg);
    if (!a || !b) return null
    else return Number((getAsk(msg) - getBid(msg)).toFixed(5));
}

const getTimeStamp = (str) => {
    if (!str) return null;
    const timeStamp = str.substr(0, 8) + str.substr(9, 2) + str.substr(12, 2) + str.substr(15, 2) + str.substr(18, 3);
    return timeStamp;
}

const getCurrentTimeStamp = () => {
    var d = new Date();
    var yyyy = lpad(d.getUTCFullYear(),4);
    var MM = lpad(d.getUTCMonth() + 1,2);
    var dd = lpad(d.getUTCDate(),2);
    var hh = lpad(d.getUTCHours(),2);
    var mm = lpad(d.getUTCMinutes(),2);
    var ms = lpad(d.getUTCMilliseconds(),3);
    var ret = [yyyy,MM,dd,hh,mm,ms].join('');
    return ret;
}

lpad = function(s, width) {
    return (s.length >= width) ? s : (new Array(width).join('0') + s).slice(-width);
}

module.exports = {
    parse,
    showParse,
    getCurrentTimeStamp
}