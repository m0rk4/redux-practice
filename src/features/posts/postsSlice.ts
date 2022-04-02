import {createAsyncThunk, createSlice, nanoid, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../../app/store";
import {client} from "../../api/client";

export interface Reaction {
    thumbsUp: number
    hooray: number
    heart: number
    rocket: number
    eyes: number
}

export interface Post {
    id: string;
    title: string;
    content: string;
    user: string;
    date: string;
    reactions: Reaction
}

export interface PostsState {
    posts: Post[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: string | null
}

const initialState: PostsState = {
    posts: [],
    status: 'idle',
    error: null
}

export const fetchPosts = createAsyncThunk<Post[], void>('posts/fetchPosts', async () => {
    const response = await client.get('/fakeApi/posts')
    return response.data
})

export const addNewPost = createAsyncThunk<Post, { title: string, content: string, user: string }>(
    'posts/addNewPost',
    async initialPost => {
        const response = await client.post('/fakeApi/posts', initialPost)
        return response.data
    }
)

const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        postAdded: {
            reducer(state, action: PayloadAction<Post>) {
                state.posts.push(action.payload);
            },
            prepare(title: string, content: string, userId: string, reactions: Reaction) {
                return {
                    payload: {
                        id: nanoid(),
                        date: new Date().toISOString(),
                        title,
                        content,
                        user: userId,
                        reactions
                    }
                };
            }
        },
        postUpdated(state, action: PayloadAction<Post>) {
            const {id, title, content} = action.payload;
            const existing = state.posts.find(post => post.id === id);
            if (existing) {
                existing.title = title;
                existing.content = content;
            }
        },
        reactionAdded(state, action: PayloadAction<{ postId: string, reaction: keyof Reaction }>) {
            const {postId, reaction} = action.payload;
            const existingPost = state.posts.find(post => post.id === postId);
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
                state.posts = state.posts.concat(action.payload)
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message ?? 'Unknown Error!'
            })
            .addCase(addNewPost.fulfilled, (state, action) => {
                state.posts.push(action.payload)
            })
    }
});

export const selectAllPosts = (state: RootState) => state.posts.posts;

export const selectPostById = (state: RootState, postId: string) =>
    state.posts.posts.find(post => post.id === postId);

export const {postAdded, postUpdated, reactionAdded} = postsSlice.actions;

export default postsSlice.reducer;