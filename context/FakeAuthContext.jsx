import { useReducer } from "react";
import { useContext } from "react";
import { createContext } from "react";

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuth: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "login":
      return {
        ...state,
        user: action.payload,
        isAuth: true,
      };

    case "logout":
      return {
        ...state,
        user: null,
        isAuth: false,
      };

    default:
      throw new Error("Unknown action type");
  }
}

const FAKE_USER = {
  name: REACT_APP_FAKE_USERNAME,
  email: REACT_APP_FAKE_EMAIL,
  password: REACT_APP_FAKE_PASSWORD,
  avatar: REACT_APP_FAKE_AVATAR,
};

function AuthProvider({ children }) {
  const [{ user, isAuth }, dispatch] = useReducer(reducer, initialState);

  function login(email, password) {
    if (email === FAKE_USER.email && password === FAKE_USER.password)
      dispatch({ type: "login", payload: FAKE_USER });
  }

  function logout() {
    dispatch({ type: "logout" });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuth,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined)
    throw new Error("AuthContext was used outside the AuthProvider");

  return context;
}

export { AuthProvider, useAuth };
