var data = [];

$(document).ready(function () {
    makeKey();
    listAccount();
});
function clk_act(account) {
    document.getElementsByName("PublicKey")[0].value = account;
    document.getElementsByName("sendPublicKey")[0].value = account;
}
async function listAccount() {
    var data = await eos.getTableRows(1, "eos1thefull1", "eos1thefull1", "usrbalance", "", "", "", 100);
    data = data.rows;
    var i = 0;
    for (i = 0; i < data.length; i++)
        document.getElementsByName("AccountList")[0].innerHTML = document.getElementsByName("AccountList")[0].innerHTML + "<tr><td onclick='clk_act(\"" + data[i].user + "\")'>" + data[i].user + "</td><td>" + data[i].balance + "</td><td>" + data[i].fee + "</td></tr>";
}
async function mint() {
    var from = document.getElementsByName("Minter")[0].value;
    var to = document.getElementsByName("MintTo")[0].value;
    var amount = parseFloat(document.getElementsByName("MintAmount")[0].value).toFixed(4) + " " + symbol;;
    var memo = document.getElementsByName("MintMemo")[0].value;
    //alert(SAurl + "/mint?account=" + from + "&to=" + to + "&amount=" + amount + "&memo=" + memo + "");
    var ret = httpGet(SAurl + "/mint?account=" + from + "&to=" + to + "&amount=" + amount + "&memo=" + memo + "");

}
async function sendcoin() {
    var from = document.getElementsByName("OwnerPrivateKey")[0].value;
    var to = document.getElementsByName("sendPublicKey")[0].value;
    var amount = parseFloat(document.getElementsByName("SendAmount")[0].value).toFixed(4) + " " + symbol;;
    var memo = document.getElementsByName("SendMemo")[0].value;

    var ret = await transfer(from, to, amount, memo);
}
async function CheckBalance() {
    var ret = await getCurrency(document.getElementsByName("PublicKey")[0].value);

    document.getElementsByName("ViewBalance")[0].value = ret.balance;
    document.getElementsByName("ViewFee")[0].value = ret.fee;
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

    var ret = [];
    for (i = 0; i < 8; i++)
        ret.push(b[i]);
    return ret;
}
function int2hex(amount) {
    var b = [0, 0, 0, 0, 0, 0, 0, 0];
    var i = 0;
    while (amount > 0) {
        b[i++] = amount % 256 < 128 ? amount % 256 : amount % 256 - 256;
        amount = amount >> 8;
    }

    var ret = [];
    for (i = 0; i < 8; i++)
        ret.push(b[i]);
    return ret;
}
async function getCurrency(key) {
    recv = await getaccount(key);
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
        //퍼블릭키의 앞 24비트만을 이용해 정수형으로 변환(테이블에서 멀티 인덱스의 인덱스값으로 사용)
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
                makeKeyPublic();
                return key;
            } else
                //사용중이면 재귀호출(수학적으로 재귀호출이 3번 진행될 확률은 1/(1<<28)^3, 재귀호출로 인한 메모리 문제등의 발생 확률은 0에 수렴
                makeKey();
        })
    })
}

function makeKeyPublic() {
    document.getElementsByName("myPublicKey")[0].value = eosjs_ecc.privateToPublic(document.getElementsByName("myPrivateKey")[0].value);
    document.getElementsByName("myPublicKey")[0].value = eosjs_ecc.privateToPublic(document.getElementsByName("myPrivateKey")[0].value);
    document.getElementsByName("MintTo")[0].value = document.getElementsByName("myPublicKey")[0].value;
    document.getElementsByName("PublicKey")[0].value = document.getElementsByName("myPublicKey")[0].value;
    document.getElementsByName("OwnerPrivateKey")[0].value = document.getElementsByName("myPrivateKey")[0].value;
}




async function transfer(wif, to, amount, memo) {
    var from = eosjs_ecc.privateToPublic(wif);
    var nonce = await getaccount(from);
    amount = parseFloat(amount).toFixed(4) + " " + symbol;
    var sig = transfer_sig_gen(from, to, amount, memo, nonce.nonce, wif);
    ret = await transfer_sa(from, to, amount, memo, sig);
    return ret;
}
async function transfer_sa(from, to, amount, memo, sig) {
    data = {
        sender: from,
        receiver: to,
        amount: amount,
        memo: memo,
        sig: sig
    }
    return httpGet(SAurl + "/transfer?data=" + encodeURI(JSON.stringify(data)));
}


