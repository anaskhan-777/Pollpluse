import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

export const fetchAllPolls = createAsyncThunk('admin/fetchAllPolls', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/polls');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch all polls');
  }
});

export const fetchAnalytics = createAsyncThunk('admin/fetchAnalytics', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
  }
});

export const createPoll = createAsyncThunk('admin/createPoll', async (pollData, { rejectWithValue }) => {
  try {
    const response = await api.post('/polls', pollData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create poll');
  }
});

export const deletePoll = createAsyncThunk('admin/deletePoll', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/polls/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete poll');
  }
});

export const generateAIOptions = createAsyncThunk('admin/generateAIOptions', async (question, { rejectWithValue }) => {
  try {
    const response = await api.post('/admin/generate-options', { question });
    return response.data.options;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to generate options');
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    allPolls: [],
    analytics: [],
    loading: false,
    aiLoading: false,
    generatedOptions: [],
    error: null,
  },
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
    clearGeneratedOptions: (state) => {
      state.generatedOptions = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPolls.pending, (state) => { state.loading = true; })
      .addCase(fetchAllPolls.fulfilled, (state, action) => {
        state.loading = false;
        state.allPolls = action.payload;
      })
      .addCase(fetchAllPolls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAnalytics.pending, (state) => { state.loading = true; })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPoll.pending, (state) => { state.loading = true; })
      .addCase(createPoll.fulfilled, (state, action) => {
        state.loading = false;
        state.allPolls.unshift(action.payload);
      })
      .addCase(createPoll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deletePoll.pending, (state) => { state.loading = true; })
      .addCase(deletePoll.fulfilled, (state, action) => {
        state.loading = false;
        state.allPolls = state.allPolls.filter(poll => poll._id !== action.payload);
      })
      .addCase(deletePoll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(generateAIOptions.pending, (state) => { state.aiLoading = true; })
      .addCase(generateAIOptions.fulfilled, (state, action) => {
        state.aiLoading = false;
        state.generatedOptions = action.payload;
      })
      .addCase(generateAIOptions.rejected, (state, action) => {
        state.aiLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminError, clearGeneratedOptions } = adminSlice.actions;
export default adminSlice.reducer;
