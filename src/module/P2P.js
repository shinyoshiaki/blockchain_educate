import Node from "../p2p/mesh/Node";
import BlockchainApp from "../p2p/blockchain/BlockchainApp";

export const initialState = {
  isFirst: true,
  node: undefined,
  nodeId: "",
  address: "",
  blockchainApp: undefined,
  transportLayer: undefined
};

const actionType = {
  CONNECT: "CONNECT"
};

export function connectPortal(dispatch, p2p, input) {
  if (p2p.isFirst) {
    const node = new Node(
      input.myPort,
      input.targetAddress,
      input.targetPort,
      input.isLocal
    );
    const data = {
      node: node,
      blockchainApp: new BlockchainApp(node.nodeId, node)
    };
    dispatch({ type: actionType.CONNECT, data: data });
    return data;
  } else return null;
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionType.CONNECT:
      return {
        ...state,
        node: action.data.node,
        blockchainApp: action.data.blockchainApp,
        nodeId: action.data.node.nodeId,
        address: action.data.blockchainApp.blockchain.address,
        isFirst: false
      };
    default:
      return state;
  }
}
