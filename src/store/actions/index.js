import { createStore, combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Sử dụng localStorage
import userReducer from '../reducers/userReducer'; // Import reducer
import cartReducer from '../reducers/cartReducer';

// Cấu hình persist
const persistConfig = {
  key: 'root',
  storage,
};

// Combine reducers
const rootReducer = combineReducers({
  user: userReducer, // Gắn reducer "user" vào store
  cart: cartReducer,
});
// Tạo persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Tạo store
const store = createStore(persistedReducer);

// Tạo persistor để lưu trữ trạng thái
const persistor = persistStore(store);

// Export store và persistor để sử dụng trong ứng dụng
export { store, persistor };

export * from './userActions';
export * from './cartActions';