import Blockchain from "./BlockChain";
import type from "../constants/type";
import * as format from "../constants/format";
import Token from "./token";

let nodeId;
let node;

export default class BlockchainApp {
  constructor(id, _node) {
    nodeId = id;
    this.blockchain = new Blockchain(nodeId);
    this.token = new Token(id, this.blockchain);

    let local = localStorage.getItem(type.BLOCKCHAIN);
    if (local !== null && local.length > 0) {
      this.blockchain.chain = JSON.parse(local);
      console.log("load blockchain", this.blockchain.chain);
    }

    node = _node;

    //ブロックチェーンの更新
    node.ev.on("p2ch", networkLayer => {
      console.log("blockchain app p2ch", networkLayer);
      const transportLayer = JSON.parse(networkLayer);
      console.log(
        "blockchainApp",
        "p2ch",
        transportLayer,
        "\n",
        transportLayer.session
      );

      if (transportLayer.session === type.NEWBLOCK) {
        console.log("blockchainApp", "get newblock");
        const block = transportLayer.body;
        this.blockchain.addBlock(block);
      } else if (transportLayer.session === type.TRANSACRION) {
        console.log(
          "blockchainApp transaction",
          transportLayer.body,
          "\n",
          JSON.stringify(this.blockchain.currentTransactions)
        );
        const transaction = transportLayer.body;
        if (
          !JSON.stringify(this.blockchain.currentTransactions).includes(
            JSON.stringify(transaction)
          )
        ) {
          console.log("transaction added");
          this.blockchain.addTransaction(transaction);
        }
      }
    });
  }

  mine() {
    return new Promise(resolve => {
      const proof = this.blockchain.proofOfWork();

      const lastBlock = this.blockchain.lastBlock();
      const previousHash = this.blockchain.hash(lastBlock);
      const block = this.blockchain.newBlock(proof, previousHash);

      console.log("new block forged", JSON.stringify(block));

      this.saveChain();

      node.send(format.sendFormat(type.NEWBLOCK, block));

      resolve(block);
    });
  }

  //sessionLayer
  makeTransaction(recipient, amount, data) {
    const tran = this.blockchain.newTransaction(
      nodeId,
      recipient,
      amount,
      data
    );
    console.log("makeTransaction", tran);

    node.send(format.sendFormat(type.TRANSACRION, tran));
  }

  getChain() {
    this.saveChain();
    return this.blockchain.chain;
  }

  saveChain() {
    localStorage.setItem(
      type.BLOCKCHAIN,
      JSON.stringify(this.blockchain.chain)
    );
  }
}
