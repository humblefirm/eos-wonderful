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
    document.getElementsByName("sendPublicKey")[0].value = "EOS6FBY9FrxBGXRFsZJJLahKD1LdifzHjhWw5AncPrhYea9awcYAW";
    var copyText = document.getElementsByName("myPublicKey")[0];
    copyText.select();
    document.execCommand("Copy");
    alert("퍼블릭키가 자동으로 입력됐어요!");
}
async function mint() {
    var to = document.getElementsByName("MintTo")[0].value;
    var amount = "8.0000 COF";
    var memo = "Welcome";
    var ret = httpGet(SAurl + "/mint?to=" + to + "&amount=" + amount + "&memo=" + memo + "");

    document.getElementById("accountcurrency").style="display:block";
}
async function sendcoin() {
    var from = document.getElementsByName("OwnerPrivateKey")[0].value;
    var to = document.getElementsByName("sendPublicKey")[0].value;
    var amount = parseFloat(document.getElementsByName("SendAmount")[0].value).toFixed(4) + " " + symbol;;
    var memo = document.getElementsByName("SendMemo")[0].value;
    if(to=="") alert($.lang[currentLang][28]);
    if(document.getElementsByName("SendAmount")[0].value=="") alert($.lang[currentLang][30]);
    var ret = await transfer(from, to, amount, memo);
    document.getElementById("accountcurrency2").style="display:block";
}
async function CheckBalance() {
    var ret = await getCurrency(document.getElementsByName("PublicKey")[1].value);

    document.getElementsByName("ViewBalance")[1].value = ret.balance;
    document.getElementsByName("ViewEos")[1].value = ret.eos;
    document.getElementById("last").style="display:block";
}
async function checkfaucet() {
    var ret = await getCurrency(document.getElementsByName("PublicKey")[0].value);

    document.getElementsByName("ViewBalance")[0].value = ret.balance;
    document.getElementsByName("ViewEos")[0].value = ret.eos;
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
        alert($.lang[currentLang][29]);
        return undefined;
    }
    account = {
        balance: (parseFloat(recv.balance)).toFixed(4),
        eos: (parseFloat(recv.eos)).toFixed(4)
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
    var fee = "0.0000 COF"
    amount = parseFloat(amount).toFixed(4) + " " + symbol;
    var sig = gen_sig_transfer(from, to, amount, memo, fee, nonce.nonce, wif);
    ret = await sendmoney(from, to, amount, memo,fee, sig);
    return ret;
}
async function sendmoney(from, to, amount, memo, fee, sig) {
    data = {
        from: from,
        to: to,
        amount: amount,
        memo: memo,
        fee: fee,
        sig: sig
    }
    return httpGet(SAurl + "/transfer?data=" + encodeURI(JSON.stringify(data)));
}

function httpGet(theUrl) {
    $.get(theUrl, function (jqXHR) {
        if (confirm($.lang[currentLang][31]+" \r\n txid: " + jqXHR.transaction_id))
            //window.open("https://eoscanner.io/transaction/" + jqXHR.transaction_id, "_blank");
            window.open("https://bloks.io/transaction/" + jqXHR.transaction_id, "_blank");
        return jqXHR;
    }, 'json' /* xml, text, script, html */ );

}
async function getaccount(key) {
    var ret;
    await eos.getTableRows(1, contract, contract, account_tb, "id", keytoid(key), keytoid(key) + 1, 1).then(v1 => ret = v1);
    return ret.rows[0];
}
//데이터와 논스값과 프라이빗키를 이용해 시그니쳐를 생성합니다
//포팅 완료된 자료형으로 이루어진 데이터를 시그니쳐로 만들 수 있습니다.
//마지막줄은 프라이빗키입니다.
//지원하는 자료형은 function toHexBuf 에서 확인할 수 있습니다.
//var data=[ 
//    ["EOS8NvFPyMHopRbX241k2bH3roNCDxAL9t1mhQrj9kwh6WucaqEHd","key"],
//    ["1.051 EOS","asset"],
//    ["I love you","string"],
//    ["5JfakvEgxNmZGFrAFQ8ubTzKA6HMN4bP6aEBCo6NqYtfCPF88Ud"]
//];
function gen_sig(data) {
    var buf = [];
    var wif = data[data.length - 1][0];
    for (var i = 0; i < data.length - 1; i++) {
        var tmp = data[i];
        buf = buf.concat(toHexBuf(tmp[0], tmp[1]));
    }
    var hash = eosjs_ecc.sha256(buf);
    return eosjs_ecc.signHash(hash, wif);
}


