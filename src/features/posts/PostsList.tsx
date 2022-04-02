import React, {useEffect} from 'react'
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {Link} from "react-router-dom";
import {PostAuthor} from "./PostAuthor";
import {TimeAgo} from "./TimeAgo";
import {ReactionButtons} from "./ReactionButtons";
import {fetchPosts, Post, selectAllPosts} from "./postsSlice";
import {Spinner} from "../../components/Spinner";

type PostExcerptProps = {post: Post};
const PostExcerpt = ({ post }: PostExcerptProps) => {
    return (
        <article className="post-excerpt" key={post.id}>
            <h3>{post.title}</h3>
            <div>
                <PostAuthor userId={post.user} />
                <TimeAgo timestamp={post.date} />
            </div>
            <p className="post-content">{post.content.substring(0, 100)}</p>

            <ReactionButtons post={post} />
            <Link to={`/posts/${post.id}`} className="button muted-button">
                View Post
            </Link>
        </article>
    )
}

export const PostsList = () => {
    const dispatch = useAppDispatch();
    const posts = useAppSelector(selectAllPosts)
    const error = useAppSelector(state => state.posts.error)
    const postStatus = useAppSelector(state => state.posts.status)

    useEffect(() => {
        if (postStatus === 'idle') {
            dispatch(fetchPosts())
        }
    }, [postStatus, dispatch])

    let content

    if (postStatus === 'loading') {
        content = <Spinner text="Loading..." />
    } else if (postStatus === 'succeeded') {
        // Sort posts in reverse chronological order by datetime string
        const orderedPosts = posts
            .slice()
            .sort((a, b) => b.date.localeCompare(a.date))

        content = orderedPosts.map(post => (
            <PostExcerpt key={post.id} post={post} />
        ))
    } else if (postStatus === 'failed') {
        content = <div>{error}</div>
    }

    return (
        <section className="posts-list">
            <h2>Posts</h2>
            {content}
        </section>
    )
}