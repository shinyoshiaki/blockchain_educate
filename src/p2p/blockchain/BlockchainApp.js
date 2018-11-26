import BlockChain from "blockchain-ts";
import type from "../constants/type";
import * as format from "../constants/format";
import Events from "events";

let node;

export default class BlockChainApp extends BlockChain {
  constructor(_node, secretKey, publicKey) {
    console.log("sub blockchainapp");
    super(secretKey, publicKey);
    this.ev = new Events.EventEmitter();
    this.loadChain();

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
        this.saveChain();
      }
    });

    //マイニングに対応する処理
    RPC[type.NEWBLOCK] = body => {
      console.log("blockchainApp", "new block");
      //受け取ったブロックのインデックスが自分のチェーンより2長いか
      //現時点のチェーンの長さが1ならブロックチェーンの分岐を疑う
      if (body.index > this.chain.length + 1 || this.chain.length === 1) {
        //ブロックチェーンの分岐を調べる
        this.checkConflicts().catch(console.log);
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

      //拡張命令
      const data = body.data;
      switch (data.type) {
        case "multisig":
          this.multisig.responder(data);
          break;
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
      //タイムアウト
      const timeout = setTimeout(() => {
        reject("chenck conf timeout");
      }, 4 * 1000);
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
        clearTimeout(timeout);
        resolve(true);
      });
    });
  }

  //マイニング
  async mine() {
    const block = await this.mine();
    node.broadCast(format.sendFormat(type.NEWBLOCK, block));
  }

  //トランザクション
  makeTransaction(recipient, amount, data) {
    const tran = this.makeTransaction(recipient, amount, data);
    node.broadCast(format.sendFormat(type.TRANSACRION, tran));
  }

  makeNewMultiSigAddress(friends, vote, amount) {
    console.log("sub makeNewMultiSigAddress");
    const tran = this.multisig.makeNewMultiSigAddress(friends, vote, amount);
    node.broadCast(format.sendFormat(type.TRANSACRION, tran));
  }

  makeMultiSigTransaction(multisigAddress, amount) {
    const tran = this.multisig.makeMultiSigTransaction(
      multisigAddress,
      amount
    );
    node.broadCast(format.sendFormat(type.TRANSACRION, tran));
  }

  approveMultiSig(multisig) {
    const tran = this.multisig.approveMultiSig(multisig);
    if (tran) {
      node.broadCast(format.sendFormat(type.TRANSACRION, tran));
    }
  }

  verifyMultiSig(pub, shares) {
    const tran = this.multisig.verifyMultiSig(pub, shares);
    node.broadCast(format.sendFormat(type.TRANSACRION, tran));
  }
}
