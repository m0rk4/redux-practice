import {createEntityAdapter, createSelector, EntityState} from "@reduxjs/toolkit";
import {RootState} from "../../app/store";
import {apiSlice} from "../api/apiSlice";

export interface User {
    id: string;
    name: string;
}

const userAdapter = createEntityAdapter<User>();

const initialState = userAdapter.getInitialState();

export const extendedApiSlice = apiSlice.injectEndpoints({
   endpoints: builder => ({
       getUsers: builder.query<EntityState<User>, void>({
           query: () => '/users',
           transformResponse: (responseData: User[]) => {
               return userAdapter.setAll(initialState, responseData);
           }
       })
   })
});

export const { useGetUsersQuery } = extendedApiSlice

// Calling `someEndpoint.select(someArg)` generates a new selector that will return
// the query result object for a query with those parameters.
// To generate a selector for a specific query argument, call `select(theQueryArg)`.
// In this case, the users query has no params, so we don't pass anything to select()
export const selectUsersResult = extendedApiSlice.endpoints.getUsers.select()

export const selectUsersData = createSelector(
    selectUsersResult,
    usersResult => usersResult.data
);

export const {
    selectAll: selectAllUsers,
    selectById: selectUserById
} = userAdapter.getSelectors<RootState>(state => selectUsersData(state) ?? initialState);
