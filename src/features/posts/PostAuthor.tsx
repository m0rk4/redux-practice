import React from 'react'
import {useAppSelector} from "../../app/hooks";

type PostAuthorProps = {
    userId: string;
}

export const PostAuthor = ({userId}: PostAuthorProps) => {
    const author = useAppSelector(state =>
        state.users.find(user => user.id === userId)
    )

    return <span>by {author ? author.name : 'Unknown author'}</span>
}