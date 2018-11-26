/* Sample function that returns boolean in case the browser is Internet Explorer*/
function isIE() {
  ua = navigator.userAgent;
  /* MSIE used to detect old browsers and Trident used to newer ones*/
  var is_ie = ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1;
  
  return is_ie; 
}
/* Create an alert to show if the browser is IE or not */
if (isIE()){
    alert('인터넷 익스플로러에서는 데모 기능이 정상적으로 동작하지 않을 수 있으니 다른 브라우저를 이용해 주세요.');
}else{
    //alert('It is NOT InternetExplorer');
}