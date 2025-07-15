# AI Chatbot

A modular AI chatbot system with separate client and server components, designed for flexibility and easy integration.

## Features

- Modular client-server architecture
- Natural language understanding
- Context-aware conversations
- Extensible command and plugin system
- Easy integration with messaging platforms
- Image upload and processing support
- Secure authentication with Clerk

## Project Structure

- `client/` — Frontend client implementations (React, Vite)
- `server/` — Backend server handling AI logic, APIs, and integrations

## Getting Started

### Prerequisites

- Node.js 14+ (for both client and server)
- npm (comes with Node.js)
- MongoDB instance (local or cloud)
- Clerk account for authentication
- ImageKit account for image uploads

### Installation

Clone the repository and install dependencies for both client and server:

```bash
git clone https://github.com/yourusername/aichatbot.git
cd aichatbot/client
npm install
cd ../server
npm install
```

### Environment Variables

Create a `.env` file in both `client/` and `server/` directories with the following variables:

**Server (`server/.env`):**
```
VITE_IMAGE_KIT_ENDPOINT=your_imagekit_endpoint
VITE_IMAGE_KIT_PUBLIC_KEY=your_imagekit_public_key
VITE_IMAGE_KIT_PRIVATE_KEY=your_imagekit_private_key
CLIENT_URL=http://localhost:5173
MONGO=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
```

**Client (`client/.env`):**
```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_IMAGE_KIT_ENDPOINT=your_imagekit_endpoint
VITE_IMAGE_KIT_PUBLIC_KEY=your_imagekit_public_key
VITE_GEMINI_PUBLIC_KEY=your_gemini_public_key
VITE_API_URL=http://localhost:3000
```

> **Note:** Replace the placeholder values with your actual credentials.

### Usage

Start the server:

```bash
cd server
npm start
```

Start the client in a separate terminal:

```bash
cd client
npm run dev
```

## Contributing

Contributions are welcome! Check the contribution.md for more information.

## License

This project is licensed under the MIT License.
