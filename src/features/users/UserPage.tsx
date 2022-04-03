import React, {useMemo} from 'react'
import {Link, useParams} from 'react-router-dom'

import {Post} from '../posts/postsSlice'
import {useAppSelector} from "../../app/hooks";
import {selectUserById} from "./userSlice";
import {useGetPostsQuery} from "../api/apiSlice";
import {createSelector} from "@reduxjs/toolkit";

export const UserPage = () => {
    const {userId} = useParams();

    const user = useAppSelector(state => selectUserById(state, userId!))

    const selectPostsForUser = useMemo(() => {
        const emptyArray: Post[] = []
        // Return a unique selector instance for this page so that
        // the filtered results are correctly memoized
        return createSelector(
            (res: { data?: Post[] }) => res.data,
            (res: { data?: Post[] }, userId: string) => userId,
            (data, userId) => data?.filter(post => post.user === userId) ?? emptyArray
        );
    }, []);

    // Use the same posts query, but extract only part of its data
    const {postsForUser} = useGetPostsQuery(undefined, {
        selectFromResult: (result: { data?: Post[] }) => ({
            // We can optionally include the other metadata fields from the result here
            ...result,
            // Include a field called `postsForUser` in the hook result object,
            // which will be a filtered list of posts
            postsForUser: selectPostsForUser(result, userId!)
        })
    })

    const postTitles = postsForUser.map(post => (
        <li key={post.id}>
            <Link to={`/posts/${post.id}`}>{post.title}</Link>
        </li>
    ))

    return (
        <section>
            <h2>{user!.name}</h2>

            <ul>{postTitles}</ul>
        </section>
    )
}