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
  let iseoswon = false;
  try {
    await rpc.get_table_rows({
      json: true,
      code: code,
      scope: code,
      table: "info"
    })
    iseoswon = true;
  } catch {
    iseoswon = false;
  };
  if (iseoswon) {
    table = await rpc.get_table_rows({
      json: true,
      code: code,
      scope: code,
      table: "accounts",
      table_key: "id",
      lower_bound: Account,
      upper_bound: Account,
      limit: 1
    });
    if (table.rows.length > 0)
      ret = table.rows[0].balance;
    return ret;
  } else {
    let table = await rpc.get_table_rows({
      json: true,
      code: code,
      scope: Account,
      table: "accounts"
    });
    if (table.rows.length > 0) {
      ret = table.rows[0].balance;
      return ret;
    }
  }
}

async function getNameBalances(Account = AccountName, codes = tokencodes) {
  //if (typeof codes != "object") return "Variable 'codes' must be object array";
  let ret = [];
  let idx = 0;
  await asyncForEach(codes, async (element) => {
    let balance = await getNameBalance(Account, element);
    if (balance != undefined)
      ret[idx++] = {
        element,
        balance
      };
  })
  log(ret, "\n\nBalance Loaded!!!\n\n");
  return ret;
}
async function transfern(to, amount, code, memo) {
  let ret = await api.transact({
    actions: [{
      account: code,
      name: 'transfer',
      authorization: [{
        actor: AccountName,
        permission: 'active',
      }],
      data: {
        from: AccountName,
        to: to.length<=12?to:"",
        quantity: amount,
        memo: memo+(to.length<=12?"":"$"+to)
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

async function claim(idx) {
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