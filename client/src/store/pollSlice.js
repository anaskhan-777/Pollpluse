import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchActivePolls = createAsyncThunk('poll/fetchActivePolls', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/polls/active');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch active polls');
  }
});

export const fetchPollResults = createAsyncThunk('poll/fetchPollResults', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/polls/${id}/results`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch poll results');
  }
});

export const submitVote = createAsyncThunk('poll/submitVote', async ({ pollId, optionIndex }, { rejectWithValue }) => {
  try {
    await api.post('/votes', { pollId, optionIndex });
    return { pollId, optionIndex };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to submit vote');
  }
});

const pollSlice = createSlice({
  name: 'poll',
  initialState: {
    activePolls: [],
    currentPoll: null,
    liveResults: null,
    votedPolls: JSON.parse(localStorage.getItem('votedPolls')) || {},
    loading: false,
    error: null,
  },
  reducers: {
    clearPollError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivePolls.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchActivePolls.fulfilled, (state, action) => {
        state.loading = false;
        state.activePolls = action.payload;
      })
      .addCase(fetchActivePolls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPollResults.pending, (state) => { state.loading = true; })
      .addCase(fetchPollResults.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPoll = action.payload;
        state.liveResults = action.payload.results;
      })
      .addCase(fetchPollResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitVote.pending, (state) => { state.loading = true; })
      .addCase(submitVote.fulfilled, (state, action) => {
        state.loading = false;
        const { pollId, optionIndex } = action.payload;
        state.votedPolls[pollId] = optionIndex;
        localStorage.setItem('votedPolls', JSON.stringify(state.votedPolls));
      })
      .addCase(submitVote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPollError } = pollSlice.actions;
export default pollSlice.reducer;
