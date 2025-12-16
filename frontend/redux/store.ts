import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./slices/counterSlice"; // Import your reducer

export const store = configureStore({
  reducer: {
    counter: counterReducer, // ✅ At least one reducer is required
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
