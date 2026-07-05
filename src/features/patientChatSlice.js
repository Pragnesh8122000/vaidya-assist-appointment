import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sendPatientMessage } from '../api/patientAgent';
import { getAppointments } from './patientAppointmentSlice';

// Agent tools that mutate the patient's appointments list. When the chatbot
// invokes one of these, the Appointments page must be refreshed — the portal
// has no socket.io push, so the list would otherwise go stale until a manual
// reload. See UX-12.
const APPOINTMENT_MUTATION_TOOLS = [
  'patient_book_appointment',
  'patient_reschedule_appointment',
  'patient_cancel_appointment',
];
// The agent node sets `toolCalled: true` even on the failure path (it emits an
// apology message), so a tool call alone is not proof of success. These
// phrases match the apology templates in agent-service/src/patient-agent/nodes.ts
// and let us suppress a redundant refetch when nothing actually changed.
const APPOINTMENT_MUTATION_FAILURE_RX = /I'm sorry|couldn't|could not|already booked|unable to|not able to/i;

/**
 * Send a message to the patient agent, including conversation state
 * for multi-turn slot-filling (booking, rescheduling, etc.).
 */
export const sendPatientChatMessage = createAsyncThunk(
  'patientChat/sendMessage',
  async ({ message }, { getState, rejectWithValue, dispatch }) => {
    try {
      const state = getState();
      const history = state.patientChat.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Include conversation state if we have one (for multi-turn flows)
      const conversationState = state.patientChat.conversationState || null;

      const reply = await sendPatientMessage(message, history, conversationState);

      // UX-12: refresh the appointments list when the agent successfully
      // mutated it (book / reschedule / cancel). The reply carries the tool
      // name on both success and failure, so we also require the reply text
      // not to look like an apology before refetching.
      if (
        reply.toolCalled &&
        typeof reply.toolName === 'string' &&
        APPOINTMENT_MUTATION_TOOLS.includes(reply.toolName) &&
        !APPOINTMENT_MUTATION_FAILURE_RX.test(reply.content || '')
      ) {
        dispatch(getAppointments({}));
      }

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