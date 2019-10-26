const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const { Blockchain, Transaction } = require('./blockchain');

const myKey = ec.keyFromPrivate('317abde5cd123476700d075036eb59b9d65a1ecbad02e6cc2e199566dc138c79');
const myWalletAddress = myKey.getPublic('hex');

let blchain = new Blockchain();
const tx1 = new Transaction(myWalletAddress, 'to Address', 10);
tx1.signTransaction(myKey);
blchain.addTransaction(tx1);

console.log('\n Starting the miner...');
blchain.minePeddingTransactions(myWalletAddress);

console.log('\n Balance is ', blchain.getBalanceOfAddress(myWalletAddress));




