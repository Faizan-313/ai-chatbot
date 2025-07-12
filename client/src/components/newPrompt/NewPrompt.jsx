import React from 'react'
import './newPrompt.css';
import Upload from '../upload/Upload.jsx'
import { IKImage } from 'imagekitio-react';
import model  from '../../lib/gemini';
import Markdown from 'react-markdown';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';

function NewPrompt({data}) {
    const endRef = React.useRef(null);
    const formRef = React.useRef(null);

    const [question, setQuestion] = React.useState("");
    const [answer, setAnswer] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [img, setImg] = React.useState({
        isLoading: false,
        error: '',
        dbData: {},
        aiData: {}
    })

    const {getToken} = useAuth();

    const chat = model.startChat({
        history: data?.history?.map(({ role, parts }) => ({
            role,
            parts: [{ text: parts[0].text }]
        })),
        generationConfig: {}
    });


    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: async () => {
        const token = await getToken();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats/${data._id}`, {
            method: "PUT",
            credentials: "include",
            headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
            },
            body: JSON.stringify({ question: question.length ? question : undefined,
                    answer,
                    img: img.dbData?.filePath || undefined,
                })
        });
        const data2 = await res.json();
        return data2; 
        },
        onSuccess: async () => {
        queryClient.invalidateQueries({ queryKey: ["chat", data._id] }).then(()=>{
            setQuestion("")
            setAnswer("")
            setImg({
                isLoading: false,
                error: '',
                dbData: {},
                aiData: {}
            })
        });
        },
        onError:(err)=>{
            console.log(err)
        }
    });

    const add = async (question) => {
        try {
            setLoading(true);
            const result = await chat.sendMessageStream(
                Object.entries(img.aiData).length ? [img.aiData, question] : [question]
            );
            let text = '';
            for await (const chunk of result.stream) {
                const chunkText = chunk.text(); // get text from chunk
                text += chunkText;
                setAnswer(text);
            }
            mutation.mutate();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }

    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const question = e.target.question.value;
        if(!question) return;
        setQuestion(question);
        add(question);
        formRef.current.reset()
    }

    React.useEffect(()=>{
        endRef.current.scrollIntoView({ behavior: "smooth"});
    }, [data,question, answer, img])

    //in production we dont need this ref (only for dev mode)
    const run = React.useRef(false)  //as it is in restricted mode, this will allow it to run only once
    React.useEffect(()=>{
        if(!run.current){
            if(data?.history?.length === 1){
            add(data.history[0].parts[0].text);
            }
        }
        run.current = true;
    },[])

    return (
        <>
            {img.isLoading && <div className=''>Uploading...</div>}
            { img.dbData?.filePath && (
                <IKImage 
                    urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
                    path={img.dbData?.filePath}
                    width={380}
                    transformation={[{ width: "380px" }]}
                />
            )}
            {question && <div className='message user'>{question}</div>}
            {answer && <div className='message'><Markdown>{answer}</Markdown></div>}
            <div className="endChat" ref={endRef}></div>
            
            <form className='newForm' onSubmit={handleSubmit} ref={formRef}>
                <Upload setImg={setImg} />
                <input id='file' type="file" multiple={false} hidden />
                <input type="text" name='question' placeholder="Ask anything..." />
                <button>
                    <img src='/arrow.png' alt='arrow' />
                </button>
            </form>
        </>
    )
}


export default NewPrompt
