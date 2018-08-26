import SHA256 from "sha256";
import { Decimal } from "decimal.js";
import Cypher from "../lib/cypher";
import Events from "events";
import type from "../constants/type";

function getSHA256HexString(input) {
  return SHA256(input).toString();
}

//採掘難易度(正規表現)
const diff = /^0000/;

export const action = {
  TRANSACTION: "TRANSACTION",
  BLOCK: "BLOCK"
};

class BlockChain {
  constructor(secretKey, publicKey) {
    this.chain = [];
    this.currentTransactions = [];
    this.cypher = new Cypher(secretKey, publicKey);
    this.publicKey = this.cypher.publicKey;
    this.secretKey = this.cypher.secretKey;
    this.address = getSHA256HexString(this.cypher.publicKey);
    this.ev = new Events.EventEmitter();
    this.newBlock(0, "genesis");
  }

  hash(obj) {
    const objString = JSON.stringify(obj, Object.keys(obj).sort());
    return getSHA256HexString(objString);
  }

  jsonStr(obj) {
    return JSON.stringify(obj, Object.keys(obj).sort());
  }

  newBlock(proof, previousHash) {
    //採掘報酬
    this.newTransaction(type.SYSTEM, this.address, 1, type.REWARD);

    const block = {
      index: this.chain.length + 1, //ブロックの番号
      timestamp: Date.now(), //タイムスタンプ
      transactions: this.currentTransactions, //トランザクションの塊
      proof: proof, //ナンス
      previousHash: previousHash || this.hash(this.lastBlock()), //前のブロックのハッシュ値
      owner: this.address, //このブロックを作った人
      publicKey: this.publicKey, //このブロックを作った人の公開鍵
      sign: "" //このブロックを作った人の署名
    };
    //署名を生成
    block.sign = this.cypher.encrypt(this.hash(block));
    //ブロックチェーンに追加
    this.chain.push(block);

    //トランザクションプールをリセット
    this.currentTransactions = [];

    return block;
  }

  addBlock(block) {
    if (this.validBlock(block)) {
      //console.log("blockchain", "addblock");
      this.currentTransactions = [];
      this.chain.push(block);

      //console.log("chain", this.chain);
    }
    this.ev.emit(action.BLOCK);
  }

  validBlock(block) {
    const lastBlock = this.lastBlock();
    const lastProof = lastBlock.proof;
    const lastHash = this.hash(lastBlock);
    const owner = block.owner;
    const sign = block.sign;
    const publicKey = block.publicKey;
    block.sign = "";

    //ナンスが正しいかどうか
    if (this.validProof(lastProof, block.proof, lastHash, owner)) {
      //署名が正しいかどうか
      if (this.cypher.decrypt(sign, publicKey) === this.hash(block)) {
        block.sign = sign;
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  newTransaction(sender, recipient, amount, data) {
    const tran = {
      sender: sender, //送信アドレス
      recipient: recipient, //受取アドレス
      amount: amount, //量
      data: data, //任意のメッセージ
      now: Date.now(), //タイムスタンプ
      publicKey: this.publicKey, //公開鍵
      sign: "" //署名
    };
    tran.sign = this.cypher.encrypt(this.hash(tran)); //秘密鍵で暗号化
    this.currentTransactions.push(tran);

    return tran;
  }

  nowAmount(address = this.address) {
    let tokenNum = new Decimal(0.0);
    this.chain.forEach(block => {
      block.transactions.forEach(transaction => {
        if (transaction.recipient === address) {
          tokenNum = tokenNum.plus(new Decimal(parseFloat(transaction.amount)));
        }
        if (transaction.sender === address) {
          tokenNum = tokenNum.minus(
            new Decimal(parseFloat(transaction.amount))
          );
        }
      });
    });
    this.currentTransactions.forEach(transaction => {
      if (transaction.recipient === address) {
        tokenNum = tokenNum.plus(new Decimal(parseFloat(transaction.amount)));
      }
      if (transaction.sender === address) {
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

    //公開鍵が送金者のものかどうか
    if (getSHA256HexString(publicKey) === address) {
      //署名が正しいかどうか
      //公開鍵で署名を解読しトランザクションのハッシュ値と一致することを確認する。
      if (this.cypher.decrypt(sign, publicKey) === this.hash(transaction)) {
        const balance = this.nowAmount(address);
        //送金可能な金額を超えているかどうか
        if (balance >= amount) {
          transaction.sign = sign;
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  addTransaction(tran) {
    if (this.validTransaction(tran)) {
      this.currentTransactions.push(tran);
    }
    this.ev.emit(action.TRANSACTION);
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
      //ナンスの値を試行錯誤的に探す
      proof++;
    }

    return proof;
  }

  validProof(lastProof, proof, lastHash, address) {
    const guess = `${lastProof}${proof}${lastHash}${address}`;
    const guessHash = getSHA256HexString(guess);
    //先頭から４文字が０なら成功
    return diff.test(guessHash);
  }

  validChain(chain) {
    let index = 2;
    while (index < chain.length) {
      const previousBlock = chain[index - 1];
      const block = chain[index];

      //ブロックの持つ前のブロックのハッシュ値と実際の前の
      //ブロックのハッシュ値を比較
      if (block.previousHash !== this.hash(previousBlock)) {
        return false;
      }
      //ナンスの値の検証
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

export default BlockChain;