//데이터와 논스값과 프라이빗키를 이용해 시그니쳐를 생성합니다
function transfer_sig_gen(from, to, amount, memo,fee, nonce, key) {
    var a = key2hex(from);
    var b = key2hex(to);
    var c = amount2hex(amount);
    var d = str2hex(memo);
    var e = amount2hex(fee);
    var f = int2hex(nonce);
    return eosjs_ecc.signHash(eosjs_ecc.sha256(a.concat(b).concat(c).concat(d).concat(e).concat(f)), key);
}
//데이터와 논스값과 프라이빗키를 이용해 시그니쳐를 생성합니다
function withdraw_sig_gen(from, to, amount, memo, fee, nonce, key) {
    var a = key2hex(from);
    var b = str_to_name_buf(to);
    var c = amount2hex(amount);
    var d = str2hex(memo);
    var e = amount2hex(fee);
    var f = int2hex(nonce);
    console.log(eosjs_ecc.sha256(a.concat(b).concat(c).concat(d).concat(e).concat(f)));
    return eosjs_ecc.signHash(eosjs_ecc.sha256(a.concat(b).concat(c).concat(d).concat(e).concat(f)), key);
}
function createkey_sig_gen(creator,newkey,memo,fee,nonce,key){
    var a = key2hex(creator);
    var b = key2hex(newkey);
    var c = str2hex(memo);
    var d = amount2hex(fee);
    var e = int2hex(nonce);
    //var key=""; 
    //for(i=0;i<34;i++)
    //key+=(b[i]&0xff).toString(16).length==1?"0"+(b[i]&0xff).toString(16):(b[i]&0xff).toString(16);
    //console.log(key);
    console.log(a.concat(b).concat(c).concat(d).concat(e));
    return eosjs_ecc.signHash(eosjs_ecc.sha256(a.concat(b).concat(c).concat(d).concat(e)), key);
}
function httpGet(theUrl) {
    $.get(theUrl, function (jqXHR) {
        if (confirm("성공! 트랜잭션을 확인하시겠습니까? \r\n txid: " + jqXHR.transaction_id))
            window.open("https://eoscanner.io/transaction/" + jqXHR.transaction_id, "_blank");
        return jqXHR;
    }, 'json' /* xml, text, script, html */);

}
async function getaccount(key) {
    var ret;
    await eos.getTableRows(1, contract, contract, account_tb, "id", keytoid(key), keytoid(key) + 1, 1).then(v1 => ret = v1);
    return ret.rows[0];
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
function char_to_symbol(c) {
    if (c.charCodeAt() >= 'a'.charCodeAt() && c.charCodeAt() <= 'z'.charCodeAt())
        return (c.charCodeAt() - 'a'.charCodeAt()) + 6;
    if (c.charCodeAt() >= '1'.charCodeAt() && c.charCodeAt() <= '5'.charCodeAt())
        return (c.charCodeAt() - '1'.charCodeAt()) + 1;
    return 0;
}
function str_to_name(str) {

    var len = 0n;
    while (str[len])++len;

    var value = 0n;

    for (var i = 0; i <= 12; ++i) {
        c = 0n;
        if (i < len && i <= 12) c = BigInt(char_to_symbol(str[i]));

        if (i < 12) {
            c &= BigInt(0x1f);
            c <<= BigInt(64 - 5 * (i + 1));
        }
        else {
            c &= BigInt(0x0f);
        }

        value |= c;
    }

    return value;
}

function key2hex(key) {
    var ret = [0];
    var keyD = base58.decode(key.replace("EOS", ''));
    for (i = 0; i < 33; i++) {
        ret.push(keyD[i]);
    }
    return ret;
}
function str2hex(str) {
    var ret = [];
    for (i = 0; i < 256; i++)
        ret.push(str[i] == undefined ? 0 : str[i].charCodeAt());
    return ret;
}
function str_to_name_buf(str) {
    var value = str_to_name(str);
    value=value.toString(16);
    var ret=[0,0,0,0,0,0,0,0];
    var i=0,j=7;
    for(i=0;i<16;i+=2){
        ret[j]=parseInt("0x"+value[i]+value[i+1]);
        j--;
    }
    console.log(ret);
    return ret;
}
function hexstr_to_buf(str) {
    var ret = [];
    for (var i = 0; i < str.length; i += 2) {
        var hex = str[i] + str[i + 1];
        ret.push(parseInt(hex, 16));
    }
    return ret;
}