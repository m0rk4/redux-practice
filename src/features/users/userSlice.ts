import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {client} from "../../api/client";
import {RootState} from "../../app/store";

interface User {
    id: string;
    name: string;
}

const initialState: User[] = [];

export const fetchUsers = createAsyncThunk<User[]>('users/fetchUsers', async () => {
    const response = await client.get('/fakeApi/users')
    return response.data
})


const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder.addCase(fetchUsers.fulfilled, (state, action) => {
            // replace the state by return value (2nd option of state updating)
            return action.payload
        })
    }
});

export const selectAllUsers = (state: RootState) => state.users;

export const selectUserById = (state: RootState, userId: string) =>
    state.users.find(user => user.id === userId)

export default userSlice.reducer;