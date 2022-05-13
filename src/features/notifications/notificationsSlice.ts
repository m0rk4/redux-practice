import {
    createAction,
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
    isAnyOf,
} from '@reduxjs/toolkit'

import {forceGenerateNotifications} from '../../api/server'
import {apiSlice} from '../api/apiSlice'
import {RootState} from "../../app/store";

export interface Notification {
    id: string;
    user: string;
    message: string;
    date: string;
    read: boolean;
    isNew: boolean;
}

const notificationsReceived = createAction<Notification[]>(
    'notifications/notificationsReceived'
)

export const extendedApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getNotifications: builder.query<Notification[], void>({
            query: () => '/notifications',
            async onCacheEntryAdded(
                arg,
                {updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch}
            ) {
                // create a websocket connection when the cache subscription starts
                const ws = new WebSocket('ws://localhost')
                try {
                    // wait for the initial query to resolve before proceeding
                    await cacheDataLoaded

                    // when data is received from the socket connection to the server,
                    // update our query result with the received message
                    const listener = (event: { data: string }) => {
                        const message: { type: string, payload: Notification[] } = JSON.parse(event.data)
                        switch (message.type) {
                            case 'notifications': {
                                updateCachedData((draft) => {
                                    // Insert all received notifications from the websocket
                                    // into the existing RTKQ cache array
                                    draft.push(...message.payload)
                                    draft.sort((a, b) => b.date.localeCompare(a.date))
                                })
                                // Dispatch an additional action so we can track "read" state
                                dispatch(notificationsReceived(message.payload))
                                break
                            }
                            default:
                                break
                        }
                    }

                    ws.addEventListener('message', listener)
                } catch {
                    // no-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`,
                    // in which case `cacheDataLoaded` will throw
                }
                // cacheEntryRemoved will resolve when the cache subscription is no longer active
                await cacheEntryRemoved
                // perform cleanup steps once the `cacheEntryRemoved` promise resolves
                ws.close()
            },
        }),
    }),
})

export const {useGetNotificationsQuery} = extendedApi

const emptyNotifications: Notification[] = []

export const selectNotificationsResult = extendedApi.endpoints.getNotifications.select()

const selectNotificationsData = createSelector(
    selectNotificationsResult,
    (notificationsResult) => notificationsResult.data ?? emptyNotifications
)

export const fetchNotificationsWebsocket = createAsyncThunk<void, void>('notification/push-ws', async (_, {
    dispatch,
    getState
}) => {
    const allNotifications = selectNotificationsData(getState() as RootState)
    const [latestNotification] = allNotifications
    const latestTimestamp = latestNotification?.date ?? ''
    // Hardcode a call to the mock server to simulate a server push scenario over websockets
    forceGenerateNotifications(latestTimestamp)
})

const notificationsAdapter = createEntityAdapter<Notification>()

const matchNotificationsReceived = isAnyOf(
    notificationsReceived,
    extendedApi.endpoints.getNotifications.matchFulfilled
);

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState: notificationsAdapter.getInitialState(),
    reducers: {
        allNotificationsRead(state) {
            Object.values(state.entities).forEach((notification) => {
                notification!.read = true
            })
        },
    },
    extraReducers(builder) {
        builder.addMatcher(matchNotificationsReceived, (state, action) => {
            // Add client-side metadata for tracking new notifications
            const notificationsMetadata = action.payload!.map((notification) => ({
                id: notification.id,
                read: false,
                isNew: true,
            })) as Notification[];

            Object.values(state.entities).forEach((notification) => {
                // Any notifications we've read are no longer new
                notification!.isNew = !notification!.read
            })

            notificationsAdapter.upsertMany(state, notificationsMetadata)
        })
    },
})

export const {allNotificationsRead} = notificationsSlice.actions

export default notificationsSlice.reducer

export const {
    selectAll: selectNotificationsMetadata,
    selectEntities: selectMetadataEntities,
} = notificationsAdapter.getSelectors((state: RootState) => state.notifications)
