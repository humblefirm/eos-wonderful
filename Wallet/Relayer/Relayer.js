var config = {
    httpEndpoint: 'https://api-kylin.eosasia.one',
    chainId: '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191',
    SA: "humblefirm12",
    SAwif: "",
    SAperm: "active",
    MinFee: 0,
    whitelists: [
        "eoswontoken1",
        "eoswontoken2",
        "eoswontoken3",
        "eoswontoken4",
        "eoswontoken5",
        "eoswondefrex"
    ]
}

function whitelist(a) {
    let ret = false;
    for (var i = 0; i < config.whitelists.length; i++)
        if (a == config.whitelists[i]) ret = true;
    return ret;
}
const express = require('express');
var request = require('request');
Eos = require('eosjs');

var eos = Eos({
    httpEndpoint: config['httpEndpoint'],
    chainId: config['chainId'],
    keyProvider: config['SAwif'],
    debug: true
})

const app = express();

// 요청 헤더 부분
var headers = {
    'User-Agent': 'nodejs_SA_server-KST/0.0.3',
    'Content-Type': 'application/json'
}
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});


app.get('/transfer', (req, res) => {
    let data = JSON.parse(req.query.actiondata)

    let actiondata = [];
    actiondata.from = '';
    actiondata.to = data.to;
    actiondata.quantity = data.quantity;
    actiondata.memo = data.memo;
    actiondata.memo+="$" + config['SA'];


    if (!whitelist(data.code)) return res.status(300).send("Code: [" + data.code + "] Doesnt whitelisted");
    if (data['fee'] < config['MinFee']) return res.status(300).send("Fee must >=" + config['MinFee']);

    eos.transaction({
            actions: [{
                account: data.code,
                name: 'transfer',
                authorization: [{
                    actor: config['SA'],
                    permission: config['SAperm']
                }],
                data: actiondata
            }]
        }).catch(reason => {
            //에러 메세지
            console.log(reason)
            return res.status(500).json(reason)
        })
        .then(value => {
            //성공 메세지
            console.log(value)
            return res.status(200).json(value)
        })
});

app.get('/get_info', (req, res) => {
    var temp = config;
    temp['SAwif'] = undefined;
    return res.status(200).json(temp)
});

app.listen(8080, () => {
    console.log('listening on port 8080!');
});
