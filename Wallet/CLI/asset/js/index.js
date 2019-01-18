let rpc = new eosjs_jsonrpc.default('http://api-kylin.eosasia.one');
let isname = undefined;
let AccountName = undefined;
let pool = undefined;
let debug = true;

function login(defaultPrivateKey, defaultAccountName) {
    if (defaultAccountName)
        name(defaultPrivateKey, defaultAccountName);
    else
        key(defaultPrivateKey);

}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

function log(data, prefix = "") {
    //if (debug) pre.textContent = "\n\n" + prefix + JSON.stringify(data, null, 2) + "\n\n";
}

function log_add(data, prefix = "") {
    //if (debug) pre.textContent = "\n\n" + prefix + JSON.stringify(data, null, 2) + "\n\n" + pre.textContent;
}
async function defrex_get(limit = 10) {
    let ret = await rpc.get_table_rows({
        json: true,
        code: "eoswondefrex",
        scope: "eoswondefrex",
        table: "trades",
        limit: limit
    });
    log(ret, "\n\nTrades Loaded\n\n");
    return ret;
}
