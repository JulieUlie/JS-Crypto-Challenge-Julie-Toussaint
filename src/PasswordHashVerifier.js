const sodium = require('libsodium-wrappers');
 
module.exports = async(hashedPw, pw) => {
    await sodium.ready

    return Object.freeze({
        pw: pw,
        hashedPw: hashedPw,
        verify: (hashedPw, pw) => {
            return sodium.crypto_pwhash_str_verify(hashedPw, pw);
        }
    })
}