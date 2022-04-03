import React from 'react'
import {Post, Reaction} from "./postsSlice";
import {useAddReactionMutation} from "../api/apiSlice";

const reactionEmoji = {
    thumbsUp: '👍',
    hooray: '🎉',
    heart: '❤️',
    rocket: '🚀',
    eyes: '👀'
}

type ReactionButtonsProps = {
    post: Post;
}

export const ReactionButtons = ({post}: ReactionButtonsProps) => {
    const [addReaction] = useAddReactionMutation();

    const reactionButtons = Object.entries(reactionEmoji).map(([name, emoji]) => {
        return (
            <button
                key={name}
                type="button"
                className="muted-button reaction-button"
                onClick={() => {
                    addReaction({postId: post.id, reaction: name as keyof Reaction})
                }}
            >
                {emoji} {post.reactions[name as keyof Reaction]}
            </button>
        )
    })

    return <div>{reactionButtons}</div>
}