import { configureStore } from "@reduxjs/toolkit";
import { intelligenceReducer } from "@/features/intelligence/intelligence-slice";

export const store = configureStore({
  reducer: {
    intelligence: intelligenceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
