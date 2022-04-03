import React, {useState} from 'react'
import {useAppSelector} from "../../app/hooks";
import {selectAllUsers} from "../users/userSlice";
import {useAddNewPostMutation} from "../api/apiSlice";

export const AddPostForm = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [userId, setUserId] = useState('');

    const [addNewPost, {isLoading}] = useAddNewPostMutation();
    const users = useAppSelector(selectAllUsers);

    const canSave = [title, content, userId].every(Boolean) && !isLoading;

    const onSavePostClicked = async () => {
        if (canSave) {
            try {
                await addNewPost({title, content, user: userId}).unwrap();
                setTitle('')
                setContent('')
                setUserId('')
            } catch (err) {
                console.error('Failed to save the post: ', err)
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