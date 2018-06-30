import SHA256 from "sha256";
import { Decimal } from "decimal.js";
import Cypher from "../lib/cypher";

function getSHA256HexString(input) {
  return SHA256(input).toString();
}

const diff = /^0000/;

const type = {
  SYSTEM: "SYSTEM",
  REWORD: "REWORD",
  NEWBLOCK: "NEWBLOCK"
};

class Blockchain {
  constructor(secretKey, publicKey) {
    this.chain = [];
    this.currentTransactions = [];
    this.nodes = new Set();
    this.cypher = new Cypher(secretKey, publicKey);
    this.publicKey = this.cypher.publicKey;
    this.secretKey = this.cypher.secretKey;
    this.address = getSHA256HexString(this.cypher.publicKey);
    this.genesisBlock();
  }

  hash(obj) {
    const objString = JSON.stringify(obj, Object.keys(obj).sort());

    return getSHA256HexString(objString);
  }

  genesisBlock() {
    this.newTransaction(
      type.SYSTEM,
      "genesis",
      1,
      type.REWORD,
      "genesis block"
    );

    const block = {
      index: this.chain.length + 1,
      timestamp: Date.now(),
      transactions: this.currentTransactions,
      proof: 0,
      previousHash: "genesis",
      owner: "genesis",
      publicKey: "genesis",
      sign: ""
    };
    block.sign = this.cypher.encrypt(this.hash(block));
    this.chain.push(block);

    this.currentTransactions = [];

    console.log("genesis block", this.chain);

    return block;
  }

  newBlock(proof, previousHash) {
    //採掘報酬
    this.newTransaction(type.SYSTEM, this.address, 1, type.REWORD);

    const block = {
      index: this.chain.length + 1,
      timestamp: Date.now(),
      transactions: this.currentTransactions,
      proof: proof,
      previousHash: previousHash || this.hash(this.lastBlock()),
      owner: this.address,
      publicKey: this.publicKey,
      sign: ""
    };
    block.sign = this.cypher.encrypt(this.hash(block));
    this.chain.push(block);

    //リセット
    this.currentTransactions = [];

    console.log("chain", this.chain);

    return block;
  }

  addBlock(block) {
    if (this.validBlock(block)) {
      console.log("blockchain", "addblock");
      this.currentTransactions = [];
      this.chain.push(block);

      console.log("chain", this.chain);
    }
  }

  validBlock(block) {
    const lastBlock = this.lastBlock();
    const lastProof = lastBlock.proof;
    const lastHash = this.hash(lastBlock);
    const owner = block.owner;
    const sign = block.sign;
    const publicKey = block.publicKey;
    block.sign = "";

    if (this.validProof(lastProof, block.proof, lastHash, owner)) {
      console.log("blockchain", "is  valid block");
      if (this.cypher.decrypt(sign, publicKey) === this.hash(block)) {
        console.log("is valid sign");
        return true;
      } else {
        console.log("is not valid sign");
        return false;
      }
    } else {
      console.log("blockchain", "is not valid block");
      return false;
    }
  }

  newTransaction(sender, recipient, amount, data) {
    console.log("new transaction recipent", recipient);
    const tran = {
      sender: sender,
      recipient: recipient,
      amount: amount,
      data: data,
      now: Date.now(),
      publicKey: this.publicKey,
      sign: ""
    };
    tran.sign = this.cypher.encrypt(this.hash(tran));
    this.currentTransactions.push(tran);

    return tran;
  }

  nowAmount(address = this.address) {
    console.log("nouAmount target", address);
    let tokenNum = new Decimal(0.0);
    this.chain.forEach(block => {
      block.transactions.forEach(transaction => {
        if (transaction.recipient === address) {
          tokenNum = tokenNum.plus(new Decimal(parseFloat(transaction.amount)));
        } else if (transaction.sender === address) {
          tokenNum = tokenNum.minus(
            new Decimal(parseFloat(transaction.amount))
          );
        }
      });
    });
    this.currentTransactions.forEach(transaction => {
      if (transaction.recipient === address) {
        tokenNum = tokenNum.plus(new Decimal(parseFloat(transaction.amount)));
      } else if (transaction.sender === address) {
        tokenNum = tokenNum.minus(new Decimal(parseFloat(transaction.amount)));
      }
    });
    return tokenNum.toNumber();
  }

  validTransaction(transaction) {
    const amount = transaction.amount;
    const sign = transaction.sign;
    const publicKey = transaction.publicKey;

    const address = transaction.sender;

    transaction.sign = "";
    if (this.cypher.decrypt(sign, publicKey) === this.hash(transaction)) {
      console.log("valid transaction sign");
      const balance = this.nowAmount(address);
      if (balance > amount) {
        console.log("valid transaction balance");
        return true;
      } else {
        console.log("not valid transaction no balance", balance, amount);
        return false;
      }
    } else {
      console.log("not valid transaction sign");
    }
  }

  addTransaction(tran) {
    if (this.validTransaction(tran)) {
      this.currentTransactions.push(tran);
    }
  }

  lastBlock(blockchain = this.chain) {
    return blockchain[blockchain.length - 1];
  }

  proofOfWork() {
    const lastBlock = this.lastBlock();
    const lastProof = lastBlock.proof;
    const lastHash = this.hash(lastBlock);

    let proof = 0;

    while (!this.validProof(lastProof, proof, lastHash, this.address)) {
      proof++;
    }

    return proof;
  }

  validProof(lastProof, proof, lastHash, address) {
    const guess = `${lastProof}${proof}${lastHash}${address}`;
    const guessHash = getSHA256HexString(guess);

    return diff.test(guessHash);
  }

  validChain(chain) {
    let index = 1;

    while (index < chain.length) {
      const previousBlock = chain[index - 1];
      const block = chain[index];

      // Check that the hash of the block is correct
      if (block.previousHash !== this.hash(previousBlock)) {
        return false;
      }

      // Check that the Proof of Work is correct
      if (
        !this.validProof(
          previousBlock.proof,
          block.proof,
          this.hash(block),
          block.owner
        )
      ) {
        return false;
      }

      index++;
    }

    return true;
  }
}

export default Blockchain;
