//COMMAND   await getAccount("EOS7hYNoTNdsVwaF5kUtvqokSNxVmioGCkCsYZvhRo82Tc3jCWukV");
//RETURN    {balance: "12.0000 COF", nonce: 0}

async function getAccount(key) {
    var id = keytoid(key);
    var data = await eos.getTableRows(true, "1thefull2bot", "1thefull2bot", "usrbalance", "id", id, id + 1, 1);
    if (data == undefined) return false;
    if (data.rows.length != 1) return false;
    if (data.rows[0].id != id) return false;
    return {
        balance: data.rows[0].balance,
        nonce: data.rows[0].nonce
    };
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

//var privateKey;
//var publicKey;
async function makeKey() {
    var ret = [];
    // 수학적으로 안전한 프라이빗키를 하나 생성
    await eosjs_ecc.randomKey().then(v1 => {
        //생성된 프라이빗키에서 퍼블릭키 추출
        var key = eosjs_ecc.privateToPublic(v1);
        //퍼블릭키의 앞 24비트만을 이용해 정수형으로 변환(테이블에서 멀티 인덱스의 인덱스값으로 사용)
        var a = keytoid(key);
        //keytoid의 중복 문제를 해결하기 위해 이미 사용중인 id인지 확인
        eos.getTableRows(1, contract, contract, account_tb, "id", a, a + 1, 1).then(v2 => {
            //사용중이지 않으면 반환
            if (v2.rows[0] == undefined) {
                privateKey = v1;
                publicKey = key;
            } else makeKey();
        })
    })
}
