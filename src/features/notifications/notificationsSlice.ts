import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'

import {client} from '../../api/client'
import {RootState} from "../../app/store";

interface Notification {
    id: string;
    user: string;
    message: string;
    date: string;
    read: boolean;
    isNew: boolean;
}

export const fetchNotifications = createAsyncThunk<Notification[]>(
    'notifications/fetchNotifications',
    // skip first param for second: see Thunk Argumens
    async (_, {getState}) => {
        const allNotifications = selectAllNotifications(getState() as RootState)
        const [latestNotification] = allNotifications
        const latestTimestamp = latestNotification ? latestNotification.date : ''
        const response = await client.get(
            `/fakeApi/notifications?since=${latestTimestamp}`
        )
        return response.data
    }
)

const initialState: Notification[] = [];

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        allNotificationsRead(state) {
            state.forEach(notification => {
                notification.read = true
            });
        }
    },
    extraReducers(builder) {
        builder.addCase(fetchNotifications.fulfilled, (state, action) => {
            state.push(...action.payload);
            state.forEach(notification => {
                notification.isNew = !notification.read
            })
            state.sort((a, b) => b.date.localeCompare(a.date))
        })
    }
})

export const {allNotificationsRead} = notificationsSlice.actions;

export const selectAllNotifications = (state: RootState) => state.notifications

export default notificationsSlice.reducer