import { createStore } from "vuex";
import axios from "../service/axios";

interface AuthState {
  isLoggedIn: boolean;
}

const store = createStore({
  state: {
    isLoggedIn: false,
  },
  mutations: {
    setLoggedIn(state: AuthState, loggedIn: boolean) {
      state.isLoggedIn = loggedIn;
    },
  },
  actions: {
    async login({ commit }, credentials: { email: string; password: string }) {
      await axios.post("/login", credentials);
      commit("setLoggedIn", true);
    },
    async logout({ commit }) {
      await axios.post("/logout");
      commit("setLoggedIn", false);
    },
    async register({ commit }, formData: FormData) {
      try {
        await axios.post("/register", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        commit("setLoggedIn", true);
      } catch (error) {
        throw error;
      }
    },
    async checkAuthStatus({ commit }) {
      try {
        const res = await axios.get("/user");
        commit("setLoggedIn", true);
        return res;
      } catch (e) {
        commit("setLoggedIn", false);
      }
    },
    async updateProfile({ commit }, formData: any) {
      const response = await axios.post("/user/update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      commit("setUser", response.data);
    },
    async deleteUser(formData: any) {
      await axios.delete("/user", formData);
    },
    async googleLogin({ commit }, data: any) {
      try {
        await axios.post("/googleLogin", { data });
        commit("setLoggedIn", true);
      } catch (error) {
        console.error("Google login failed", error);
        throw error;
      }
    },
  },
  getters: {
    isLoggedIn: (state: AuthState) => state.isLoggedIn,
  },
});

export default store;
