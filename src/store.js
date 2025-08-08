import { configureStore, createSlice } from "@reduxjs/toolkit";

// Create a slice (reducer + actions in one)
const counterSlice = createSlice({
  name: "counter",
  initialState: { count: 0 },
  reducers: {
    increment: (state) => {
      state.count += 1;
    },
    decrement: (state) => {
      state.count -= 1;
    },
  },
});

// Extract actions and reducer
export const { increment, decrement } = counterSlice.actions;
const store = configureStore({
  reducer: counterSlice.reducer,
});

export default store;
