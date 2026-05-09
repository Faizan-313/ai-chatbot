import { Link } from 'react-router-dom';
import './chatList.css';
import { useAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';

function ChatList() {
    const {getToken} = useAuth();
    const { status, data, error } = useQuery({
        queryKey: ['userChats'],
        queryFn: async () => {
            const token = await getToken();
            const base = import.meta.env.VITE_API_URL;
            if (!base) {
                throw new Error('Missing VITE_API_URL');
            }
            const res = await fetch(`${base}/api/userChats`, {
                credentials: 'include',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const payload = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(
                    typeof payload?.error === 'string'
                        ? payload.error
                        : 'Failed to load chats'
                );
            }
            return payload;
        },
    });

    return (
        <div className='chatList'>
            <hr />
            <span className='title'>DASHBOARD</span>
            <Link to="/dashboard" className="chatList__cta">
                Create a new chat
            </Link>
            <Link to="/" className="chatList__secondary">
                Explore home
            </Link>
            <hr />
            <span className='title'>Recent Chats</span>
            <div className="list">
                {status === 'pending' && (
                    <p className="chatList__hint">Loading chats…</p>
                )}
                {status === 'error' && (
                    <p className="chatList__hint chatList__hint--error">
                        {error?.message || 'Could not load chats'}
                    </p>
                )}
                {status === 'success' &&
                    (data?.chats?.length ? (
                        data.chats.map((chat) => (
                            <Link to={`/dashboard/chats/${chat._id}`} key={chat._id}>
                                {chat.title}
                            </Link>
                        ))
                    ) : (
                        <p className="chatList__hint">No chats yet — start one from the dashboard.</p>
                    ))}
            </div>

            <hr />
            <div className="upgrade">
                <img src='/Logo.jpg' alt='logo' className='logo' />
                <div className="texts">
                    <span>Upgrade to Pro</span>
                    <span>Get more features and priority support</span>
                </div>
            </div>
        </div>
    )
}

export default ChatList
