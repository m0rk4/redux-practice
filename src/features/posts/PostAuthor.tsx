import React from 'react'
import {useAppSelector} from "../../app/hooks";
import {selectUserById} from "../users/userSlice";

type PostAuthorProps = { userId: string };
export const PostAuthor = ({userId}: PostAuthorProps) => {
    const author = useAppSelector(state => selectUserById(state, userId))

    return <span>by {author ? author.name : 'Unknown author'}</span>
}