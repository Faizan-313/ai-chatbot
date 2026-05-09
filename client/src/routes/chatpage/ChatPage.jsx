import { useParams } from 'react-router-dom';
import NewPrompt from '../../components/newPrompt/NewPrompt';
import './chatpage.css';
import { useAuth } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import Markdown from 'react-markdown';
import { IKImage } from 'imagekitio-react';
import React from 'react';

function ChatPage() {
    const { id: chatId } = useParams();
    const { getToken } = useAuth();

    const { status, data, error } = useQuery({
        queryKey: ['chat', chatId],
        enabled: Boolean(chatId),
        queryFn: async () => {
            const token = await getToken();
            const base = import.meta.env.VITE_API_URL;
            if (!base) {
                throw new Error('Missing VITE_API_URL');
            }
            const res = await fetch(`${base}/api/chats/${chatId}`, {
                credentials: 'include',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const payload = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(
                    typeof payload === 'string'
                        ? payload
                        : payload?.error || 'Failed to load chat'
                );
            }
            return payload;
        },
    });

    return (
        <div className="chatPage">
            <div className="wrapper">
                <div className="chat">
                    {status === 'pending' && (
                        <div className="chatPage__state">Loading conversation…</div>
                    )}
                    {status === 'error' && (
                        <div className="chatPage__state chatPage__state--error">
                            {error?.message || 'Something went wrong'}
                        </div>
                    )}
                    {status === 'success' &&
                        data?.history?.map((message, index) => {
                            const text = message.parts?.[0]?.text ?? '';
                            return (
                                <React.Fragment key={`${index}-${message.role}`}>
                                    {message.img && (
                                        <IKImage
                                            urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
                                            path={message.img}
                                            height="300"
                                            width="400"
                                            transformation={[{ height: 300, width: 400 }]}
                                            loading="lazy"
                                            lqip={{ active: true, quality: 20 }}
                                        />
                                    )}
                                    {text ? (
                                        <div
                                            className={
                                                message.role === 'user' ? 'message user' : 'message'
                                            }
                                        >
                                            <Markdown>{text}</Markdown>
                                        </div>
                                    ) : null}
                                </React.Fragment>
                            );
                        })}

                    {data?._id && <NewPrompt data={data} />}
                </div>
            </div>
        </div>
    );
}

export default ChatPage;
