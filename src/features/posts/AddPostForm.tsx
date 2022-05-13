import React, {useState} from 'react'
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {addNewPost} from "./postsSlice";
import {selectAllUsers} from "../users/userSlice";

export const AddPostForm = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [userId, setUserId] = useState('');
    const [addRequestStatus, setAddRequestStatus] = useState('idle')

    const dispatch = useAppDispatch();
    const users = useAppSelector(selectAllUsers);

    const canSave =
        [title, content, userId].every(Boolean) && addRequestStatus === 'idle'

    const onSavePostClicked = async () => {
        if (canSave) {
            try {
                setAddRequestStatus('pending')
                /**
                 * However, it's common to want to write logic that looks at
                 * the success or failure of the actual request that was made.
                 * Redux Toolkit adds a .unwrap() function to the returned Promise,
                 * which will return a new Promise that either has the actual action.payload
                 * value from a fulfilled action, or throws an error if it's the rejected action.
                 * This lets us handle success and failure in the component using normal try/catch logic.
                 */
                await dispatch(addNewPost({title, content, user: userId})).unwrap()
                setTitle('')
                setContent('')
                setUserId('')
            } catch (err) {
                console.error('Failed to save the post: ', err)
            } finally {
                setAddRequestStatus('idle')
            }
        }
    }

    const usersOptions = users.map(user => (
        <option key={user.id} value={user.id}>
            {user.name}
        </option>
    ));


    return (
        <section>
            <h2>Add a New Post</h2>
            <form>
                <label htmlFor="postTitle">Post Title:</label>
                <input
                    type="text"
                    id="postTitle"
                    name="postTitle"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
                <label htmlFor="postAuthor">Author:</label>
                <select id="postAuthor" value={userId} onChange={e => setUserId(e.target.value)}>
                    <option value="">--</option>
                    {usersOptions}
                </select>
                <label htmlFor="postContent">Content:</label>
                <textarea
                    id="postContent"
                    name="postContent"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                />
                <button type="button" onClick={onSavePostClicked} disabled={!canSave}>Save Post</button>
            </form>
        </section>
    );
}