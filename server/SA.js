var config = {
    httpEndpoint: 'https://api-kylin.eosasia.one',
    chainId: '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191',
    CA: "humblefirm43",
    SA: "humblefirm12",
    SAkey: "EOS8NvFPyMHopRbX241k2bH3roNCDxAL9t1mhQrj9kwh6WucaqEHd",
    SAwif: "",
    SAperm: "active",
    MinFee: 0,
}
/*
var config = {
    httpEndpoint: 'https://api1.eosasia.one',
    chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
    CA: "eos1thefull1",
    SA: "",
    SAkey: "",
    SAwif: "",
    SAperm: "active",
    MinFee: 0,
}
*/

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
    'User-Agent': 'nodejs_SA_server-KST/0.0.2',
    'Content-Type': 'application/json'
}
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});


app.get('/transmit', (req, res) => {
    var data = JSON.parse(req.query.data)
    data['sakey'] = config['SAkey'];
    if (data['fee'] < config['MinFee']) return res.status(300).send("Fee must >=" + config['MinFee']);
    eos.transaction({
        actions: [{
            account: config['CA'],
            name: req.query.name,
            authorization: [{
                actor: config['SA'],
                permission: config['SAperm']
            }],
            data: data
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

app.get('/mint', (req, res) => {
    eos.transaction({
        actions: [{
            account: req.query.account,
            name: 'mint',
            authorization: [{
                actor: req.query.account,
                permission: 'active'
            }],
            data: {
                key: req.query.to,
                amount: req.query.amount,
                memo: req.query.memo
            }
        }]
    })
        .catch(reason => {
            //에러 메세지
            //console.log(reason)
            return res.status(500).json({
                error: reason
            })
        })
        .then(value => {
            //성공 메세지
            console.log("[+] MINT\r\n");
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
