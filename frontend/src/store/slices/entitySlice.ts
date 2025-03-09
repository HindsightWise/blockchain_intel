import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Entity {
  id: string;
  name: string;
  type: string;
  description: string;
  addresses: string[];
  totalBalance: string;
  confidenceScore: number;
  createdAt: string;
  updatedAt: string;
}

interface EntityState {
  entities: Entity[];
  currentEntity: Entity | null;
  loading: boolean;
  error: string | null;
}

const initialState: EntityState = {
  entities: [],
  currentEntity: null,
  loading: false,
  error: null,
};

// This would be replaced with actual API calls
export const fetchEntities = createAsyncThunk(
  'entity/fetchEntities',
  async () => {
    // Placeholder for API call
    const response = await fetch('/api/v1/entity');
    if (!response.ok) {
      throw new Error('Failed to fetch entities');
    }
    return response.json();
  }
);

export const fetchEntityById = createAsyncThunk(
  'entity/fetchEntityById',
  async (id: string) => {
    // Placeholder for API call
    const response = await fetch(`/api/v1/entity/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch entity details');
    }
    return response.json();
  }
);

const entitySlice = createSlice({
  name: 'entity',
  initialState,
  reducers: {
    clearCurrentEntity: (state) => {
      state.currentEntity = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEntities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntities.fulfilled, (state, action: PayloadAction<Entity[]>) => {
        state.loading = false;
        state.entities = action.payload;
      })
      .addCase(fetchEntities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch entities';
      })
      .addCase(fetchEntityById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntityById.fulfilled, (state, action: PayloadAction<Entity>) => {
        state.loading = false;
        state.currentEntity = action.payload;
      })
      .addCase(fetchEntityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch entity details';
      });
  },
});

export const { clearCurrentEntity } = entitySlice.actions;
export default entitySlice.reducer;