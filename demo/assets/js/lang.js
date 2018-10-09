
$(document).ready(function () {
var currentLang='ko';
// 언어팩 선언.
$.lang = {};

$.lang.ko = {
    0: '안녕하세요! 실생활에 적용 가능한<br />퍼블릭 체인 기반의 댑 제작 플랫폼 <strong>이오스원더풀</strong>입니다!',
    1: '블록체인을 모르는 일반인도 사용 가능한 댑을 만들 수 있습니다.<br />누구나 쉽고, 저렴하고, 안전하게',
    2: '둘러보기',
    3: '데모용 댑',
    4: '퍼블릭 블록체인으로 만들어진 정말 탈중앙화된 댑은 왜 폰지, 도박, 거래소 밖에 없나요?<br />퍼블릭 블록체인은 사용하기엔 접근성이 떨어지고, 비용이 높기 때문입니다.<br />하지만 지금부터는 괜찮습니다! 이오스원더풀을 이용하면 쉽고 저렴하게 퍼블릭 블록체인 댑을 만들 수 있으니까요.<br /><h5>하단에서 <strong>이오스원더풀을 이용해 만든 간단한 댑을 테스트</strong> 해볼 수 있습니다!</h5>',
    5: '<h3>안녕하세요!</h3> 이오스 원더풀을 이용해서 만들어진 댑을 이용해보시겠어요?<br />어렵지 않아요. 우선 하단의 설명을 읽고 계좌를 만들어보세요. <br />',
    6: '<p data-langNum="6">사용할 계좌를 만들어 주세요! <br />퍼블릭키는 내 계좌 주소가, 프라이빗키는 계좌의 접근권한이 됩니다.<br />이전에 사용하던 프라이빗키를 입력하면, 이전 계좌에 접근할 수 있습니다. <br />',
    7: '<h4>계좌를 만들었나요? 축하드립니다!</h4><br />하지만 아직은 아쉽게도 키의 형태로만 존재할 뿐, 블록체인에 기록되지는 않았습니다. <br />이오스원더풀은 이더리움과 비슷하게 Key-Account 방식을 이용하기 때문에 계좌에 코인이 입금되는 순간부터 기록되기 때문이죠.<br />앗! 코잇이 없어서 걱정이라구요? 그럼 반가우니 몰래 조금 드리겠습니다! ;D <br />',
    8: '계좌를 입력해주시면 코인을 넣어드릴게요.<br />환영 선물이라고 생각해 주세요!',
    9: '<h4>축하합니다!</h4>방금 실제 이오스 블록체인에 코인과 함께 나만의 계좌가 생겼어요! 다시 한번 축하드려요!<br />어디 한번 내 계좌를 탐색해 볼까요? 두구두구두구...<br />',
    10: '계좌 주소를 입력하고 버튼을 눌러보세요!<br />과연 몇 코인이나 있을까요? <br />',
    11: '<h4>우와! 대박!</h4><a name="faucet_val"></a> 코인이나 있네요! 축하해요! <br /> 이게 비트코인이었으면 좋을텐데 말이죠 ;D <br />지금 갖고 계신 WDF 코인은 EOS 코인과 마찬가지로 소수점 4자리 까지 분리가 가능해요!<br />이제 내가 가진 코인을 좋아하는 대상에게 전송해 볼게요.<br /><strong>충격적이게도... 이 데모용 댑은 송금 기능 외에는 코인을 사용하는 기능이 없어요 T,T</strong><br /><a href="https://github.com/humblefirm/eos-wonderful/tree/master/client" target="_blank">직접 WDF 코인을 사용하는 댑을 만들어보고 싶지 않나요?</a><br /><a href="https://blog.naver.com/onethefullplatform/221362170050" target="_blank">이오스 원더풀을 이용해 만든 댑이 이것 외에도 이미있어요! 커피코인 코코를 소개합니다!</a> <br />',
    12: '좋아하는 대상의 계좌를 모르신다구요?<br />제가 계좌를 안알려드렸군요. <br />제 계좌는 이거에요!<br />EOS6fETniF1jQpk6Nj4hYf4gGfwCdz4tH74c5kQqu1PRqpvbaogDj',
    13: '<h4>코인이 보내졌어요!</h4>방금 블록체인을 사용해 직접 코인을 보냈어요! 정말 대단하네요! <br />어떤가요? 생각보다 어렵지 않죠?<br />그럼 이제 코인이 잘 보내졌는지 확인해볼까요?<br />우선 내 계좌와 대상의 계좌를 조회해보세요. 코인이 잘 보내졌나요? <br />',
    14: '내 계좌와 보낸 대상의 계좌를 한번씩 조회해보세요!',
    15: '<h4>앗! 저게 뭔가요?</h4>내가 보낸 코인 외에 약 1 WDF 코인이 Fee(수수료)로 바뀌었네요! <br />정상이니 너무 놀라지 마세요. 코인의 무차별적인 송금을 막기 위해 수수료로 홀딩된거에요! <br />마지막 전송 시점으로부터 8시간이 지나면 모든 수수료를 돌려 받을 수 있으니 걱정말아요. <br />아쉽지만, <a href="https://eosflare.io/account/eos1thefull1" target="_blank">댑의 모든 트랜잭션 기록</a>을 보여드리고 여기서 여정을끝내야겠어요.<br />만약 우리의 여정이 즐거웠다면, 앞으로도 이오스원더풀이 걸어갈 수 많은 여정에 동참해주세요. <br />언제까지나 기다리고 있을게요. 고생 많았어요. 안녕!<br />',
    16: '원더풀플랫폼에서는 이미 이오스원더풀로 소상공인을 위한 커피코인 서비스를 제공하고 있어요! <br />커피코인은 벌써 100여곳의 카페에서 사용중이랍니다!',
    17: '블라썸',
    18: '차뜨',
    19: '비타민',
    20: '콩당',
    21: '마타리',
    22: '크레페드림',
    23: '미스터브리즈',
    24: '티하우스',
    25: '레이앤크림',
    26: '<a href="https://blog.naver.com/PostView.nhn?blogId=onethefullplatform&logNo=221360751690&categoryNo=9&parentCategoryNo=&from=thumbnailList" target="_blank">혹시 카페를 운영하고 계시면 무료로 커피코인 가맹점이 돼보세요!</a><br />혹시 그거 알아요? 커피코인이 지금 에어드랍 중이래요! 가맹점에 방문하면 커피코인을 받을 수 있대요!<br />지금 코코앱을 <a href="https://play.google.com/store/apps/details?id=com.onethefull.coffeecoinweb&hl=ko" target="_blank">다운로드</a>하시면 코인도 받고, 가맹점도 찾을 수 있어요! 매일 마시는 커피, 이오스원더풀과 함께해요!</p>',
    27: '블록체인 프로젝트 컨설팅, 이오스원더풀 적용 혹은 토큰 모델링/스마트컨트랙 개발에서 도움이 필요하시다면 연락주세요!</p></br><A href="mailto:sales@1thefull.com,r3v4@1thefull.com,kstae@1thefull.com?subject=이오스 원더풀 문의">이메일 문의</A>',
    28: '어떤 계좌로 코인을 보내고 싶으신가요?',
    29: '계좌를 찾을 수 없습니다!',
    30: '얼마나 보내실래요?',
    31: '전송 성공. 트랜잭션을 확인하시겠습니까?'
};

$.lang.en = {
    0: 'Welcome to the trial version<br />of a real actual public blockchain based dApp platform<strong>EOSWonderful</strong>',
    1: 'Don’t understand Blockchain? No worries. Anyone can make a blockchain dApp.<br />It’s simple, cost effective, secure and safe',
    2: 'More Info',
    3: 'Trial dApp',
    4: 'Why are public blockchains are often linked to pontze’s, illegal gambling & fraudulent trading scheme’s? <br />The reasons are accessibility and costs of using public blockchains.<br />But now its all settled! EOSWonderful offers a safe and swift solutions to use public blockchains at a cost effective rate to create dApp’s for your use. <br /><h5> Below <strong>you can use EOSWonderful to test a simple working dApp! </strong></h5>',
    5: '<h3>Welcome!</h3> Would you like to try our EOSWonderful dAPP? <br />It’s quite Simple. First, read the following and create your own account. <br />',
    6: '<p data-langNum="6">Create my account!<br /> Public key is my account ID, whilst Private key allows access to the account.<br /> You can enter your previous private key to enter your previous account <br />',
    7: '<h4>Congratulations! Now you have an account!</h4><br /> But currently its only in A key format and not logged into the Blockchain yet. <br /> EOSWonderful is similar to Ethereum creating a Key-Account where the Blockchain starts once there are coins allocated into the account.<br /> Hold on! Worried that you don’t have coins? Let me give you some! <br />',
    8: 'Input your account and I will provide you with some coins.<br /> Let’s say it’s a welcome gift!',
    9: '<h4>Congratulations!</h4>Now you have actually created an account and received coin in the EOS Blockchain platform!<br /> Now lets look at the account details!<br />',
    10: 'Input Account address and click!<br />How many coins have I got? <br />',
    11: '<h4>Wow! Surprise!</h4><a name="faucet_val"></a> You do have coins! Congrats! <br /> Too bad there not Bitcoins <br /> The current WDF Coins, like EOS Coins displays up to 4 decimals points!<br /> How about transferring your coins to another person? <br /><strong> Unfortunately, this trial dApp is only limited to show how to transfer actual coins</strong><br /><a href="https://github.com/humblefirm/eos-wonderful/tree/master/client" target="_blank"> Wouldn’t you want to create more dApp’s utilizing WDF coins?</a><br /><a href="https://blog.naver.com/onethefullplatform/221362170050" target="_blank">EOSWonderful has already started another dApp! Its called COCO Coffee Coin!</a> <br />',
    12: 'Maybe you don’t know whom you want to transfer your coins to?<br />Let me tell you my account. <br />This is my account!<br />EOS6fETniF1jQpk6Nj4hYf4gGfwCdz4tH74c5kQqu1PRqpvbaogDj',
    13: '<h4>Coin transfer complete!</h4> You just transferred coin through a Blockchain! Congrats! <br />How is it? Its not that difficult right?<br /> Now let’s see if the coin was transferred in safe and secure environment<br /> Firstly, check my account details. Has the coin been transferred? <br />',
    14: 'Check my account and the peers account!',
    15: '<h4>Wait! What’s this?</h4> Other than my coin amount, there is a transaction fee Of 1 WDF! <br />This is normal. Don’t be alarmed. To prevent illegal transactions and volume control, the transaction fee is held for 8 hours only. It will be returned to your account after all transactions have been made! <br /> Unfortunately, <a href="https://eosflare.io/account/eos1thefull1" target="_blank">Let me show you all of the dApp transactions to end this simple trial tutorial.<br /> If this tutorial was good, be a part of EOSWonderful and lets create more together! <br /> We will always be here waiting! Seeya~<br />',
    16: 'Wonderful Platform has created EOSWonderful and utilized this Blockchain service To provide a more safe, secure and additional services for SME’s, especially privately owned coffee shops! <br />Our COCO Coffee Coin has already reached out to over 100 Coffee Shops!',
    17: 'Blossom',
    18: 'Chad',
    19: 'Vitamin',
    20: 'Congdang',
    21: 'Matari',
    22: 'Crepedream',
    23: 'Mister Brothers',
    24: 'Teashouse',
    25: 'Rey and Cream',
    26: '<a href="https://blog.naver.com/PostView.nhn?blogId=onethefullplatform&logNo=221360751690&categoryNo=9&parentCategoryNo=&from=thumbnailList" target="_blank">If you own a small coffee shop, try out our FREE (3month trial) Coffee Coin and become a Blockchain member!</a><br /> Did you know that? Coffee Coin is now being Airdropped! You can get coins if you visit any of our Coffee shops!<br /> The COCO App <a href="https://play.google.com/store/apps/details?id=com.onethefull.coffeecoinweb&hl=ko" target="_blank">Can be Downloaded</a> and get coins! <br />You can also find membered coffee shops too! Become a member and be a part of EOSWonderful!</p>',
    27: 'Blockchain Project Consulting, Utilizing EOSWonderful for Token Modelling/SmartContracts. Contact us for more information. We are happy to Consult!</p></br><A href="mailto:sales@1thefull.com,r3v4@1thefull.com,kstae@1thefull.com?subject=EOSWonderful Contact">이메일 문의</A>'
};

	
$.lang.ch = {
    0: '您好！基于公共连锁的生产平台<strong> EOS-Wonderful</ strong>！'
};
setLanguage('ko');
});
/**
* setLanguage 
* use $.lang[currentLanguage][languageNumber]
*/
function setLanguage(currentLanguage) {
  console.log('setLanguage', arguments);
  
  $('[data-langNum]').each(function() {
    var $this = $(this); 
    $this.html($.lang[currentLanguage][$this.data('langnum')]); 
  });	
}  

// 언어 변경
function changeLang(lang) {
  setLanguage(lang); 
  currentLang=lang;
};

/*
추가적으로 유용한 처리.
1. 브라우저 언어에 따라 최초 언어 셋팅하기
2. 외부에서 URL ?lang=ja 접근시 셋팅하기
3. 언어 변경시 쿠키에 언어코드 저장해서 재접속시 쿠키 기준으로 언어 셋팅.
*/