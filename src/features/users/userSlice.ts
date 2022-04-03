import {createAsyncThunk, createEntityAdapter, createSlice} from "@reduxjs/toolkit";
import {client} from "../../api/client";
import {RootState} from "../../app/store";

export interface User {
    id: string;
    name: string;
}

const userAdapter = createEntityAdapter<User>();

const initialState = userAdapter.getInitialState();

export const fetchUsers = createAsyncThunk<User[]>('users/fetchUsers', async () => {
    const response = await client.get('/fakeApi/users');
    return response.data;
});

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder.addCase(fetchUsers.fulfilled, userAdapter.setAll)
    }
});

export const {
    selectAll: selectAllUsers,
    selectById: selectUserById
} = userAdapter.getSelectors<RootState>(state => state.users);

export default userSlice.reducer;