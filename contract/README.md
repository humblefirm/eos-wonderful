Contract Account (CA) 용 Smart-contract Code
======

CA를 구성하기 위한 스마트컨트랙트 코드입니다.  

컨트랙 코드를 올리기 위해 700KB 이상의 여유 램이 필요합니다.  

유저 1인당 210Byte 가량의 램을 추가로 소모합니다.  

## 수수료
SA를 대상으로하는 Dos 공격을 방지하기 위해 전송시 일정량의 코인이 스테이킹 딥니다.  

스테이킹되는 코인은 지정된 시간이 지나면 100% 환불됩니다.  

스테이킹 시간과 양은 직접 지정할 수 있습니다.  

기본 설정은 다음과 같습니다.  

super.token.cpp:19-20
```
	uint64_t transfer_fee = 10000; // 1.0000 코인
	uint64_t feeRstTime = 8 * HOUR * 1000 * 1000; // 8시간
```

이 경우, 전송마다 1코인이 스테이킹되며, 마지막 전송 시점으로부터 8시간이 지나면 100% 환불 받게됩니다.  

2시간이 지난 경우 1/4, 4시간이 지난 경우 1/2를 환불 받습니다.  

환불 액수 계산에 사용되는 단위 시간은 ms입니다.  

## 사용법
1. 계정을 생성하고, 700KB 이상의 램을 구매합니다. cpu도 약 100ms 이상을 권장합니다.  
2. 생성한 계정에 스마트컨트랙트를 업로드합니다.  
3. 적절한 양의 코인을 발행합니다.
4. 계정을 탈중앙화 시킵니다. (선택)

1번 2번 설명은 충분한 예제가 많으므로 건너 뛰고 설명합니다.
  
### 코인 발행

#### 사용 법
```
cleos push action [CA] mint '["[FROM(String)]","[TO(PublicKey)]","10000.0000 WDF", "[MEMO]"]'
```
#### 사용 예
```
cleos push action humblefirm42 mint '["Minter","EOS8mg3inHz8SHdQGk3CFGWesDNNCDfYwoDLW9adqrKb2GoLNZ9Rc","100000000.0000 COF", "First_mint"]'
```

### 계정 탈중앙화
해당 컨트랙은 CA권한으로 신규 코인 발행, 특정 계정의 수정 및 삭제가 가능합니다.

강력한 관리 기능을 CA가 갖기 때문에, 완전히 중앙화되어 있다고 볼 수 있습니다.

하지만 그덕에 각종 문제나 오류에 빠른 대응이 가능하고, 업데이트가 가능합니다.

만약 탈중앙화가 요구되는 상황이라면, 아래의 절차에 따라 계정을 탈중앙화 할 수 있습니다.
절차에 따르게 되면, CA계정의 관리 권한을 박탈 당하고, BP들만이 계정에 접근할 수 있게 됩니다.

추후 문제가 발생하는 경우, [ECAF-(The EOSIO Core Arbitration Forum)](https://eoscorearbitration.io)의 협조를 받아 계정에 접근할 수 있습니다.

탈중앙화 작업은, 계정의 owner, active 권한을 BP멀티시그로 변경함으로서 적용합니다.

사용자는 몇개의 BP 동의를 얻는지를 설정하여 탈중앙화 강도를 정할 수 있습니다.
```
eosio.prods@active // 21개 중 15개 이상 동의
eosio.prods@prod.major // 21개 중 11개 이상 동의
eosio.prods@prod.minor // 21개 중 8개 이상 동의
```

위 3개중 정책에 적합한 하나를 선택하고, 아래와 같이 진행합니다.
1. 액티브 권한 삭제
2. 오너 권한 변경

#### 액티브 권한 삭제
```
cleos set account permission [CA] active '{"threshold": 1, "accounts": [{"permission": {"actor": "[CA]", "permission": "active"}, "weight": 1}]}'
```
active권한을 [CA]@active 권한으로 재귀 시켜, 권한 소유주를 삭제합니다.

예제
```
cleos set account permission humblefirm42 active '{"threshold": 1, "accounts": [{"permission": {"actor": "humblefirm42", "permission": "active"}, "weight": 1}]}'
```
#### 오너 권한 변경
```
cleos set account permission [CA] owner '{"threshold": 1, "accounts": [{"permission": {"actor": "eosio.prods", "permission": "[active/prod.major/prod.minor]"}, "weight": 1}]}' -p [CA]@owner
```
owner 권한을 eosio.prods로 변경합니다.

예제
```
cleos set account permission humblefirm42 owner '{"threshold": 1, "accounts": [{"permission": {"actor": "eosio.prods", "permission": "prod.minor"}, "weight": 1}]}' -p humblefirm42@owner
```


### 마무리
4번까지 진행한 경우, 해당 계정은 완전히 탈중앙화 됩니다.  
이제 작성된 CA위에서 SA와 댑을 구성해보세요.