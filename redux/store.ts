// store.ts
import { configureStore } from '@reduxjs/toolkit';

// Start with an empty reducer (you can add slices later)
export const store = configureStore({
  reducer: {
    // Add your reducers here. Example:
    // user: userReducer,
  },
});

// Export types for later use in your app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
