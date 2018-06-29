import { Decimal } from "decimal.js";

let blockchain;
let userId;

export default class {
  constructor(_userId, _blockchain) {
    blockchain = _blockchain;
    userId = _userId;
  }

  nowAmount() {
    console.log(
      "token ammount current transactions",
      blockchain.currentTransactions
    );
    let tokenNum = new Decimal(0.0);
    blockchain.chain.forEach(block => {
      block.transactions.forEach(transaction => {
        if (transaction.recipient === userId) {
          console.log("token add", transaction);
          tokenNum = tokenNum.plus(new Decimal(parseFloat(transaction.amount)));
        } else if (transaction.sender === userId) {
          console.log("token lose", transaction);
          tokenNum = tokenNum.minus(
            new Decimal(parseFloat(transaction.amount))
          );
        }
      });
    });
    blockchain.currentTransactions.forEach(transaction => {
      if (transaction.recipient === userId) {
        console.log("token add", transaction);
        tokenNum = tokenNum.plus(new Decimal(parseFloat(transaction.amount)));
      } else if (transaction.sender === userId) {
        console.log("token lose", transaction);
        tokenNum = tokenNum.minus(new Decimal(parseFloat(transaction.amount)));
      }
    });
    console.log("token amount", tokenNum.toNumber());
    return tokenNum.toNumber();
  }
}
