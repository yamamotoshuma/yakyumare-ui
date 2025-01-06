import { ref, provide, inject } from "vue";
import axios from "../service/axios";

interface AuthState {
  isLoggedIn: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  register: (credentials: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const authStateSymbol = Symbol();
const createAuthState = (): AuthState => {
  const isLoggedIn = ref(false);

  const login = async (credentials: { email: string; password: string }) => {
    await axios.post("/login", credentials);
    isLoggedIn.value = true;
  };

  const logout = async () => {
    await axios.post("/logout");
    isLoggedIn.value = false;
  };

  const register = async (credentials: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => {
    await axios.post("/register", credentials);
    isLoggedIn.value = true;
  };

  const checkAuthStatus = async () => {
    try {
      await axios.get("/user");
      isLoggedIn.value = true;
    } catch {
      isLoggedIn.value = false;
    }
  };

  return {
    isLoggedIn: isLoggedIn.value,
    login,
    logout,
    register,
    checkAuthStatus,
  };
};

export const provideAuthState = () => {
  const authState = createAuthState();
  provide(authStateSymbol, authState);
  return authState;
};

export const useAuthState = (): AuthState => {
  const authState = inject<AuthState>(authStateSymbol);
  if (!authState) {
    throw new Error("useAuthState must be used after provideAuthState");
  }
  return authState;
};
