/* based on https://github.com/jbenet/go-base58/blob/master/base58.go */

var base58 = {
    alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
    bigRadix: new BigInteger("58"),

    byte_array: function (s) {
        var arr = [];
        for (var i = 0; i < s.length; i++) {
            arr.push(s.charCodeAt(i));
        }
        return arr;
    },
    string: function (arr) {
        var s = '';
        for (var i = 0; i < arr.length; i++) {
            s += String.fromCharCode(arr[i]);
        }
        return s;
    },

    encode: function (plain) {
        var plain_with_leading_zero = plain.slice();
        plain_with_leading_zero.unshift(0);
        var x = new BigInteger(plain_with_leading_zero, 256);

        var answer = '';

        while (x.compareTo(BigInteger.ZERO) > 0) {
            var mod = new BigInteger();
            x.divRemTo(base58.bigRadix, x, mod);
            answer = base58.alphabet.charAt(Number(mod.toString())) + answer;
        }

        for (var i = 0; i < plain.length; i++) {
            if (plain[i] != 0)
                break;
            answer = base58.alphabet.charAt(0) + answer;
        }

        return answer;
    },
    decode: function (encoded) {
        if (encoded == '')
            return '';

        var answer = new BigInteger("0");
        var j = new BigInteger("1");

        for (var i = encoded.length - 1; i >= 0; i--) {
            var tmp = base58.alphabet.indexOf(encoded.charAt(i));
            if (tmp == -1) {
                return undefined;
            }
            var idx = new BigInteger("" + tmp);
            var tmp1 = new BigInteger(j.toString());
            tmp1.dMultiply(idx);
            answer = answer.add(tmp1);
            j.dMultiply(base58.bigRadix);
        }

        var ans = answer.toByteArray();
        while (ans[0] == 0)
            ans.shift();

        for (var i = 0; i < encoded.length; i++) {
            if (encoded.charAt(i) != base58.alphabet[0]) {
                break;
            }
            ans.unshift(0);
        }

        return ans;
    },
};
word = []