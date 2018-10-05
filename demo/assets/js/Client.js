var data = [];

$(document).ready(function () {});

function clk_act(account) {
    document.getElementsByName("PublicKey")[0].value = account;
    document.getElementsByName("sendPublicKey")[0].value = account;
}

function check_fst_btn() {
    // 수학적으로 안전한 프라이빗키를 하나 생성
    var wif = document.getElementsByName("myPrivateKey")[0].value;
    var pub = document.getElementsByName("myPublicKey")[0].value;
    var newpub = eosjs_ecc.privateToPublic(wif);
    if (pub != newpub) {
        document.getElementsByName("myPublicKey")[0].value = newpub;
        document.getElementsByName("fst_btn")[0].value = "Paste public key";
        document.getElementsByName("fst_btn")[0].onclick = "copypub()";
    }else{
        document.getElementsByName("fst_btn")[0].value = "Generate New Key";
        document.getElementsByName("fst_btn")[0].onclick = "makeKey()";
    }
}

function copypub() {
    var pub = document.getElementsByName("myPublicKey")[0].value;
    document.getElementsByName("MintTo")[0].value = pub;
    document.getElementsByName("PublicKey")[0].value = pub;
    document.getElementsByName("PublicKey")[1].value = pub;
    document.getElementsByName("sendPublicKey")[0].value = "EOS6fETniF1jQpk6Nj4hYf4gGfwCdz4tH74c5kQqu1PRqpvbaogDj";
    var copyText = document.getElementsByName("myPublicKey")[0];
    copyText.select();
    document.execCommand("Copy");
    alert("퍼블릭키가 자동으로 입력됐어요!");
}
async function mint() {
    var from = "Suntae"
    var to = document.getElementsByName("MintTo")[0].value;
    var amount = "8.0000 WDF";
    var memo = "Welcome";
    //alert(SAurl + "/mint?account=" + from + "&to=" + to + "&amount=" + amount + "&memo=" + memo + "");
    var ret = httpGet(SAurl + "/mint?account=" + from + "&to=" + to + "&amount=" + amount + "&memo=" + memo + "");

    document.getElementById("accountcurrency").style="display:block";
}
async function sendcoin() {
    var from = document.getElementsByName("OwnerPrivateKey")[0].value;
    var to = document.getElementsByName("sendPublicKey")[0].value;
    var amount = parseFloat(document.getElementsByName("SendAmount")[0].value).toFixed(4) + " " + symbol;;
    var memo = document.getElementsByName("SendMemo")[0].value;

    var ret = await transfer(from, to, amount, memo);
    document.getElementById("accountcurrency2").style="display:block";
}
async function CheckBalance() {
    var ret = await getCurrency(document.getElementsByName("PublicKey")[1].value);

    document.getElementsByName("ViewBalance")[1].value = ret.balance;
    document.getElementsByName("ViewFee")[1].value = ret.fee;
    document.getElementById("last").style="display:block";
}
async function checkfaucet() {
    var ret = await getCurrency(document.getElementsByName("PublicKey")[0].value);

    document.getElementsByName("ViewBalance")[0].value = ret.balance;
    document.getElementsByName("ViewFee")[0].value = ret.fee;
    document.getElementsByName("faucet_val")[0].innerText = ret.balance;
    document.getElementById("transfer").style="display:block";
}
//data = await getAllActions();
//result = await filterActions(data,"EOS7jFs7j4Mbc3bq5Azc5QfzHn7YanzEgUpAo9WZFENbeCesrHtdm");
async function filterActions(data, account) {
    var i = 0;
    var ret = [];
    for (i = 0; i < data.length; i++) {
        if (data[i].action_trace.act.data.key != account && data[i].action_trace.act.data.from != account) continue;
        ret.push({
            txid: data[i].action_trace.trx_id,
            time: data[i].block_time,
            type: data[i].action_trace.act.name,
            info: data[i].action_trace.act.data
        });
    }
    return ret;
}
async function getAllActions(contract, part = 100) {
    var last = await eos.getActions(contract, -1, -1);
    last = last.actions[0].account_action_seq;
    if (last == undefined) return "Contract account undefined";
    var i = 0;
    if (data != undefined && data.length > 0) i = data[data.length - 1].account_action_seq;
    console.log(i + "" + last);
    while (i < last) {
        var offset = part;
        if (i + part > last) offset = last - i;
        var temp = await eos.getActions(contract, i, offset);
        if (temp.time_limit_exceeded_error) {
            part = parseInt(part / 2);
            continue;
        }
        if (data.length > 0 && data[data.length - 1].account_action_seq == temp.actions[0].account_action_seq) data.length--;
        data = data.concat(temp.actions);
        i += part;
    }
    return data;
}

