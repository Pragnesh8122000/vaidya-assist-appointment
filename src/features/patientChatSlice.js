import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sendPatientMessage } from '../api/patientAgent';

/**
 * Send a message to the patient agent, including conversation state
 * for multi-turn slot-filling (booking, rescheduling, etc.).
 */
export const sendPatientChatMessage = createAsyncThunk(
  'patientChat/sendMessage',
  async ({ message }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const history = state.patientChat.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Include conversation state if we have one (for multi-turn flows)
      const conversationState = state.patientChat.conversationState || null;

      const reply = await sendPatientMessage(message, history, conversationState);
      return { message, reply };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to reach the health assistant. Please try again.'
      );
    }
  }
);

const patientChatSlice = createSlice({
  name: 'patientChat',
  initialState: {
    messages: [],
    loading: false,
    error: null,
    isOpen: false,
    conversationState: null, // { intent, slots, missingSlots } for multi-turn flows
  },
  reducers: {
    togglePatientChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    openPatientChat: (state) => {
      state.isOpen = true;
    },
    closePatientChat: (state) => {
      state.isOpen = false;
    },
    clearPatientChat: (state) => {
      state.messages = [];
      state.error = null;
      state.conversationState = null;
    },
    clearPatientError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendPatientChatMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendPatientChatMessage.fulfilled, (state, action) => {
        state.loading = false;
        const { message, reply } = action.payload;
        state.messages.push({ role: 'user', content: message });
        state.messages.push({
          role: 'assistant',
          content: reply.content,
          toolCalled: reply.toolCalled,
          toolName: reply.toolName,
          isEmergency: reply.isEmergency || false,
        });
        // Persist conversation state for multi-turn slot-filling. Reset it when
        // the server signals the current flow is complete (null / empty).
        state.conversationState = reply.conversationState || null;
      })
      .addCase(sendPatientChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  togglePatientChat,
  openPatientChat,
  closePatientChat,
  clearPatientChat,
  clearPatientError,
} = patientChatSlice.actions;

export default patientChatSlice.reducer;