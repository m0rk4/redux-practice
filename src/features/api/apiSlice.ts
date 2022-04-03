import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {AddPostPayload, AddReactionPayload, Post, UpdatePostPayload} from "../posts/postsSlice";

export const apiSlice = createApi({
    // The cache reducer expects to be added at `state.api` (already default - this is optional)
    reducerPath: 'api',
    // default cache time
    keepUnusedDataFor: 60,
    // All of our requests will have URLs starting with '/fakeApi'
    baseQuery: fetchBaseQuery({baseUrl: '/fakeApi'}),
    // The "endpoints" represent operations and requests for this server
    tagTypes: ['Post'],
    endpoints: builder => ({
        // The `getPosts` endpoint is a "query" operation that returns data
        getPosts: builder.query<Post[], void>({
            // The URL for the request is '/fakeApi/posts'
            query: () => '/posts',
            providesTags: (result = [], error, arg) => [
                {type: 'Post' as const, id: 'LIST'},
                ...result.map(({id}) => ({type: 'Post' as const, id}))
            ]
        }),
        getPost: builder.query<Post, string>({
            query: (postId) => `/posts/${postId}`,
            providesTags: (result, error, arg: string) => [{type: 'Post', id: arg}]
        }),
        addNewPost: builder.mutation<Post, AddPostPayload>({
            query: initialPost => ({
                url: '/posts',
                method: 'POST',
                body: initialPost
            }),
            invalidatesTags: [{type: 'Post' as const, id: 'LIST'}]
        }),
        editPost: builder.mutation<Post, UpdatePostPayload>({
            query: post => ({
                url: `/posts/${post.id}`,
                method: 'PATCH',
                body: post
            }),
            invalidatesTags: (result: Post | undefined, error, arg: UpdatePostPayload) => [{type: 'Post', id: arg.id}]
        }),
        addReaction: builder.mutation<Post, AddReactionPayload>({
            query: ({postId, reaction }) => ({
                url: `posts/${postId}/reactions`,
                method: 'POST',
                // In a real app, we'd probably need to base this on user ID somehow
                // so that a user can't do the same reaction more than once
                body: { reaction }
            }),
            /**
             * OPTIMISTIC UPDATE
             */
            async onQueryStarted({postId, reaction}: AddReactionPayload, { dispatch, queryFulfilled}) {
                // `updateQueryData` requires the endpoint name and cache key arguments,
                // so it knows which piece of cache state to update
                const patchResult = dispatch(
                    /**
                     * updating cache
                     */
                    apiSlice.util.updateQueryData('getPosts', undefined, draft => {
                        // The `draft` is Immer-wrapped and can be "mutated" like in createSlice
                        const post = draft.find(post => post.id === postId)
                        if (post) {
                            post.reactions[reaction]++
                        }
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            }
        })
    })
});

export const {
    useGetPostsQuery,
    useGetPostQuery,
    useAddNewPostMutation,
    useEditPostMutation,
    useAddReactionMutation
} = apiSlice;

