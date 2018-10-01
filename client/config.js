var eos = Eos({
    httpEndpoint: 'https://api1.eosasia.one',
    chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
    keyProvider: "privatekeyhere", // NEED CHANGE
    debug: true
  })
var contract = "1thefull2bot" // NEED CHANGE
var account_tb = "usrbalance"
var symbol = "WDF"
var fee = 10000; //1.0000코인
var feeRstTime = 8 * 3600; // 8시간