import { configureStore } from '@reduxjs/toolkit';
import addressReducer from './slices/addressSlice';
import entityReducer from './slices/entitySlice';
import transactionReducer from './slices/transactionSlice';
import uiReducer from './slices/uiSlice';

const store = configureStore({
  reducer: {
    address: addressReducer,
    entity: entityReducer,
    transaction: transactionReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;