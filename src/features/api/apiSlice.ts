import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {AddPostPayload, Post} from "../posts/postsSlice";

export const apiSlice = createApi({
    // The cache reducer expects to be added at `state.api` (already default - this is optional)
    reducerPath: 'api',
    // All of our requests will have URLs starting with '/fakeApi'
    baseQuery: fetchBaseQuery({baseUrl: '/fakeApi'}),
    // The "endpoints" represent operations and requests for this server
    endpoints: builder => ({
        // The `getPosts` endpoint is a "query" operation that returns data
        getPosts: builder.query<Post[], void>({
            // The URL for the request is '/fakeApi/posts'
            query: () => '/posts'
        }),
        getPost: builder.query<Post, string>({
            query: (postId) => `/posts/${postId}`
        }),
        addNewPost: builder.mutation<Post, AddPostPayload>({
            query: initialPost => ({
                url: '/posts',
                method: 'POST',
                body: initialPost
            })
        })
    })
});

export const {useGetPostsQuery, useGetPostQuery, useAddNewPostMutation} = apiSlice;

