var request = require('request');
Eos = require('eosjs');
var actions = [];
var contract = '1thefull2bot';
var eos = Eos({
    //httpEndpoint: 'https://eos.greymass.com:443',
    //httpEndpoint: 'http://api.hkeos.com:80',
    //httpEndpoint: 'http://159.89.194.214:8888',
    httpEndpoint: 'http://159.89.194.214:8888',
    chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
    keyProvider: "",
    debug: true
})
// 요청 헤더 부분
var headers = {
    'User-Agent': 'nodejs_mint_server-KST/0.0.1',
    'Content-Type': 'application/json'
}

sync_start();

async function sync_start() {
    console.log("[+]SYNC START\r\n");
    //블록체인 상태 체크
    //디비 상태 체크
    //상태 정상이고, 서로 싱크가 안맞으면 싱크 맞추고 잠시 뒤 재실행
    //상태 비정상이면, 중지하고 잠시 뒤 재실행


    console.log("[+]GET ACTIONS LAST NUMBER\r\n");
    let last = await eos.getActions(contract, -1, -1).catch(reason=>{});
    if (last == undefined) {
        console.log("[-]Failed...  reason: can't get actions\r\n");
        setTimeout(function () {
            sync_start();
        }, 1000);
        return false;
    }
    console.log(last);
    bclast = last.actions[0].account_action_seq;

    console.log("[+]GET DB LAST NUMBER\r\n");
    var server = {
        uri: 'http://35.200.233.174:8080/set_token_transaction', //운영
        method: 'POST',
        json: TxToData(undefined, contract)
    };
    request(server, function (error, response, body) {
        var dblast = body.lastTokenNo;
        if (dblast == undefined) {
            console.log("[-]Failed... reason: can't get lastTokenNo\r\n");
            return false;
        }

        console.log("[++]Sync... " + dblast + "/" + bclast + "\r\n");
        if (dblast < bclast)
            sync_ready(dblast, bclast);
        else
            setTimeout(function () {
                sync_start();
            }, 7000);
    });

}

async function sync_ready(dblast, bclast) {
    var actions = await getAllActions(dblast, bclast);
    sync_tx(actions, dblast, bclast);
    console.log("[+++]Complete! \r\n");
    setTimeout(function () {
        sync_start();
    }, 3000);
}

async function getAllActions(dblast, bclast, part = 100) {
    var actions = [];
    while (dblast < bclast && part >= 5) {
        var offset = part;
        if (dblast + part > bclast) offset = bclast - dblast;
        var temp = await eos.getActions(contract, dblast, offset).catch(reason=>{});
        if(temp==undefined) continue;
        if (temp.time_limit_exceeded_error) {
            part = parseInt(part / 1.2);
            if (part < 5) part = 5
            continue;
        }
        //if (actionlog.length > 0 && actionlog[actionlog.length - 1].account_action_seq == temp.actions[0].account_action_seq) actionlog.length--;
        if (temp.actions[0].account_action_seq > 0) actions.length = temp.actions[0].account_action_seq;
        actions = actions.concat(temp.actions);
        dblast += part;
    }
    return actions;
}

async function sync_tx(actions, dblast, bclast) {
    while (dblast < bclast) {
        console.log(dblast + "/" + bclast + "\r\n");
        var server = {
            uri: 'http://35.200.233.174:8080/set_token_transaction', //운영
            method: 'POST',
            json: TxToData(actions[dblast+1], contract)
        };

        request(server, function (error, response, body) {
            if (body.lastTokenNo != undefined) {
                dblast = body.lastTokenNo;
                if (!error && response.statusCode == 200)
                    if (body.status_code == 0) dblast++;
                if (error)
                    console.log(error);
            }
        });
        dblast++;
    }
}

function TxToData(tx, contract) {
    var error = false;
    var data = {
        SEND_USER_COINID: "NOPE",
        RECEIVE_USER_COINID: "NOPE",
        TRANSACTION_TOKEN_AMOUNT: "0.0000",
        TRANSACTION_MEMO: "NOPE",
        TRANSACTION_ID: null,
        REGISTRATION_DATE: "NOPE",
        LAST_TRANSACTION_NO: 0,
        ETC1: ""
    };
    if (tx == undefined) return data;
    //data.LAST_TRANSACTION_NO = tx.account_action_seq;
    data.REGISTRATION_DATE = tx.block_time.replace("T", " ").split(".")[0];
    if (contract != tx.action_trace.act.authorization[0].actor || contract != tx.action_trace.act.account) return data;
    tx = tx.action_trace;
    if (tx.act.data.memo == undefined || typeof tx.act.data != "object") {
        data.RECEIVE_USER_COINID = "NOPE";
        data.SEND_USER_COINID = "NOPE";
        data.TRANSACTION_MEMO = "NOPE";
        data.TRANSACTION_TOKEN_AMOUNT = "0.0000";
        data.TRANSACTION_ID = null;
    } else if (tx.act.name == "mint") {
        data.TRANSACTION_TOKEN_AMOUNT = parseFloat(tx.act.data.amount).toFixed(4);
        data.TRANSACTION_MEMO = tx.act.data.memo;
        data.TRANSACTION_ID = tx.trx_id;
        data.SEND_USER_COINID = tx.act.data.from;
        data.RECEIVE_USER_COINID = tx.act.data.to;
        if (tx.act.data.memo.indexOf("shopid:") == 0) {
            var temp = tx.act.data.memo.split(":");
            if (temp.length == 4) {
                data.SEND_USER_COINID = temp[2];
                data.ETC1 = temp[3];
                data.TRANSACTION_MEMO = "1thefullCoin"
            }
            if (temp.length == 3) {
                data.SEND_USER_COINID = temp[2];
                data.TRANSACTION_MEMO = "1thefullCoin"
            }
            if (temp.length == 2) {
                data.SEND_USER_COINID = temp[1]
                data.TRANSACTION_MEMO = "firstVisit"
            }
        }

    } else if (tx.act.name == "transfer") {
        data.TRANSACTION_TOKEN_AMOUNT = parseFloat(tx.act.data.amount).toFixed(4);
        data.TRANSACTION_MEMO = tx.act.data.memo;
        data.TRANSACTION_ID = tx.trx_id;
        data.SEND_USER_COINID = tx.act.data.from;
        data.RECEIVE_USER_COINID = tx.act.data.to;
    }
    console.log(data);
    return data;
}