//YOU DONT NEED TO READ BELOW LINES
function gen_sig_transfer(from, to, amount, memo, fee, nonce, key) {
    var data = [
        [from, 'key'],
        [to, 'key'],
        [amount, 'asset'],
        [memo, 'string'],
        [fee, 'asset'],
        [nonce, 'int'],
        [key]
    ]

    return gen_sig(data);
}

function gen_sig_withdraw(from, to, amount, memo, fee, nonce, key) {
    var data = [
        [from, 'key'],
        [to, 'name'],
        [amount, 'asset'],
        [memo, 'string'],
        [fee, 'asset'],
        [nonce, 'int'],
        [key]
    ]

    return gen_sig(data);
}

function gen_sig_createkey(creator, newkey, memo, fee, nonce, key) {
    var data = [
        [creator, 'key'],
        [newkey, 'key'],
        [memo, 'string'],
        [fee, 'asset'],
        [nonce, 'int'],
        [key]
    ]

    return gen_sig(data);
}


function toHexBuf(data, type) {
    var ret;
    switch (type) {
        case 'key':
            ret = key2hexB(data);
            break;
        case 'string':
            ret = str2hexB(data);
            break;
        case 'asset':
            ret = assetS2hexB(data);
            break;
        case 'int':
            ret = int2hexB(data);
            break;
        case 'name':
            ret = nameS2hexB(data);
            break;
        default:
            console.log("data: " + data + ", type is not defined!");
            break;
    }
    return ret;
}

//YOU REALLY DONT NEED TO READ BELOW LINES
//key to hex
function key2hexB(key) {
    var ret = [0];
    var keyD = base58.decode(key.replace("EOS", ''));
    for (i = 0; i < 33; i++) {
        ret.push(keyD[i]);
    }
    return ret;
}

//string to hex
function str2hexB(str) {
    var ret = [];
    for (i = 0; i < 256; i++)
        ret.push(str[i] == undefined ? 0 : str[i].charCodeAt());
    return ret;
}

//eos asset to hex buffer
//"1 EOS" = 10000 to buffer
//"0.05" = 500 to buffer
function assetS2hexB(amount) {
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

//hex string to hex buffer
//"abcdef12341234"=>[171, 205, 239, 18, 52, 18, 52]
function strH2hexB(str) {
    var ret = [];
    for (var i = 0; i < str.length; i += 2) {
        var hex = str[i] + str[i + 1];
        ret.push(parseInt(hex, 16));
    }
    return ret;
}

//int to hex buffer
function int2hexB(amount) {
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

{
    //name string to name buffer
    //"humblefirm42" => [32, 136, 188, 110, 169, 120, 164, 110]
    function nameS2hexB(str) {
        var value = nameS2nameI(str);
        value = value.toString(16);
        var ret = [0, 0, 0, 0, 0, 0, 0, 0];
        var i = 0,
            j = 7;
        for (i = 0; i < 16; i += 2) {
            ret[j] = parseInt("0x" + value[i] + value[i + 1]);
            j--;
        }
        console.log(ret);
        return ret;
    } {
        //name string to name int
        function nameS2nameI(str) {

            var len = 0n;
            while (str[len]) ++len;

            var value = 0n;

            for (var i = 0; i <= 12; ++i) {
                c = 0n;

                if (i < len && i <= 12) c = BigInt(char2symbol(str[i]));

                if (i < 12) {
                    c &= BigInt(0x1f);
                    c <<= BigInt(64 - 5 * (i + 1));
                } else {
                    c &= BigInt(0x0f);
                }

                value |= c;
            }

            return value;
        }
        //char to base32 symbol
        function char2symbol(c) {
            if (c.charCodeAt() >= 'a'.charCodeAt() && c.charCodeAt() <= 'z'.charCodeAt())
                return (c.charCodeAt() - 'a'.charCodeAt()) + 6;
            if (c.charCodeAt() >= '1'.charCodeAt() && c.charCodeAt() <= '5'.charCodeAt())
                return (c.charCodeAt() - '1'.charCodeAt()) + 1;
            return 0;
        }
    }
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