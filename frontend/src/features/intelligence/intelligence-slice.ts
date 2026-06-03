import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IntelligenceFocus, IntelligenceHorizon } from "@/schemas/intelligence";

type IntelligenceState = {
  horizon: IntelligenceHorizon;
  focus: IntelligenceFocus;
  selectedInsightId?: string;
  pinnedInsightIds: string[];
  dismissedInsightIds: string[];
  promptDraft: string;
};

const initialState: IntelligenceState = {
  horizon: "week",
  focus: "all",
  pinnedInsightIds: [],
  dismissedInsightIds: [],
  promptDraft: "Build a practical decision brief from my current subscriptions, goals, memories, notes, and roadmap data.",
};

const intelligenceSlice = createSlice({
  name: "intelligence",
  initialState,
  reducers: {
    setHorizon: (state, action: PayloadAction<IntelligenceHorizon>) => {
      state.horizon = action.payload;
    },
    setFocus: (state, action: PayloadAction<IntelligenceFocus>) => {
      state.focus = action.payload;
    },
    setSelectedInsightId: (state, action: PayloadAction<string | undefined>) => {
      state.selectedInsightId = action.payload;
    },
    setPromptDraft: (state, action: PayloadAction<string>) => {
      state.promptDraft = action.payload;
    },
    togglePinnedInsight: (state, action: PayloadAction<string>) => {
      const existing = state.pinnedInsightIds.indexOf(action.payload);
      if (existing >= 0) {
        state.pinnedInsightIds.splice(existing, 1);
      } else {
        state.pinnedInsightIds.unshift(action.payload);
      }
    },
    dismissInsight: (state, action: PayloadAction<string>) => {
      if (!state.dismissedInsightIds.includes(action.payload)) {
        state.dismissedInsightIds.push(action.payload);
      }
      state.pinnedInsightIds = state.pinnedInsightIds.filter((id) => id !== action.payload);
      if (state.selectedInsightId === action.payload) {
        state.selectedInsightId = undefined;
      }
    },
    restoreDismissedInsights: (state) => {
      state.dismissedInsightIds = [];
    },
  },
});

export const {
  dismissInsight,
  restoreDismissedInsights,
  setFocus,
  setHorizon,
  setPromptDraft,
  setSelectedInsightId,
  togglePinnedInsight,
} = intelligenceSlice.actions;

export const intelligenceReducer = intelligenceSlice.reducer;
