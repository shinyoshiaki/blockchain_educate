import BlockChain from "./BlockChain";
import type from "../constants/type";
import * as format from "../constants/format";
import Events from "events";

let node;

export default class BlockChainApp extends BlockChain {
  constructor(_node) {
    super();
    this.ev = new Events.EventEmitter();

    node = _node;

    //リモートで実行する関数
    const RPC = {};
    //ポータルノードのイベント
    node.ev.on("blockchainApp", networkLayer => {
      const transportLayer = JSON.parse(networkLayer);
      const body = transportLayer.body;
      const type = transportLayer.session;

      //イベントを作成、他の関数がこのイベントを利用する(例：87行目)
      this.ev.emit(type, body);

      //受け取ったtypeに対応するリモート関数を実行
      if (Object.keys(RPC).includes(type)) {
        RPC[type](body);
      }
    });

    //マイニングに対応する処理
    RPC[type.NEWBLOCK] = body => {
      console.log("blockchainApp", "new block");
      //受け取ったブロックのインデックスが自分のチェーンより2長いか
      //現時点のチェーンの長さが1ならブロックチェーンの分岐を疑う
      if (body.index > this.chain.length + 1 || this.chain.length === 1) {
        //ブロックチェーンの分岐を調べる
        this.checkConflicts().then(
          () => {
            console.log("chenck conf success");
          },
          () => {
            console.log("chenck conf timeout");
          }
        );
      } else {
        //新しいブロックを受け入れる
        this.addBlock(body);
      }
    };

    //トランザクションに対する処理
    RPC[type.TRANSACRION] = body => {
      console.log("blockchainApp transaction", body);
      if (
        //トランザクションプールに受け取ったトランザクションがあるか簡易的に調べる
        !this.jsonStr(this.currentTransactions).includes(this.jsonStr(body))
      ) {
        //トランザクションをトランザクションプールに加える
        this.addTransaction(body);
      }
    };

    //ブロックチェーンの状況を聞かれたときの返答
    RPC[type.CONFLICT] = body => {
      console.log("blockchain app check conflict");
      //自分のチェーンが質問者より長ければ、自分のチェーンを返す
      if (this.chain.length > body.size) {
        console.log("blockchain app check is conflict");
        node.send(
          body.nodeId,
          format.sendFormat(type.RESOLVE_CONFLICT, this.chain)
        );
      }
    };
  }

  checkConflicts() {
    return new Promise((resolve, reject) => {
      console.log("this.checkConflicts");
      //他のノードにブロックチェーンの状況を聞く
      node.broadCast(
        format.sendFormat(type.CONFLICT, {
          nodeId: node.nodeId,
          size: this.chain.length
        })
      );
      //他のノードからの回答を調べる
      this.ev.on(type.RESOLVE_CONFLICT, body => {
        console.log("resolve conflict");
        if (this.chain.length < body.length) {
          console.log("conflict my chain short");
          if (this.validChain(body)) {
            console.log("conflict swap chain");
            this.chain = body;
          } else {
            console.log("conflict wrong chain");
          }
        }
        resolve(true);
      });
      //タイムアウト
      setTimeout(() => {
        reject(false);
      }, 4 * 1000);
    });
  }

  //マイニング
  mine() {
    //非同期処理
    return new Promise(resolve => {
      //プルーフオブワーク(ナンスの探索)
      const proof = this.proofOfWork();
      //最後のブロックのハッシュ値
      const previousHash = this.hash(this.lastBlock());
      //新しいブロック
      const block = this.newBlock(proof, previousHash);

      console.log("new block forged", JSON.stringify(block));
      //ネットワークにブロードキャスト
      node.broadCast(format.sendFormat(type.NEWBLOCK, block));
      //完了
      resolve(block);
    });
  }

  //トランザクション
  makeTransaction(recipient, amount, data) {
    //入力情報が足りているか
    if (!(recipient && amount)) {
      console.log("input error");
      return;
    }
    //残高が足りているか
    if (amount > this.nowAmount()) {
      console.log("input error");
      return;
    }
    //トランザクションの生成
    const tran = this.newTransaction(this.address, recipient, amount, data);
    console.log("makeTransaction", tran);
    //トランザクションをブロードキャスト
    node.broadCast(format.sendFormat(type.TRANSACRION, tran));
  }

  getChain() {
    return this.chain;
  }
}
