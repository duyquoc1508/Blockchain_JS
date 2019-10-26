const SHA256 = require('crypto-js/sha256');

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block(0, "01/01/2019", "Genesis block", "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

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

let blchain = new Blockchain();
blchain.addBlock(new Block(1, "26/10/2019", { "T1": { "Bob": -500, "Alex": 500 } }));
blchain.addBlock(new Block(1, "26/10/2019", { "T1": { "Ronaldo": -200, "Messi": 200 } }));

blchain.chain[1].data = { amount: 1 };
blchain.chain[1].hash = blchain.chain[1].calculateHash();
blchain.chain[2].previousHash = blchain.chain[1].calculateHash();
blchain.chain[2].hash = blchain.chain[2].calculateHash();


console.log("Is blockchain valid? " + blchain.isChainValid());
