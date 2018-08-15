const initialState = {
  screen: "login"
};

const types = { CHANGE_SCREEN: "CHANGE_SCREEN" };

export function changeScreen(dispatch, target) {
  dispatch({ type: types.CHANGE_SCREEN, data: target });
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case types.CHANGE_SCREEN:
      return { ...state, screen: action.data };
    default:
      return state;
  }
}
