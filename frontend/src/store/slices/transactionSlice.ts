import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Transaction {
  hash: string;
  blockNumber: number;
  timestamp: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasUsed: string;
  status: 'success' | 'failed';
}

interface TransactionFlow {
  rootTransaction: Transaction;
  relatedTransactions: Transaction[];
  entities: {
    [address: string]: {
      name: string;
      type: string;
    };
  };
}

interface TransactionState {
  recentTransactions: Transaction[];
  transactionDetail: Transaction | null;
  transactionFlow: TransactionFlow | null;
  loading: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  recentTransactions: [],
  transactionDetail: null,
  transactionFlow: null,
  loading: false,
  error: null,
};

// This would be replaced with actual API calls
export const fetchRecentTransactions = createAsyncThunk(
  'transaction/fetchRecentTransactions',
  async () => {
    // Placeholder for API call
    const response = await fetch('/api/v1/transaction/recent');
    if (!response.ok) {
      throw new Error('Failed to fetch recent transactions');
    }
    return response.json();
  }
);

export const fetchTransactionDetail = createAsyncThunk(
  'transaction/fetchTransactionDetail',
  async (hash: string) => {
    // Placeholder for API call
    const response = await fetch(`/api/v1/transaction/${hash}`);
    if (!response.ok) {
      throw new Error('Failed to fetch transaction details');
    }
    return response.json();
  }
);

export const fetchTransactionFlow = createAsyncThunk(
  'transaction/fetchTransactionFlow',
  async (hash: string) => {
    // Placeholder for API call
    const response = await fetch(`/api/v1/transaction/${hash}/flow`);
    if (!response.ok) {
      throw new Error('Failed to fetch transaction flow');
    }
    return response.json();
  }
);

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    clearTransactionDetail: (state) => {
      state.transactionDetail = null;
    },
    clearTransactionFlow: (state) => {
      state.transactionFlow = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecentTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentTransactions.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.loading = false;
        state.recentTransactions = action.payload;
      })
      .addCase(fetchRecentTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch recent transactions';
      })
      .addCase(fetchTransactionDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionDetail.fulfilled, (state, action: PayloadAction<Transaction>) => {
        state.loading = false;
        state.transactionDetail = action.payload;
      })
      .addCase(fetchTransactionDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch transaction details';
      })
      .addCase(fetchTransactionFlow.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionFlow.fulfilled, (state, action: PayloadAction<TransactionFlow>) => {
        state.loading = false;
        state.transactionFlow = action.payload;
      })
      .addCase(fetchTransactionFlow.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch transaction flow';
      });
  },
});

export const { clearTransactionDetail, clearTransactionFlow } = transactionSlice.actions;
export default transactionSlice.reducer;