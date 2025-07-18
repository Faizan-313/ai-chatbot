import { Outlet, Link } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react'
import { SignedIn,  UserButton } from '@clerk/clerk-react';
import './rootLayout.css';
import { QueryClient, QueryClientProvider} from '@tanstack/react-query'


const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
    throw new Error('Missing Publishable Key')
}

const queryClient = new QueryClient()
function RootLayout() {
    return (
        <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl='/'>
            <QueryClientProvider client={queryClient}>
                <div className='rootLayout'>
                    <header >
                        <Link to="/">
                            <img src='/Logo.jpg' className='logo' alt='logo' />
                            <span>AI Chat Bot</span>
                        </Link>
                        <div className='user'>
                            <SignedIn>
                                <UserButton />
                            </SignedIn>
                        </div>
                    </header>
                    <main>
                        <Outlet />
                    </main>
                </div>
            </QueryClientProvider>
        </ClerkProvider>
    )
}

export default RootLayout
