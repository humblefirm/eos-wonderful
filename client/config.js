var SAurl = "http://35.194.102.54:9880"
/*var eos = Eos({
    httpEndpoint: 'https://api1.eosasia.one',
    chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
    debug: true
  })*/
var eos = Eos({
  httpEndpoint: 'https://api-kylin.eosasia.one',
  chainId: '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191',
  debug: true
})
var contract = "humblefirm42" // NEED CHANGE
var symbol = "COF"
var account_tb = "usrbalance"
var fee = 10000; //1.0000코인
var feeRstTime = 8 * 3600; // 8시간