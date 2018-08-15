import {
  createStore as reduxCreateStore,
  applyMiddleware,
  combineReducers
} from "redux";
import logger from "redux-logger";
import thunk from "redux-thunk";
import connectP2PReducer from "../module/P2P";
import blockchainReducer from "../module/Blockchain";
import appReducer from "../module/router";

export default function createStore() {
  const store = reduxCreateStore(
    combineReducers({
      p2p: connectP2PReducer,
      blockchain: blockchainReducer,
      app: appReducer
    }),
    applyMiddleware(thunk, logger)
  );

  return store;
}
