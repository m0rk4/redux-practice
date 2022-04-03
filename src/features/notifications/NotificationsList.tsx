import React, {useLayoutEffect} from 'react'
import {useSelector} from 'react-redux'
import {formatDistanceToNow, parseISO} from 'date-fns'

import {allNotificationsRead, selectAllNotifications} from './notificationsSlice'
import {useAppDispatch, useAppSelector} from "../../app/hooks";
import {selectAllUsers} from "../users/userSlice";
import classnames from 'classnames';

export const NotificationsList = () => {
    const dispatch = useAppDispatch();
    const notifications = useSelector(selectAllNotifications)
    const users = useAppSelector(selectAllUsers)

    useLayoutEffect(() => {
        dispatch(allNotificationsRead())
    })

    const renderedNotifications = notifications.map(notification => {
        const date = parseISO(notification.date)
        const timeAgo = formatDistanceToNow(date)
        const user = users.find(user => user.id === notification.user) || {
            name: 'Unknown User'
        }

        const notificationClassname = classnames('notification', {
            new: notification.isNew
        })

        return (
            <div key={notification.id} className={notificationClassname}>
                <div>
                    <b>{user.name}</b> {notification.message}
                </div>
                <div title={notification.date}>
                    <i>{timeAgo} ago</i>
                </div>
            </div>
        )
    })

    return (
        <section className="notificationsList">
            <h2>Notifications</h2>
            {renderedNotifications}
        </section>
    )
}