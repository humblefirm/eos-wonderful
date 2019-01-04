function name(defaultPrivateKey, defaultAccountName) {
    isname = true;
    AccountName = defaultAccountName;
    signatureProvider = new eosjs_jssig.default([defaultPrivateKey]);
    api = new eosjs_api.default({
        rpc,
        signatureProvider
    });
    log(api);
}

function isName(account) {
    if (account.length <= 12) return false
    return true;
}

async function getNameBalance(Account = AccountName, code) {
    //if (typeof codes != "object") return "Variable 'codes' must be object array";
    let ret;
    let table = await rpc.get_table_rows({
        json: true,
        code: code,
        scope: code,
        table: "namebalance",
        table_key: "idx",
        lower_bound: Account,
        limit: 1
    });
    if (table.rows[0].id == Account) ret = table.rows[0].balance;
    return ret;
}

async function getNameBalances(Account = AccountName, codes = ["eoswontoken1", "eoswontoken2", "eoswontoken3", "eoswontoken4", "eoswontoken5"]) {
    //if (typeof codes != "object") return "Variable 'codes' must be object array";
    let ret = [];
    let idx = 0;
    await asyncForEach(codes, async (element) => {
        let balance = await getNameBalance(Account, element);
        ret[idx++] = {
            element,
            balance
        };
    })
    log(ret, "\n\nBalance Loaded!!!\n\n");
    return ret;
}
async function transfernn(to, amount, code, memo) {
    let ret = await api.transact({
        actions: [{
            account: code,
            name: 'transfernn',
            authorization: [{
                actor: AccountName,
                permission: 'active',
            }],
            data: {
                from: AccountName,
                to: to,
                amount: amount,
                memo: memo,
            },
        }]
    }, {
        blocksBehind: 3,
        expireSeconds: 30,
    });
    let bal = await getNameBalances();
    log({
        Balances: bal,
        Transanction: ret
    }, "\n\nToken Transfered\n\n");
    return ret;
}

function defrex_topup(idx, amount, code) {
    transfernn("eoswondefrex", amount, code, idx + "|topupreserve");
}

function trade(idx, amount, code) {
    transfernn("eoswondefrex", amount, code, idx + "|trade");
}

async function claim(idx){
    let ret = await api.transact({
        actions: [{
            account: "eoswondefrex",
            name: 'claim',
            authorization: [{
                actor: AccountName,
                permission: 'active',
            }],
            data: {
                idx: idx
            },
        }]
    }, {
        blocksBehind: 3,
        expireSeconds: 30,
    });
    let bal = await getNameBalances();
    log({
        Balances: bal,
        Transanction: ret
    }, "\n\nToken Transfered\n\n");
}