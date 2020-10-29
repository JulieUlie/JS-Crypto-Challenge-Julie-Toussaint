const sodium = require('libsodium-wrappers');
 
module.exports = async(verifyingKey) => {
    await sodium.ready
    const keys = sodium.crypto_sign_keypair();
    let pvtKey = keys.privateKey;
    verifyingKey = keys.publicKey;

    return Object.freeze({
        verifyingKey: verifyingKey,
        sign: (msg) => {
            return sodium.crypto_sign(msg, pvtKey);
        }
    })
}