let rpc = new eosjs_jsonrpc.default('https://kylin.eoscanada.com');
let isname = undefined;
let AccountName = undefined;
let AccountKey = undefined;
let pool = undefined;
let debug = true;
let tokencodes = ["eosio.token", "eoswontoken1", "eoswontoken2", "eoswontoken3", "eoswontoken4", "eoswontoken5"];

function login(defaultPrivateKey, defaultAccountName) {
  if (defaultAccountName)
    name(defaultPrivateKey, defaultAccountName);
  else
    key(defaultPrivateKey);

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
async function makeKey() {
  // 수학적으로 안전한 프라이빗키를 하나 생성
  await eosjs_ecc.randomKey().then(v1 => {
    //생성된 프라이빗키에서 퍼블릭키 추출
    var key = eosjs_ecc.privateToPublic(v1);
    privateKey = v1;
    publicKey = key;
  })
}
async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}


function log(data, prefix = "") {
  if (debug) console.log("\n\n" + prefix + JSON.stringify(data, null, 2) + "\n\n");
}

function log_add(data, prefix = "") {
  if (debug) console.log("\n\n" + prefix + JSON.stringify(data, null, 2) + "\n\n");
}
async function defrex_get(limit = 10) {
  let ret = await rpc.get_table_rows({
    json: true,
    code: "eoswondefrex",
    scope: "eoswondefrex",
    table: "trades",
    limit: limit
  });
  ret = tradesPercentage(ret);
  log(ret, "\n\nTrades Loaded\n\n");
  return ret;
}

function tradesPercentage(trades) {
  let $ret
  $ret = trades;
  $ret.rows.forEach(row => {
    A = parseFloat(row.A.reserve);
    B = parseFloat(row.B.reserve) * row.ratio;
    row.A.percent = parseFloat(A / (A + B) * 100);
    row.B.percent = parseFloat(B / (B + A) * 100);
  });
  return $ret
}
async function transfer(to, amount, code, memo) {
  if (isname) transfern(to, amount, code, memo)
  else transferk(to, amount, code, memo)
}