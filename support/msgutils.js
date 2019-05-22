const parse = (msg) => {
    if (msg.header[35] !== 'W' && msg.header[35] !== 'X') return false;
    var ret = {
        TimeStamp: Number(msg.header[52].replace('-','').replace(':','').replace('.','')),
        BrokerName: msg.header[56],
        Symbol: msg.tags[55],
        Bid: getBid(msg),
        Ask: getAsk(msg),
        Spread: getSpread(msg)
    }
    return ret
};

const showParse = (msg) => {
    if (msg.header[35] !== 'W' && msg.header[35] !== 'X') return false;
    var ret = {
        TimeStamp: getTimeStamp(msg.header[52]),
        BrokerName: msg.header[56],
        Symbol: msg.tags[55],
        Bid: getBid(msg),
        Ask: getAsk(msg),
        Spread: getSpread(msg)
    }
    console.log(ret);
};

const getBid = (msg) => {
    if (msg.header[35] !== 'W' && msg.header[35] !== 'X') return '';
    const bidGroup = msg.groups[268].filter(g => g.tags[269] == 0)[0];
    if (bidGroup) return Number(bidGroup.tags[270]);
}

const getAsk = (msg) => {
    if (msg.header[35] !== 'W' && msg.header[35] !== 'X') return '';
    const askGroup = msg.groups[268].filter(g => g.tags[269] == 1)[0];
    if (askGroup) return Number(askGroup.tags[270]);
}

const getSpread = (msg) => {
    return Number((getAsk(msg) - getBid(msg)).toFixed(5));
}

const getTimeStamp = (str) => {
    const timeStamp = str.substr(0, 8)+str.substr(9, 2)+str.substr(12, 2)+str.substr(15, 2)+str.substr(18, 3);
    return timeStamp;
}

module.exports = {
    parse,
    showParse
}