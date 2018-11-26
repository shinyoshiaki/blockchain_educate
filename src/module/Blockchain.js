import type from "../p2p/constants/type";
import BlockChainApp from "../p2p/blockchain/BlockchainApp";

export const initialState = {
  isMining: false,
  tokenAmount: 0,
  multisigTranDone: false,
  multisigTranInfo: undefined,
  multisigTranWaitApprove: false
};

const actionType = {
  MINING_REQUEST: "MINING_REQUEST",
  MINING_SUCCESS: "MINING_SUCCESS",
  TRANSACTION: "TRANSACTION",
  INIT_AMOUNT: "INIT_AMOUNT",
  MULTISIG_TRAN_STATE: "MULTISIG_TRAN_STATE",
  MULTISIG_TRAN_WAIT_APPROVE: "MULTISIG_TRAN_WAIT_APPROVE",
  MULTISIG_TRAN_APPROVE_DONE: "MULTISIG_TRAN_APPROVE_DONE"
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

export function makeNewMultiSigAddress(
  dispatch,
  bca = new BlockChainApp(),
  friends,
  vote,
  amount
) {
  console.log({ amount });
  bca.makeNewMultiSigAddress(friends, vote, amount);
  dispatch({
    type: actionType.TRANSACTION,
    data: bca.nowAmount()
  });
}

export function makeMultiSigTran(
  dispatch,
  bca = new BlockChainApp(),
  address,
  amount
) {
  dispatch({ type: actionType.MULTISIG_TRAN_STATE, data: false });
  bca.makeMultiSigTransaction(address, amount);
  bca.events.onMultisigTranDone["blockchain.js"] = () => {
    dispatch({ type: actionType.MULTISIG_TRAN_STATE, data: true });
    setTimeout(() => {
      dispatch({ type: actionType.MULTISIG_TRAN_STATE, data: false });
    }, 2000);
  };
}

export function approveMultiSig(dispatch, bca = new BlockChainApp(), info) {
  bca.approveMultiSig(info);
  dispatch({ type: actionType.MULTISIG_TRAN_APPROVE_DONE });
}

export function onTransactionEvent(
  dispatch,
  node,
  blockchainApp = new BlockChainApp()
) {
  blockchainApp.multisig.events.onMultisigTran = info => {
    //blockchainApp.multisig.approveMultiSig(info);
    dispatch({ type: actionType.MULTISIG_TRAN_WAIT_APPROVE, data: info });
  };
  node.ev.on("blockchainApp", networkLayer => {
    const transportLayer = JSON.parse(networkLayer);
    if ((transportLayer.type = type.BLOCKCHAIN)) {
      dispatch({
        type: actionType.TRANSACTION,
        data: blockchainApp.nowAmount()
      });
    }
  });
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
    case actionType.MULTISIG_TRAN_STATE:
      return { ...state, multisigTranDone: action.data };
    case actionType.MULTISIG_TRAN_WAIT_APPROVE:
      return {
        ...state,
        multisigTranWaitApprove: true,
        multisigTranInfo: action.data
      };
    case actionType.MULTISIG_TRAN_APPROVE_DONE:
      return { ...state, multisigTranWaitApprove: false };
    default:
      return state;
  }
}
