import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface AddressInfo {
  address: string;
  balance: string;
  transactionCount: number;
  firstTransaction: string;
  lastTransaction: string;
  entity?: string;
  tags?: string[];
}

interface AddressState {
  currentAddress: AddressInfo | null;
  recentAddresses: AddressInfo[];
  loading: boolean;
  error: string | null;
}

const initialState: AddressState = {
  currentAddress: null,
  recentAddresses: [],
  loading: false,
  error: null,
};

// This would be replaced with actual API calls
export const fetchAddressInfo = createAsyncThunk(
  'address/fetchAddressInfo',
  async (address: string) => {
    // Placeholder for API call
    const response = await fetch(`/api/v1/address/${address}`);
    if (!response.ok) {
      throw new Error('Failed to fetch address information');
    }
    return response.json();
  }
);

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    clearCurrentAddress: (state) => {
      state.currentAddress = null;
    },
    clearRecentAddresses: (state) => {
      state.recentAddresses = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddressInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddressInfo.fulfilled, (state, action: PayloadAction<AddressInfo>) => {
        state.loading = false;
        state.currentAddress = action.payload;
        state.recentAddresses = [
          action.payload,
          ...state.recentAddresses.filter(addr => addr.address !== action.payload.address)
        ].slice(0, 5); // Keep last 5 addresses
      })
      .addCase(fetchAddressInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch address information';
      });
  },
});

export const { clearCurrentAddress, clearRecentAddresses } = addressSlice.actions;
export default addressSlice.reducer;