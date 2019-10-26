const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
  /**
   * @param {string} fromAddress
   * @param {string} toAddress
   * @param {number} amount
   */
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }

  /**
   * @returns {string}
   */
  calculateHash() {
    return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
  }

  /**
   * Sign a transaction with signingkey
   * @param {string} signingKey 
   */
  signTransaction(signingKey) {
    //only send a transaction from the wallet that is linked
    if (signingKey.getPublic('hex') !== this.fromAddress) {
      throw new Error('You cannot sign transactions for other wallet!');
    }
    // Calculate the hash of this transaction, sign it with the key
    // and store it inside the transaction obect
    const hashTx = this.calculateHash();
    const sig = signingKey.sign(hashTx, 'base64');
    this.signature = sig.toDER('hex');
  }
  /**
   * check if the signature is valid
   * @returns {boolean}
   */
  isValid() {
    // reward for miner from supplier
    if (this.fromAddress === 'Supplier') return true;

    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature in this transaction');
    }

    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

class Block {
  /**
   * 
   * @param {string} timestamp 
   * @param {Transaction[]} transactions 
   * @param {string} previousHash 
   */
  constructor(timestamp, transactions, previousHash = '') {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }
  /**
   * return SHA256 of block
   * @returns {string}
   */
  calculateHash() {
    return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
  }

  /**
   * Starts mining process on the block. Change 'nonce' until hash of block starts with enough zore (=difficulty)
   * @param {number} difficulty 
   */
  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log("Block mined: " + this.hash);
  }

  /**
   * Validate all transactions inside block (signature + hash)
   * @returns {boolean}
   */
  hasValidTransactions() {
    for (const trans of this.transactions) {
      if (!trans.isValid()) {
        return false;
      }
    }
    return true;
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.penddingTransactions = [];
    this.miningReward = 100;
  }

  /**
   * @returns {Block}
   */
  createGenesisBlock() {
    return new Block("01/01/2019", "Genesis block", "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Create block and mining block, create new transaction is reward for miner
   * @param {string} miningRewardAddress 
   */
  minePeddingTransactions(miningRewardAddress) {
    let block = new Block(Date.now(), this.penddingTransactions);
    block.mineBlock(this.difficulty);

    console.log('Block successfuly mined!');
    this.chain.push(block);
    this.penddingTransactions = [
      new Transaction('Supplier', miningRewardAddress, this.miningReward)
    ];
  }

  /**
   * Add the new transaction to the list of pending transactions
   * @param {Transaction} transaction 
   */
  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include from and to address');
    }

    console.log(transaction);

    if (!transaction.isValid()) {
      throw new Error('Cannot add invalid transaction to chain');
    }

    this.penddingTransactions.push(transaction);
  }

  /**
   * Return the balance of a given wallet address
   * @param {string} address 
   * @returns {number}
   */
  getBalanceOfAddress(address) {
    let balance = 0;
    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount
        }
        if (trans.toAddress === address) {
          balance += trans.amount
        }
      }
    }
    return balance;
  }

  /**
   * 
   * @param {string} address 
   */
  getAllTransactionsForWallet(address) {
    const allTransaction = [];
    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address || trans.toAddress === address) {
          allTransaction.push(trans);
        }
      }
    }
    return allTransaction
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      //signature are correct
      if (!currentBlock.hasValidTransactions()) {
        return false;
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
