import Blockchain from "./BlockChain";
import type from "../constants/type";
import * as format from "../constants/format";

let nodeId;
let node;

export default class BlockchainApp {
  constructor(id, _node) {
    nodeId = id;
    this.blockchain = new Blockchain();

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
      console.log("blockchainApp", "p2ch", transportLayer);

      switch (transportLayer.session) {
        case type.NEWBLOCK:
          console.log("blockchainApp", "new block");
          (async () => {
            await this.checkConflicts();
            const block = transportLayer.body;
            this.blockchain.addBlock(block);
          })();
          break;
        case type.TRANSACRION:
          console.log("blockchainApp transaction", transportLayer.body);
          const transaction = transportLayer.body;
          if (
            !JSON.stringify(this.blockchain.currentTransactions).includes(
              JSON.stringify(transaction)
            )
          ) {
            console.log("transaction added");
            this.blockchain.addTransaction(transaction);
          }
          break;
        case type.CONFLICT:
          console.log("blockchain app check conflict");
          const conflict = transportLayer.body;
          if (this.blockchain.chain.length > conflict.size) {
            console.log("blockchain app check is conflict");
            node.send(
              conflict.nodeId,
              format.sendFormat(type.RESOLVE_CONFLICT, this.blockchain.chain)
            );
          }
          break;
      }
    });
  }

  checkConflicts() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(false);
      }, 4 * 1000);
      console.log("this.checkConflicts");
      node.broadCast(
        format.sendFormat(type.CONFLICT, {
          nodeId: nodeId,
          size: this.blockchain.chain.length
        })
      );
      node.ev.on("p2ch", networkLayer => {
        const transportLayer = JSON.parse(networkLayer);
        switch (transportLayer.session) {
          case type.RESOLVE_CONFLICT:
            console.log("resolve conflict");
            const resolveConflict = transportLayer.body;
            if (this.blockchain.chain.length < resolveConflict.length) {
              if (this.blockchain.validChain(resolveConflict)) {
                this.blockchain.chain = resolveConflict;
              }
            }
            resolve(true);
            break;
        }
      });
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

      node.broadCast(format.sendFormat(type.NEWBLOCK, block));

      resolve(block);
    });
  }

  //sessionLayer
  makeTransaction(recipient, amount, data) {
    const tran = this.blockchain.newTransaction(
      this.blockchain.address,
      recipient,
      amount,
      data
    );
    console.log("makeTransaction", tran);

    node.broadCast(format.sendFormat(type.TRANSACRION, tran));
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
