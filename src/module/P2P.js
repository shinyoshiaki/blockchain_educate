import Node from "../p2p/mesh/Node";
import BlockchainApp from "../p2p/blockchain/BlockchainApp";
import { action } from "../p2p/mesh/Mesh";

export const initialState = {
  isFirst: true,
  node: undefined,
  nodeId: "",
  address: "",
  keyword: "",
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
  input = { targetAddress: "localhost", targetPort: "20000" },
  keyword = ""
) {
  if (p2p.isFirst) {
    const node = new Node(input.targetAddress, input.targetPort); //ポータルノードに接続
    let keys = { publicKey: null, secretKey: null };
    if (keyword.length > 5) {
      const json = localStorage.getItem(keyword);
      keys = JSON.parse(json);
    }
    const data = {
      node: node,
      blockchainApp: new BlockchainApp(node, keys.secretKey, keys.publicKey) //ブロックチェーンの起動
    };
    dispatch({ type: actionType.CONNECT, data: data }); //状態を保存
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
        keyword: action.data.blockchainApp.keyword,
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
