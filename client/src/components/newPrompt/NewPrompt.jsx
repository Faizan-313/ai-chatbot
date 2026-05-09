import React from 'react';
import './newPrompt.css';
import Upload from '../upload/Upload.jsx';
import { IKImage } from 'imagekitio-react';
import model from '../../lib/gemini';
import Markdown from 'react-markdown';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';

const initialReplyLocks = new Set();

function buildGeminiHistory(history) {
    if (!history?.length) return [];
    const last = history[history.length - 1];
    if (last.role === 'user') {
        return history.slice(0, -1).map(({ role, parts }) => ({
            role,
            parts: [{ text: parts?.[0]?.text ?? '' }],
        }));
    }
    return history.map(({ role, parts }) => ({
        role,
        parts: [{ text: parts?.[0]?.text ?? '' }],
    }));
}

function NewPrompt({ data }) {
    const endRef = React.useRef(null);
    const formRef = React.useRef(null);

    const [question, setQuestion] = React.useState('');
    const [answer, setAnswer] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [img, setImg] = React.useState({
        isLoading: false,
        error: '',
        dbData: {},
        aiData: {},
    });

    const imgRef = React.useRef(img);
    React.useEffect(() => {
        imgRef.current = img;
    }, [img]);

    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    const chatId = String(data._id);

    const geminiChat = React.useMemo(
        () =>
            model.startChat({
                history: buildGeminiHistory(data?.history),
                generationConfig: {},
            }),
        [data]
    );

    const mutation = useMutation({
        mutationFn: async ({ question: q, answer: ans, imgPath }) => {
            const token = await getToken();
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: q ? q : undefined,
                    answer: ans,
                    img: imgPath || undefined,
                }),
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || 'Failed to save reply');
            }
            return res.json();
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
            await queryClient.invalidateQueries({ queryKey: ['userChats'] });
            setQuestion('');
            setAnswer('');
            setImg({
                isLoading: false,
                error: '',
                dbData: {},
                aiData: {},
            });
        },
        onError: (err) => {
            console.error(err);
        },
    });

    const add = React.useCallback(
        async (questionText) => {
            const snap = imgRef.current;
            try {
                setLoading(true);
                setQuestion(questionText);
                const hasImage =
                    snap.aiData &&
                    typeof snap.aiData === 'object' &&
                    Object.keys(snap.aiData).length > 0;
                const result = await geminiChat.sendMessageStream(
                    hasImage ? [snap.aiData, questionText] : [questionText]
                );
                let text = '';
                for await (const chunk of result.stream) {
                    const chunkText = chunk.text();
                    text += chunkText;
                    setAnswer(text);
                }
                await mutation.mutateAsync({
                    question: questionText,
                    answer: text,
                    imgPath: snap.dbData?.filePath,
                });
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        },
        [geminiChat, mutation]
    );

    React.useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [data, question, answer, img]);

    React.useEffect(() => {
        if (!data?._id || !data?.history?.length) return;
        if (data.history.length !== 1 || data.history[0].role !== 'user') return;
        if (initialReplyLocks.has(chatId)) return;
        initialReplyLocks.add(chatId);
        const text = data.history[0].parts?.[0]?.text;
        if (!text) {
            initialReplyLocks.delete(chatId);
            return;
        }
        void add(text).finally(() => {
            initialReplyLocks.delete(chatId);
        });
    }, [chatId, data, add]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const q = e.target.question?.value?.trim();
        if (!q || loading || mutation.isPending || img.isLoading) return;
        formRef.current?.reset();
        await add(q);
    };

    const busy = loading || mutation.isPending || img.isLoading;

    return (
        <>
            {img.isLoading && <div className="newPrompt__status">Uploading…</div>}
            {img.dbData?.filePath && (
                <IKImage
                    urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
                    path={img.dbData.filePath}
                    width={380}
                    transformation={[{ width: '380px' }]}
                    className="newPrompt__previewImg"
                />
            )}
            {question && <div className="message user">{question}</div>}
            {answer && (
                <div className="message">
                    <Markdown>{answer}</Markdown>
                </div>
            )}
            <div className="endChat" ref={endRef} />

            <form className="newForm" onSubmit={handleSubmit} ref={formRef}>
                <Upload setImg={setImg} />
                <input id="file" type="file" multiple={false} hidden />
                <input
                    type="text"
                    name="question"
                    placeholder="Ask anything…"
                    autoComplete="off"
                    disabled={busy}
                />
                <button type="submit" disabled={busy} aria-label="Send message">
                    <img src="/arrow.png" alt="" />
                </button>
            </form>
        </>
    );
}

export default NewPrompt;
