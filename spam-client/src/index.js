const algosdk = require('algosdk');

const main = async () => {

    // // create client object to connect to sandbox's algod client
    const algodToken = '5b30199b55e0653c64929b5c6b0c99cde253022b0a36ae962c8ab8f93773e643';
    const algodServer = 'http://localhost';
    const algodPort = 35343;
    algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
    const last_round = await algodClient.status().do()
    const block_number = last_round['last-round']
    let a = await algodClient.block(block_number).do()
    console.log(a)

    // let account = algosdk.generateAccount();
    // let passphrase = algosdk.secretKeyToMnemonic(account.sk);
    // console.log("My address: " + account.addr);
    // console.log("My passphrase: " + passphrase);
    // let accountInfo = await algodClient.accountInformation(account.addr).do();
    // console.log("Account balance: %d microAlgos", accountInfo.amount);
    // generateAlgorandKeyPair()
}

function generateAlgorandKeyPair() {
    // let account = algosdk.generateAccount();
    // let passphrase = algosdk.secretKeyToMnemonic(account.sk);
    // console.log("My address: " + account.addr);
    // console.log("My passphrase: " + passphrase);
    // let accountInfo = await algodClient.accountInformation(myAccount.addr).do();
    // console.log("Account balance: %d microAlgos", accountInfo.amount);
}

main()
