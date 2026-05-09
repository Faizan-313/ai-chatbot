import { useMutation, useQueryClient } from '@tanstack/react-query';
import './dashboard.css';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: async (text) => {
            const token = await getToken();
            const base = import.meta.env.VITE_API_URL;
            if (!base) {
                throw new Error('Missing VITE_API_URL');
            }
            const res = await fetch(`${base}/api/chats`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });
            const payload = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(
                    typeof payload === 'string'
                        ? payload
                        : payload?.error || `Could not start chat (${res.status})`
                );
            }
            return payload;
        },
        onSuccess: async (response) => {
            if (!response?.id) return;
            await queryClient.invalidateQueries({ queryKey: ['userChats'] });
            navigate(`/dashboard/chats/${response.id}`);
        },
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const text = e.target.text?.value?.trim();
        if (!text || mutation.isPending) return;
        mutation.mutate(text);
        e.target.reset();
    };

    return (
        <div className="dashboardPage">
            <div className="texts">
                <div className="dashboardPage__brand">
                    <img src="/Logo.jpg" alt="" className="dashboardPage__brandLogo" />
                    <h1>AI Chat Bot</h1>
                </div>
                <p className="dashboardPage__subtitle">
                    Start a conversation — your thread is saved automatically.
                </p>
                <div className="options">
                    <div className="option">
                        <img src="/chat.png" alt="" />
                        <span>Create a new chat</span>
                    </div>
                    <div className="option">
                        <img src="/image.png" alt="" />
                        <span>Analyze images</span>
                    </div>
                    <div className="option">
                        <img src="/code.png" alt="" />
                        <span>Help with code</span>
                    </div>
                </div>
            </div>

            {mutation.isError && (
                <div className="dashboardPage__error" role="alert">
                    {mutation.error?.message || 'Could not create chat'}
                </div>
            )}

            <div className="formContainer">
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="text"
                        placeholder="Ask anything…"
                        autoComplete="off"
                        disabled={mutation.isPending}
                        aria-busy={mutation.isPending}
                    />
                    <button type="submit" disabled={mutation.isPending} aria-label="Send">
                        <img src="/arrow.png" alt="" />
                    </button>
                </form>
            </div>
        </div>
    );
}

export default DashboardPage;
