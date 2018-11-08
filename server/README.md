Service Account - Software Development Toolkit
======

이오스 홀더들은 자신이 가진 이오스 자원을 대부분 사용하지 않습니다.  
홀더는 SA를 구성함으로서 자신이 가진 자원을 사용하고 수수료로 수익을 얻을 수 있습니다.  


Service Account를 구성하기 위한 nodejs api 서버입니다.
기본으로 9880 포트를 사용합니다.

## SA를 구성하는 방법은 다음과 같습니다.
1. 이오스 계정이 없다면 계정을 생성합니다.
2. 이오스 계정에 충분한량의 cpu와 net를 구매합니다. 비율은 10:1 정도를 추천합니다.
3. 계정의 안전한 이용을 위해 계정 제공 용 멀티시그 펄미션을 하나 더 생성합니다. (선택)
4. SA.js 파일에서 구축에 필요로하는 정보를 설정합니다.
5. 완료되었습니다. 서버를 ON하고 http api 링크를 배포합니다.

### 1. 이오스 계정 생성
[이오스 계정 생성](https://medium.com/@wannabit/쉬운-eos-계정-생성-eostart-com-76a55f98837e)

### 2. 스테이킹
[자원 스테이킹](http://koreos.io/News/115665)

### 3. (선택) 멀티시그 펄미션 추가 및 권한 설정
CA : 컨트랙트 계정
SA : 사용할 나의 계정
SAperm : 임의로 설정한 펄미션 이름
SApubkey : EOS8mg3inHz8SHdQGk3CFGWesDNNCDfYwoDLW9adqrKb2GoLNZ9Rc

사용 예
```
cleos set account permission [SA] [SAperm] [SApubkey] active -p [SA]
cleos set action permission [SA] [CA] transfer [SAperm]
```
실제 예제
```
cleos set account permission humblefirm42 pub EOS8mg3inHz8SHdQGk3CFGWesDNNCDfYwoDLW9adqrKb2GoLNZ9Rc active -p humblefirm42
cleos set action permission humblefirm42 humblefirm42 transfer pub
```
이제 SA계정의 SAperm을 이용하여 CA계정에 transfer 액션을 보낼 수 있습니다.

### 4. nodejs 설정


우선 의존성 패키지를 설치해줍니다.
```
npm install express
npm install request
npm install eosjs
```

SA.js 파일을 열어 설정해줍니다.
```
var config = {
    httpEndpoint: 'https://api1.eosasia.one',
    chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
    CA: "eos1thefull1",
    SA: "", //자원을 제공하는 이오스 계정입니다.
    SAkey: "", //수수료를 받을 퍼블릭키입니다.
    SAwif: "", //자원 제공 계정의 프라이빗키입니다.
    SAperm: "active", //프라이빗키와 매칭되는 펄미션입니다.
    MinFee: 0, //수수료로 받을 최소 금액입니다. 숫자 1 당 0.0001 코인입니다.
}
```

설정이 완료되면, node를 실행해줍니다.
```
node SA.js
```

백그라운드로 켜놓기 위한 명령어는 다음과 같습니다.
```
nohup node SA.js &
```

이후 클라이언트에서 http://[IPAdress]:9880 으로 연결하여 SA를 사용할 수 있습니다.
