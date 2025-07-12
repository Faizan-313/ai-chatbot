import { useLocation } from 'react-router-dom';
import NewPrompt from '../../components/newPrompt/NewPrompt';
import './chatpage.css';
import { useAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import Markdown from 'react-markdown';
import { IKImage } from 'imagekitio-react';
import React from 'react';


function ChatPage() {

  const path = useLocation().pathname;
  const chatId = path.split("/").pop()

  const {getToken} = useAuth();
    const { status, data, error } = useQuery({
        queryKey: ['chat',chatId],
        queryFn: async ()=>{
            const token = await getToken();
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`,{
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
    <div className='chatPage'>
      <div className="wrapper">
        <div className="chat">
          {status === "pending"
          ? "loading..."
          : error
          ? "something went wrong"
          : data?.history?.map((message, index) => (
              <React.Fragment key={index}>
                {message.img && (
                  <IKImage
                    urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
                    path={message.img}
                    height="300"
                    width="400"
                    transformation={[{ height: 300, width: 400 }]}
                    loading='lazy'
                    lqip={{ active: true, quality: 20 }}
                  />
                )}
                <div className={message.role === "user" ? "message user" : "message"}>
                  <Markdown>{message.parts[0].text}</Markdown>
                </div>
              </React.Fragment>
            ))}

          {data && <NewPrompt data={data}/>}
        </div>
      </div>
    </div>
  )
}

export default ChatPage
