# PDF Chat Backend

## Overview
The PDF Chat Backend is a Node.js application that allows users to upload PDF documents and interact with them using the Gemini AI model. Users can ask questions about the uploaded PDFs, receive AI-generated responses, summarize the content, and visualize the information through flowcharts. The application also maintains a chat history for each PDF, enabling users to revisit their interactions.

## Features
- Upload PDFs and interact with them using the Gemini AI model.
- Ask questions about the uploaded PDF and receive AI-generated responses.
- Summarize the entire PDF content and display a clear, concise summary.
- Generate flowchart visualizations based on the content of the PDF.
- View chat history in a collapsible sidebar, optimized for both desktop and mobile users.

## Project Structure
```
pdf-chat-backend
├── src
│   ├── controllers          # Contains controllers for handling requests
│   ├── middleware           # Contains middleware for authentication and error handling
│   ├── models               # Contains data models for User, PDF, and Chat
│   ├── routes               # Contains route definitions for the API
│   ├── services             # Contains business logic and interactions with AI
│   ├── utils                # Contains utility functions for PDF processing and visualization
│   ├── config               # Contains configuration files for database and AI settings
│   └── app.js               # Initializes the Express application
├── .env                     # Environment variables for sensitive information
├── package.json             # NPM configuration file
├── server.js                # Entry point for starting the server
└── README.md                # Project documentation
```

## Installation
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/pdf-chat-backend.git
   ```
2. Navigate to the project directory:
   ```
   cd pdf-chat-backend
   ```
3. Install the dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the root directory and add your environment variables (e.g., database credentials, API keys).

## Usage
1. Start the server:
   ```
   npm start
   ```
2. Access the API at `http://localhost:3000`.

## API Endpoints
- **Authentication**
  - `POST /api/auth/login` - Log in a user
  - `POST /api/auth/register` - Register a new user

- **PDF Operations**
  - `POST /api/pdf/upload` - Upload a PDF
  - `GET /api/pdf/:id/summary` - Get a summary of a PDF
  - `GET /api/pdf/:id/chats` - Retrieve chat history for a specific PDF

- **Chat Operations**
  - `POST /api/chat` - Save a new chat
  - `GET /api/chat/:id` - Retrieve a specific chat

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.