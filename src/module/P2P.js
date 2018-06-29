import PortalNode from "../p2p/mesh/PortalNode";
import BlockchainApp from "../p2p/blockchain/BlockchainApp";

export const initialState = {
  isFirst: true,
  node: undefined,
  userId: "",
  blockchain: undefined,
  transportLayer: undefined
};

const actionType = {
  CONNECT: "CONNECT"
};

export function connectKad(dispatch, p2p, input) {
  if (p2p.isFirst) {
    const node = new PortalNode(
      input.myPort,
      input.targetAddress,
      input.targetPort,
      input.isLocal
    );
    const data = {
      node: node,
      blockchain: new BlockchainApp(userId, node)
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
        blockchain: action.data.blockchain,
        userId: action.data.node.userId,
        isFirst: false
      };
    default:
      return state;
  }
}
