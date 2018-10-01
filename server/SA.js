const express = require('express');
var request = require('request');
const app = express();
const CA = "humblefirm42"
const SA = "humblefirm42";
const SAwif = "5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3" // 프라이빗키
const SAperm = "pub" //입력한 프라이빗키와 매칭되는 펄미션
var actions = [
    [],
    []
];
Eos = require('eosjs');
var eos = Eos({
    httpEndpoint: 'https://api-kylin.eosasia.one',
    chainId: '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191',
    keyProvider: SAwif,
    debug: true
})


getAllActions(eos, CA);
// 요청 헤더 부분
var headers = {
    'User-Agent': 'nodejs_SA_server-KST/0.0.1',
    'Content-Type': 'application/json'
}

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});
//transfer

app.get('/transfer', (req, res) => {
    var e = eos;
    data = JSON.parse(req.query.data)
    eos.transaction({
            actions: [{
                account: CA,
                name: 'transfer',
                authorization: [{
                    actor: SA,
                    permission: SAperm
                }],
                data: data
            }]
        }).catch(reason => {
            //에러 메세지
            console.log(reason)
            return res.status(500).json({
                error: reason
            })
        })
        .then(value => {
            //성공 메세지
            console.log("성공!\r\n");
            getAllActions(eos, CA);
            return res.status(200).json(value)
        })
});



//only for contract manager
app.get('/mint', (req, res) => {
    var e = eos;
    e.transaction({
            actions: [{
                account: CA,
                name: 'mint',
                authorization: [{
                    actor: CA,
                    permission: "active"
                }],
                data: {
                    from: req.query.account,
                    key: req.query.to,
                    amount: req.query.amount,
                    memo: req.query.memo
                }
            }]
        })
        .catch(reason => {
            //에러 메세지
            console.log(reason)
            return res.status(500).json({
                error: reason
            })
        })
        .then(value => {
            //성공 메세지
            console.log("성공!\r\n");
            getAllActions(eos, CA);
            return res.status(200).json(value)
        })
});
app.get('/getlog', (req, res) => {
    if (req.query.account == undefined)
        res.status(200).json([actions[0].length, last]);
    var actionlog = actions[0];
    var i = 0;
    var ret = [];
    for (i = 0; i < actionlog.length; i++) {
        if (actionlog[i].action_trace.act.name == "mint")
            if (actionlog[i].action_trace.act.data.key == req.query.account)
                ret.push({
                    txid: actionlog[i].action_trace.trx_id,
                    time: actionlog[i].block_time,
                    type: actionlog[i].action_trace.act.name,
                    info: actionlog[i].action_trace.act.data
                });
        if (actionlog[i].action_trace.act.name == "transfer")
            if (actionlog[i].action_trace.act.data.sender == req.query.account || actionlog[i].action_trace.act.data.receiver == req.query.account)
                ret.push({
                    txid: actionlog[i].action_trace.trx_id,
                    time: actionlog[i].block_time,
                    type: actionlog[i].action_trace.act.name,
                    info: actionlog[i].action_trace.act.data
                });

    }
    ret = {
        log: ret
    }
    res.status(200).json(ret);
});



async function getAllActions(e, contract, part = 100) {
    last = await e.getActions(contract, -1, -1);
    last = last.actions[0].account_action_seq;
    if (last == undefined) return "Contract account undefined";
    var i = 0;
    var actionlog = actions[0];
    if (actionlog != undefined && actionlog.length > 0) i = actionlog[actionlog.length - 1].account_action_seq;
    while (i < last && part >= 5) {
        var offset = part;
        if (i + part > last) offset = last - i;
        var temp = await e.getActions(contract, i, offset);
        if (temp.time_limit_exceeded_error) {
            part = parseInt(part / 2);
            if (part < 5) part = 5
            continue;
        }
        //if (actionlog.length > 0 && actionlog[actionlog.length - 1].account_action_seq == temp.actions[0].account_action_seq) actionlog.length--;
        if (temp.actions[0].account_action_seq > 0) actionlog.length = temp.actions[0].account_action_seq;
        actionlog = actionlog.concat(temp.actions);
        actions[0] = actionlog;
        i += part;
    }

    return actions.length;
}

app.listen(9880, () => {
    console.log('listening on port 9880!');
});