pragma circom 2.0.0;

include "node_modules/circomlib/circuits/eddsa.circom";

template SigVerifier(nBits, nSigs) {
    signal input msgPriv[nSigs][32];
    signal input msgPub[16];

    signal input A[256];
    signal input R8[nSigs][256];
    signal input S[nSigs][256];

    signal msg[nSigs][48];
    for (var i = 0; i < nSigs; i++) {
        for (var j = 0; j < 32; j++) {
            msg[i][j] <== msgPriv[i][j];
        }
        for (var j = 0; j < 16; j++) {
            msg[i][j + 32] <== msgPub[j];
        }
    }

    component verifier[nSigs];
    for (var i = 0; i < nSigs; i++) {
        verifier[i] = EdDSAVerifier(nBits);
        verifier[i].A <== A;
        verifier[i].R8 <== R8[i];
        verifier[i].S <== S[i];
        verifier[i].msg <== msg[i];
    }
    
    signal output c;
    
    c <== msg[0][0];
}

component main {public [msgPub, A]} = SigVerifier(48, 5);

