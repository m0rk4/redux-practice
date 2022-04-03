import {configureStore} from '@reduxjs/toolkit';

import postsReducer from '../features/posts/postsSlice'
import userReducer from "../features/users/userSlice";
import notificationsReducer from "../features/notifications/notificationsSlice";
import {apiSlice} from "../features/api/apiSlice";

const store = configureStore({
    reducer: {
        posts: postsReducer,
        users: userReducer,
        notifications: notificationsReducer,
        [apiSlice.reducerPath]: apiSlice.reducer
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware().concat(apiSlice.middleware)
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;