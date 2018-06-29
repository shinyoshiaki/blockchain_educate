import {
  createStore as reduxCreateStore,
  applyMiddleware,
  combineReducers
} from "redux";
import logger from "redux-logger";
import thunk from "redux-thunk";
import createHistory from "history/createBrowserHistory";
import { routerReducer, routerMiddleware } from "react-router-redux";
import connectKadReducer from "../module/P2P";
import blockchainReducer from "../module/Blockchain";

const history = createHistory();
const middleware = routerMiddleware(history);

export default function createStore() {
  const store = reduxCreateStore(
    combineReducers({
      p2p: connectKadReducer,
      blockchain: blockchainReducer,
      router: routerReducer
    }),
    applyMiddleware(thunk, logger, middleware)
  );

  return { store: store, history: history };
}
