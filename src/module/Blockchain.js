import type from "blockchain-ts/lib/blockchain/type";

export const initialState = {
  isMining: false,
  tokenAmount: 0
};

const actionType = {
  MINING_REQUEST: "MINING_REQUEST",
  MINING_SUCCESS: "MINING_SUCCESS",
  TRANSACTION: "TRANSACTION",
  INIT_AMOUNT: "INIT_AMOUNT"
};

export async function mining(dispatch, p2p) {
  dispatch({ type: actionType.MINING_REQUEST }); //マイニングの開始

  const blockchainApp = p2p.blockchainApp;
  await blockchainApp.mine(); //マイニング

  dispatch({
    type: actionType.MINING_SUCCESS, //マイニングの終了
    data: blockchainApp.nowAmount()
  });
}

export function transaction(dispatch, p2p, targetAddress, amount) {
  const blockchainApp = p2p.blockchainApp;
  blockchainApp.makeTransaction(targetAddress, amount); //トランザクションの実行
  dispatch({
    type: actionType.TRANSACTION,
    data: blockchainApp.nowAmount()
  });
}

export function onTransactionEvent(dispatch, node, blockchainApp) {
  // node.kad
  // node.ev.on("blockchainApp", networkLayer => {
  //   const transportLayer = JSON.parse(networkLayer);
  //   if ((transportLayer.type = type.BLOCKCHAIN)) {
  //     dispatch({
  //       type: actionType.TRANSACTION,
  //       data: blockchainApp.nowAmount()
  //     });
  //   }
  // });
}

export function initTokenAmount(dispatch, blockchainApp) {
  dispatch({ type: actionType.INIT_AMOUNT, data: blockchainApp.nowAmount() });
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionType.MINING_REQUEST:
      return {
        ...state,
        isMining: true
      };
    case actionType.MINING_SUCCESS:
      return {
        ...state,
        isMining: false,
        tokenAmount: action.data
      };
    case actionType.TRANSACTION:
      return {
        ...state,
        tokenAmount: action.data
      };
    case actionType.INIT_AMOUNT:
      return { ...state, tokenAmount: action.data };
    default:
      return state;
  }
}
