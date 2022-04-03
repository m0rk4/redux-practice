import {createAsyncThunk, createEntityAdapter, createSelector, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../../app/store";
import {client} from "../../api/client";

export interface Post {
    id: string;
    title: string;
    content: string;
    user: string;
    date: string;
    reactions: Reaction
}

export interface Reaction {
    thumbsUp: number
    hooray: number
    heart: number
    rocket: number
    eyes: number
}

export interface UpdatePostPayload {
    id: string;
    title: string;
    content: string;
}

export interface AddPostPayload {
    title: string;
    content: string;
    user: string;
}

export interface AddReactionPayload {
    postId: string;
    reaction: keyof Reaction;
}

const postsAdapter = createEntityAdapter<Post>({
    sortComparer: (a, b) => b.date.localeCompare(a.date)
});

const initialState = postsAdapter.getInitialState<{ status: string, error: string | null }>({
    status: 'idle',
    error: null
});

export const fetchPosts = createAsyncThunk<Post[]>('posts/fetchPosts', async () => {
    const response = await client.get('/fakeApi/posts');
    return response.data;
});

export const addNewPost = createAsyncThunk<Post, AddPostPayload>(
    'posts/addNewPost',
    async initialPost => {
        const response = await client.post('/fakeApi/posts', initialPost);
        return response.data;
    }
);

const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        postUpdated(state, action: PayloadAction<Post>) {
            const {id, title, content} = action.payload;
            const existing = state.entities[id];
            if (existing) {
                existing.title = title;
                existing.content = content;
            }
        },
        reactionAdded(state, action: PayloadAction<AddReactionPayload>) {
            const {postId, reaction} = action.payload;
            const existingPost = state.entities[postId];
            if (existingPost) {
                existingPost.reactions[reaction]++;
            }
        }
    },
    extraReducers(builder) {
        builder
            .addCase(fetchPosts.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.status = 'succeeded'
                postsAdapter.upsertMany(state, action.payload);
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message ?? 'Unknown Error!'
            })
            .addCase(addNewPost.fulfilled, postsAdapter.addOne)
    }
});

export const {postUpdated, reactionAdded} = postsSlice.actions;

export const {
    selectAll: selectAllPosts,
    selectById: selectPostById,
    selectIds: selectPostIds
} = postsAdapter.getSelectors<RootState>(state => state.posts);

export const selectPostsByUser = createSelector(
    [selectAllPosts, (state: RootState, userId: string) => userId],
    (posts, userId) => posts.filter(post => post.user === userId)
)

export default postsSlice.reducer;