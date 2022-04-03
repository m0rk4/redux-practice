import {createAsyncThunk, createEntityAdapter, createSlice} from '@reduxjs/toolkit'

import {client} from '../../api/client'
import {RootState} from "../../app/store";

export interface Notification {
    id: string;
    user: string;
    message: string;
    date: string;
    read: boolean;
    isNew: boolean;
}

const notificationAdapter = createEntityAdapter<Notification>({
    sortComparer: (a, b) => b.date.localeCompare(a.date)
});

export const fetchNotifications = createAsyncThunk<Notification[]>(
    'notifications/fetchNotifications',
    async (_, {getState}) => {
        const allNotifications = selectAllNotifications(getState() as RootState);
        const [latestNotification] = allNotifications;
        const latestTimestamp = latestNotification ? latestNotification.date : '';
        const response = await client.get(
            `/fakeApi/notifications?since=${latestTimestamp}`
        );
        return response.data;
    }
)

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState: notificationAdapter.getInitialState,
    reducers: {
        allNotificationsRead(state) {
            Object.values(state.entities).forEach(notification => {
                notification!.read = true;
            });
        }
    },
    extraReducers(builder) {
        builder.addCase(fetchNotifications.fulfilled, (state, action) => {
            notificationAdapter.upsertMany(state, action.payload);
            Object.values(state.entities).forEach(notification => {
                notification!.isNew = !notification!.read;
            });
        })
    }
})

export const {allNotificationsRead} = notificationsSlice.actions;

export const {
    selectAll: selectAllNotifications
} = notificationAdapter.getSelectors<RootState>(state => state.notifications);

export default notificationsSlice.reducer;