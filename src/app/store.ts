import {configureStore} from '@reduxjs/toolkit';

import postsReducer from '../features/posts/postsSlice'
import userReducer from "../features/users/userSlice";

const store = configureStore({
    reducer: {
        posts: postsReducer,
        users: userReducer
    },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;