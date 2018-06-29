import type from "../p2p/constants/type";

export const initialState = {
  isMining: false,
  tokenAmount: 0
};

const actionType = {
  MINING_REQUEST: "MINING_REQUEST",
  MINING_SUCCESS: "MINING_SUCCESS",
  TRANSACTION: "TRANSACTION"
};

export function mining(dispatch, p2p) {
  function miningRequest(dispatch) {
    dispatch({ type: actionType.MINING_REQUEST });
  }

  function miningSuccess(dispatch, data) {
    dispatch({ type: actionType.MINING_SUCCESS, data: data });
  }

  const blockchainApp = p2p.blockchain;
  miningRequest(dispatch);
  async function sync() {
    await blockchainApp.mine();
    miningSuccess(dispatch, blockchainApp.token.nowAmount());
  }
  sync();
}

export function transaction(dispatch, p2p, targetAddress, amount) {
  const blockchainApp = p2p.blockchain;
  blockchainApp.makeTransaction(targetAddress, amount);
  dispatch({
    type: actionType.TRANSACTION,
    data: blockchainApp.token.nowAmount()
  });
}

export function onTransactionEvent(dispatch, node, blockchainApp) {
  node.ev.on("p2ch", networkLayer => {
    const transportLayer = JSON.parse(networkLayer);
    if ((transportLayer.type = type.BLOCKCHAIN)) {
      dispatch({
        type: actionType.TRANSACTION,
        data: blockchainApp.token.nowAmount()
      });
    }
  });
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
    default:
      return state;
  }
}
