dApp Client - Software Developement Toolkit
======

데모용 기능을 모두 사용할 수 있는 최소 기능 페이지입니다.  
config.js 파일을 수정하여 사용할 수 있습니다.


## 설명

클라이언트를 사용하기 위해서는 SA 서버와 연결하는 작업이 필요합니다.  
config.js 파일을 열어주세요.



타인 혹은 직접 구축한 SA서버의 주소를 설정해주세요.
```
var SAurl = "http://http://35.194.102.54:9880" // SA HTTP API 주소입니다.
```



EOS 체인에 접속하기 위한 주소입니다.   
table 목록을 지원하는 노드의 API http 주소를 입력해주세요.  
기본 설정은 모든 기능을 지원하는 eosasia의 주소입니다.
```
var eos = Eos({
    httpEndpoint: 'https://api1.eosasia.one', // EOS http 노드 주소입니다.
    chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
    debug: true
  })
```



EOS 체인에서 데이터를 불러올 때 사용하는 CA 계정 정보를 입력해주세요.  
계정명과 심볼을 입력하면 됩니다.
```
var contract = "humblefirm42" // CA 계정명입니다.
var symbol = "COF" // 심볼명입니다.
```

