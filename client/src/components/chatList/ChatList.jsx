import { Link } from 'react-router-dom';
import './chatList.css';
import { useAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';

function ChatList() {
    const {getToken} = useAuth();
    const { status, data, error } = useQuery({
        queryKey: ['userChats'],
        queryFn: async ()=>{
            const token = await getToken();
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/userChats`,{
                credentials: "include",
                headers:{
                    Authorization: `Bearer ${token}`
                },
            })
            const data = await res.json();
            return data;
        }
    })

    return (
        <div className='chatList'>
            <hr />
            <span className='title'>DASHBOARD</span>
            <Link to='/dashboard'>Create a new chat</Link>
            <Link to='/'>Explore</Link>
            <hr />
            <span className='title'>Recent Chats</span>
            <div className='list'>
                {(status === "pending")? "loading..." : error ? "something went wrong" : data?.chats?.map((chat)=>
                    <Link to={`/dashboard/chats/${chat._id}`} key={chat._id}>{chat.title}</Link>
                )}
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
