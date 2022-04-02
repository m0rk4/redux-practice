import React, {useState} from 'react'
import {useDispatch} from 'react-redux'
import {useNavigate, useParams} from 'react-router-dom'

import {postUpdated} from './postsSlice'
import {useAppSelector} from "../../app/hooks";

export const EditPostForm = () => {
    const {postId} = useParams();

    const post = useAppSelector(state => state.posts.find(post => post.id === postId))

    const [title, setTitle] = useState(post!.title)
    const [content, setContent] = useState(post!.content)

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const onSavePostClicked = () => {
        if (title && content) {
            dispatch(postUpdated({id: postId!, title, content}))
            navigate(`/posts/${postId}`)
        }
    }

    return (
        <section>
            <h2>Edit Post</h2>
            <form>
                <label htmlFor="postTitle">Post Title:</label>
                <input
                    type="text"
                    id="postTitle"
                    name="postTitle"
                    placeholder="What's on your mind?"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
                <label htmlFor="postContent">Content:</label>
                <textarea
                    id="postContent"
                    name="postContent"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                />
            </form>
            <button type="button" onClick={onSavePostClicked}>
                Save Post
            </button>
        </section>
    )
}