function amount2hex(amount) {
    var a = parseInt(parseFloat(amount.trim()).toFixed(4).replace(".", ''));
    var b = [0, 0, 0, 0, 0, 0, 0, 0];
    var i = 0;
    while (a > 0) {
        b[i++] = a % 256 < 128 ? a % 256 : a % 256 - 256;
        a = a >> 8;
    }
    return b;
}
async function getCurrency(key) {
    recv = await getaccount(key);
    if(recv==undefined){
        alert("계정을 찾을 수 없습니다!");
        return undefined;
    }
    now = parseInt(new Date().getTime() / 1000); //초
    lastclaim = parseInt(recv.lastclaim / 1000000); //초
    refund = (now - lastclaim) * parseFloat(recv.fee) / feeRstTime;
    if (refund > parseInt(recv.fee)) refund = parseFloat(recv.fee);
    account = {
        balance: (parseFloat(recv.balance) + refund).toFixed(4),
        fee: (parseFloat(recv.fee) - refund.toFixed(4)).toFixed(4)
    };
    return account;
}
//var privateKey;
//var publicKey;
async function makeKey() {
    // 수학적으로 안전한 프라이빗키를 하나 생성
    eosjs_ecc.randomKey().then(v1 => {
        //생성된 프라이빗키에서 퍼블릭키 추출
        var key = eosjs_ecc.privateToPublic(v1);
        //퍼블릭키의 앞 28비트만을 이용해 정수형으로 변환(테이블에서 멀티 인덱스의 인덱스값으로 사용)
        var a = keytoid(key);
        //keytoid의 중복 문제를 해결하기 위해 이미 사용중인 id인지 확인
        eos.getTableRows(1, contract, contract, account_tb, "id", a, a + 1, 1).then(v2 => {
            //사용중이지 않으면 반환
            if (v2.rows[0] == undefined) {
                console.log("THIS IS NEW PublicKey:\"" + key + "\" PrivateKey:\"" + v1 + "\"")
                document.getElementsByName("myPublicKey")[0].value = key;
                document.getElementsByName("myPrivateKey")[0].value = v1;
                document.cookie = v1;
                privateKey = v1;
                publicKey = key;
                document.getElementsByName("OwnerPrivateKey")[0].value = v1;
                document.getElementsByName("fst_btn")[0].innerText = "Paste public key";
                document.getElementsByName("fst_btn")[0].setAttribute("onclick","copypub()");
                document.getElementById("mintcoin").style="display:block";
                return key;
            } else
                //사용중이면 재귀호출(수학적으로 재귀호출이 3번 진행될 확률은 1/(1<<28)^3, 재귀호출로 인한 메모리 문제등의 발생 확률은 0에 수렴
                makeKey();
        })
    })
}


function nonce2hex(nonce) {
    var a = nonce;
    var b = [0, 0, 0, 0, 0, 0, 0, 0];
    var i = 0;
    while (a > 0) {
        b[i++] = a % 256 < 128 ? a % 256 : a % 256 - 256;
        a = a >> 8;
    }
    return b;
}

async function transfer(wif, to, amount, memo) {
    var from = eosjs_ecc.privateToPublic(wif);
    var nonce = await getaccount(from);
    amount = parseFloat(amount).toFixed(4) + " " + symbol;
    var sig = maketxdata(from, to, amount, memo, nonce.nonce, wif);
    ret = await sendmoney(from, to, amount, memo, sig);
    return ret;
}
async function sendmoney(from, to, amount, memo, sig) {
    data = {
        sender: from,
        receiver: to,
        amount: amount,
        memo: memo,
        sig: sig
    }
    return httpGet(SAurl + "/transfer?data=" + encodeURI(JSON.stringify(data)));
}

function httpGet(theUrl) {
    $.get(theUrl, function (jqXHR) {
        if (confirm("성공! 트랜잭션을 확인하시겠습니까? \r\n txid: " + jqXHR.transaction_id))
            //window.open("https://eoscanner.io/transaction/" + jqXHR.transaction_id, "_blank");
            window.open("https://eosflare.io/tx/" + jqXHR.transaction_id, "_blank");
        return jqXHR;
    }, 'json' /* xml, text, script, html */ );

}
async function getaccount(key) {
    var ret;
    await eos.getTableRows(1, contract, contract, account_tb, "id", keytoid(key), keytoid(key) + 1, 1).then(v1 => ret = v1);
    return ret.rows[0];
}
//데이터와 논스값과 프라이빗키를 이용해 시그니쳐를 생성합니다
function maketxdata(from, to, amount, memo, nonce, key) {
    var fromD = base58.decode(from.replace("EOS", ''));
    var toD = base58.decode(to.replace("EOS", ''));
    var amountD = amount2hex(amount);
    var nonceD = nonce2hex(nonce);
    var a = [0],
        b = [0],
        c = [],
        d = [],
        e = [];
    var i;
    for (i = 0; i < 33; i++) {
        a.push(fromD[i]);
        b.push(toD[i]);
    }

    for (i = 0; i < 8; i++)
        c.push(amountD[i]);

    if (memo.length > 0)
        d.push(memo.length * 2);
    else
        d.push(0);
    for (i = 0; i < 255; i++)
        d.push(memo[i] == undefined ? 0 : memo[i].charCodeAt());

    for (i = 0; i < 8; i++)
        e.push(nonceD[i]);
    return eosjs_ecc.signHash(eosjs_ecc.sha256(a.concat(b).concat(c).concat(d).concat(e)), key);
}

function keytoid(key) {
    var x, i = 0,
        ret = 0,
        keyD = base58.decode(key.replace("EOS", ''));

    for (i = 0; i < 6; i++) {
        var a = keyD[i];
        a = a < 0 ? 256 + a : a;
        ret += a << (i * 4);
    }
    return ret;
}

function keyto3word(key) {
    var a = keytoid(key);
    var ret = [];

}