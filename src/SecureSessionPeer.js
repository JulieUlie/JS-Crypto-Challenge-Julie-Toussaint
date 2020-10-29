const sodium = require('libsodium-wrappers');
const Encryptor = require('./Encryptor.js');
const Decryptor = require('./Decryptor.js');

module.exports = async(peer = null) => {
    await sodium.ready;
    const {publicKey, privateKey} = sodium.crypto_kx_keypair();
    
    let secureSession = {}, sessionKeys, msgFromPeer, encryptor, decryptor;
   
    if (peer) {
        secureSession = peer;

        sessionKeys = {sharedTx, sharedRx} 
                    = sodium.crypto_kx_server_session_keys(publicKey, privateKey, secureSession.publicKey);
        
        encryptor = await Encryptor(sessionKeys.sharedTx);
        decryptor = await Decryptor(sessionKeys.sharedRx);

        await peer.connection(publicKey);
    }
    
    let secureObject = {};
    secureObject.publicKey = publicKey;

    secureObject.encrypt = (msg) => {
        const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
        const ciphertext = encryptor.encrypt(msg, nonce);
        return { ciphertext, nonce };
    }
    secureObject.decrypt = (ciphertext, nonce) => {
        return decryptor.decrypt(ciphertext, nonce);
    }

    secureObject.setSession = (Session) => {
        secureSession = Session;
    }
    secureObject.setMessage = (msg) => {
        msgFromPeer = msg;
    }

    secureObject.send = (msg) => {
        let encryptedMsg = secureObject.encrypt(msg);
        secureSession.setMessage(encryptedMsg);
    }
    secureObject.receive = () => {
        return secureObject.decrypt(msgFromPeer.ciphertext, msgFromPeer.nonce);    
    }

    secureObject.connection = async (publicKey2) => {
        sessionKeys = {sharedTx, sharedRx} 
                    = sodium.crypto_kx_client_session_keys(publicKey, privateKey, publicKey2);
        encryptor = await Encryptor(sessionKeys.sharedTx);
        decryptor = await Decryptor(sessionKeys.sharedRx);
    }

    if (peer) {
        peer.setSession(secureObject);
    }

    return Object.freeze(secureObject);
}