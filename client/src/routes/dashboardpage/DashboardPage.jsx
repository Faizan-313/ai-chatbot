import { useMutation, useQueryClient } from '@tanstack/react-query';
import './dashboard.css';
import {useAuth} from "@clerk/clerk-react";
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
  const {getToken} = useAuth()
  const queryClient = useQueryClient()

  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: async (text) => {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chats`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      return data; 
    },
    onSuccess: async (response) => {
      console.log('response:',response)
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      navigate(`/dashboard/chats/${response.id}`);
    },
  });


  const handleSubmit = async (e)=>{
    e.preventDefault();
    const text = e.target.text.value;
    if(!text) return;
    mutation.mutate(text);
  }

  return (
    <div className='dashboardPage'>
      <div className="texts">
        <div className="logo">
          <img src='/Logo.jpg' alt='logo' />
          <h1>AI Chat Bot</h1>
        </div>
        <div className="options">
          <div className="option">
            <img src='/chat.png' alt='chat' />
            <span>Create a new chat</span>
          </div>
          <div className="option">
            <img src='/image.png' alt='image' />
            <span>Analyze Images</span>
          </div>
          <div className="option">
            <img src='/code.png' alt='code' />
            <span>Help me with code</span>
          </div>
        </div>
        
      </div>
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <input type="text" name='text' placeholder="Ask anything..." />
          <button type="submit">
            <img src='/arrow.png' alt='arrow' />
          </button>
        </form>
      </div>
    </div>
  )
}

export default DashboardPage
