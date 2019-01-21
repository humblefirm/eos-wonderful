function key(defaultPrivateKey) {
    AccountKey = eosjs_ecc.privateToPublic(defaultPrivateKey);
    isname = false;
    pool = true;
}

async function transferk(to, amount, code, memo) {
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