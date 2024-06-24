pragma circom 2.0.0;

include "node_modules/circomlib/circuits/eddsa.circom";
include "node_modules/circomlib/circuits/bitify.circom";
include "node_modules/circomlib/circuits/comparators.circom";

template SigVerifier(nBits, nSigs) {
    signal input msgPriv[nSigs][32];
    signal input msgPub[16]; //pub
    signal input lens[nSigs];
    signal input jIndex; //pub 
    signal input lensj;

    signal input A[256]; //pub
    signal input R8[nSigs][256];
    signal input S[nSigs][256];

    signal msg[nSigs][48];

    signal sum[nSigs+1];
    
    sum[0] <== 1;
    component b2n[nSigs];
    component leq[nSigs];
    for (var i = 0; i < nSigs; i++) {
        for (var j = 0; j < 32; j++) {
            msg[i][j] <== msgPriv[i][j];
        }
        for (var j = 0; j < 16; j++) {
            msg[i][j + 32] <== msgPub[j];
        }

        leq[i] = LessEqThan(16);
        leq[i].in[0] <== lensj;
        leq[i].in[1] <== lens[i];
        leq[i].out === 1;
        sum[i+1] <== sum[i] * ((jIndex-i)+(lensj - lens[i]));
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

component main {public [msgPub, A, jIndex]} = SigVerifier(48, 5);

