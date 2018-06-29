import SHA256 from "sha256";

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
  constructor(_id) {
    this.chain = [];
    this.currentTransactions = [];
    this.nodes = new Set();
    this.id = _id;

    // Create the genesis block
    this.newBlock(100, "1");
  }

  hash(block) {
    // We must make sure that the attributes are ordered, or we'll have inconsistent hashes
    //
    const blockString = JSON.stringify(block, Object.keys(block).sort());

    // Return the hash in hex format

    return getSHA256HexString(blockString);
  }

  newBlock(proof, previousHash) {
    const block = {
      index: this.chain.length + 1,
      timestamp: Date.now(),
      transactions: this.currentTransactions,
      proof: proof,
      //"||"はもし後ろのものが存在すれば代入
      previousHash: previousHash || this.hash(this.lastBlock()),
      owner: this.id
    };

    //採掘報酬
    this.newTransaction(type.SYSTEM, this.id, 1, type.REWORD);

    // Reset the current list of transactions
    this.currentTransactions = [];
    this.chain.push(block);

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

    if (this.validProof(lastProof, block.proof, lastHash, owner)) {
      console.log("blockchain", "is  valid block");
      return true;
    } else {
      console.log("blockchain", "is not valid block");
      return false;
    }
  }

  newTransaction(sender, recipient, amount, data) {
    const now = Date.now();
    const tran = {
      sender,
      recipient,
      amount,
      data,
      now
    };
    this.currentTransactions.push(tran);

    return tran;
  }

  addTransaction(tran) {
    this.currentTransactions.push(tran);
  }

  lastBlock(blockchain = this.chain) {
    return blockchain[blockchain.length - 1];
  }

  proofOfWork() {
    const lastBlock = this.lastBlock();
    const lastProof = lastBlock.proof;
    const lastHash = this.hash(lastBlock);

    let proof = 0;

    while (!this.validProof(lastProof, proof, lastHash, this.id)) {
      proof++;
    }

    return proof;
  }

  validProof(lastProof, proof, lastHash, id) {
    const guess = `${lastProof}${proof}${lastHash}${id}`;
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

  /**
   * This is our Consensus Algorithm, it resolves conflicts
   * by replacing our chain with the longest one in the network.
   * @returns {Promise} Resolves with true if the chain is updated, else false
   */
  resolveConflicts() {}
}

export default Blockchain;
