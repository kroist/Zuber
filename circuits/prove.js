const snarkjs = require("snarkjs");
const fs = require("fs");
const buildEddsa = require("circomlibjs").buildEddsa;
const buildBabyjub = require("circomlibjs").buildBabyjub;
const Scalar = require("ffjavascript").Scalar;

function print(circuit, w, s) {
    console.log(s + ": " + w[circuit.getSignalIdx(s)]);
}

function buffer2bits(buff) {
    const res = [];
    for (let i=0; i<buff.length; i++) {
        for (let j=0; j<8; j++) {
            if ((buff[i]>>j)&1) {
                res.push(1n);
            } else {
                res.push(0n);
            }
        }
    }
    return res;
}

const positions = [
    [50.0647, 19.9750],
    [50.0600, 19.9400],
    [50.0700, 19.9500],
    [50.0300, 19.9500],
    [50.0645, 19.9069],
    [50.0747, 19.9319],
    [50.0260, 19.9294],
    [50.0436, 19.9936],
    [50.0623, 19.9846],
    [50.0463, 19.9249],
];
const lengths = [
    10000,
    20000,
    30000,
    40000,
    50000,
    60000,
    40000,
    30000,
    30000,
    30000,
]

async function run() {

    let msgPriv = 
    [
    ];
    let msgPub = 
    [

    ];
    let msg = [];

    for (let i = 0; i < positions.length; i++) {
        const arr1 = positions[i][0].toFixed(4).toString().split(".");
        const hex1 = parseInt(arr1[0]+arr1[1].slice(3)).toString(16);
        const arr2 = positions[i][1].toFixed(4).toString().split(".");
        const hex2 = parseInt(arr2[0]+arr2[1].slice(3)).toString(16);
        const arr3 = lengths[i].toString();
        const hex3 = parseInt(arr3).toString(16);
        
        msgPriv.push(Buffer.from(hex1 + hex2 + hex3, "hex"));
        // console.log('kek', buffer2bits(msgPriv[i]).length);
        msgPub.push(Buffer.from(hex1 + hex2, "hex"));
        // console.log('lol', buffer2bits(msgPub[i]).length);
        msg.push(Buffer.concat([msgPriv[i], msgPub[i]]));
    }
    // return;
    let eddsa = await buildEddsa();
    let babyJub = await buildBabyjub();
    let F = babyJub.F;

    console.log(msg[0]);

    const prvKey = Buffer.from("0001020304050607080900010203040506070809000102030405060708090001", "hex");

    const pubKey = eddsa.prv2pub(prvKey);

    const pPubKey = babyJub.packPoint(pubKey);

    const signature = msg.map((curmsg) => eddsa.signPedersen(prvKey, curmsg));

    const pSignature = signature.map((cursig) => eddsa.packSignature(cursig));
    const uSignature = pSignature.map((curPsig) => eddsa.unpackSignature(curPsig));

    for (let i=0; i<msg.length; i++) {
        // console.log(eddsa.verifyPedersen(msg[i], uSignature[i], pubKey));
    }
    const msgPubBits = msgPub.map((curmsg) => buffer2bits( curmsg));
    const msgPrivBits = msgPriv.map((curmsg) => buffer2bits( curmsg));
    const r8Bits = pSignature.map((curpsig) => buffer2bits( curpsig.slice(0, 32)));
    const sBits = pSignature.map((curpsig) => buffer2bits( curpsig.slice(32, 64)));
    const aBits = buffer2bits( pPubKey);
    

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      {
        A: aBits, R8: r8Bits, S: sBits, 
        msgPub: msgPubBits,
        msgPriv: msgPrivBits
        }, 
        "build/circuit_js/circuit.wasm", 
        "circuit_0000.zkey"
    );
    console.log(publicSignals);
    console.log(proof);

    const vKey = JSON.parse(fs.readFileSync("verification_key.json"));

    const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    if (res === true) {
        console.log("Verification OK");
    } else {
        console.log("Invalid proof");
    }


}

run().then(() => {
    process.exit(0);
});


