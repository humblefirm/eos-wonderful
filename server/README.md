Service Account - Software Development Toolkit
======


Service Account를 구성하기 위한 nodejs api 서버입니다.
기본으로 9880 포트를 사용합니다.

## SA를 구성하는 방법은 다음과 같습니다.
1. 이오스 계정을 생성합니다.
2. 이오스 계정에 충분한량의 cpu와 net를 구매합니다. 비율은 10:1 정도를 추천합니다.
3. 계정의 안전한 이용을 위해 계정 제공 용 멀티시그 펄미션을 하나 더 생성합니다. (선택)
4. SA.js 파일의 값의 설정을 적절하게 수정합니다.
5. 완료되었습니다. 서버를 ON하고 http api 링크를 배포합니다.

### 이오스 계정 생성 및 스테이킹
[이오스 계정 생성](https://medium.com/@wannabit/쉬운-eos-계정-생성-eostart-com-76a55f98837e)

[자원 스테이킹](http://koreos.io/News/115665)

### (선택) 멀티시그 펄미션 추가 및 권한 설정
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

### nodejs 설정


우선 의존성 패키지를 설치해줍니다.
```
npm install express
npm install request
npm install eosjs
```

SA.js 파일을 열어, 4번째 줄을 확인합니다.
설정에 맞게 변경하면 됩니다.
```
const CA = "humblefirm42"
const SA = "humblefirm42";
const SAwif = "5K9PSYxo3utJu1D6TcccvMCAfNWLWRcN1NRjjr7DQCLrG6S4TBA" // 프라이빗키
const SAperm = "active" 
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
