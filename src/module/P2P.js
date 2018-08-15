import Node from "../p2p/mesh/Node";
import BlockchainApp from "../p2p/blockchain/BlockchainApp";
import { action } from "../p2p/mesh/Mesh";

export const initialState = {
  isFirst: true,
  node: undefined,
  nodeId: "",
  address: "",
  blockchainApp: undefined,
  transportLayer: undefined,
  peerIdList: []
};

const actionType = {
  CONNECT: "CONNECT",
  ADDPEER: "ADDPEER"
};

export function connectPortal(
  dispatch,
  p2p,
  input = { targetAddress: "localhost", targetPort: "20000" }
) {
  if (p2p.isFirst) {
    console.log("first");
    const node = new Node(input.targetAddress, input.targetPort);
    const data = {
      node: node,
      blockchainApp: new BlockchainApp(node)
    };
    dispatch({ type: actionType.CONNECT, data: data });
    return data;
  } else return null;
}

export function onAddPeerEvent(dispatch, mesh) {
  mesh.ev.on(action.PEER, () => {
    dispatch({
      type: actionType.ADDPEER,
      data: mesh.getAllPeerId()
    });
  });
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionType.CONNECT:
      return {
        ...state,
        node: action.data.node,
        blockchainApp: action.data.blockchainApp,
        nodeId: action.data.node.nodeId,
        address: action.data.blockchainApp.address,
        isFirst: false
      };
    case actionType.ADDPEER:
      return {
        ...state,
        peerIdList: action.data
      };
    default:
      return state;
  }
}
