import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from './routes/homepage/HomePage.jsx'
import DashboardPage from './routes/dashboardpage/DashboardPage.jsx'
import ChatPage from './routes/chatpage/ChatPage.jsx'
import Signin from './routes/authpage/Signin.jsx'
import SignUp from './routes/authpage/SignUp.jsx'
import RootLayout from './layouts/rootLayout/RootLayout.jsx'
import DashboardLayout from './layouts/dashboardLayout/DashboardLayout.jsx'


const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children:[
      {
        path: "/",
        element: <HomePage />,
      },
      {
        element: <DashboardLayout />,
        children: [
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          {
            path: '/dashboard/chats/:id',
            element: <ChatPage />,
          }
        ]
      },
      {
        path: '/sign-in/*',
        element: <Signin />,
      },
      {
        path: '/sign-up/*',
        element: <SignUp />
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
