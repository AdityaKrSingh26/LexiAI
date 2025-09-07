# LexiAI – AI-Powered PDF Assistant  

LexiAI is an intelligent PDF assistant that helps you work smarter with documents. Upload PDFs, chat with them using AI, organize your documents in collections, and get instant answers to your questions. Built with modern web technologies for a smooth user experience.

## What LexiAI Can Do  

- **Smart PDF Chat** – Upload any PDF and ask questions about it. Get accurate answers from your documents using AI.
- **Document Collections** – Organize your PDFs into color-coded collections. Perfect for organizing research papers, books, or work documents.
- **Intelligent Search** – Find documents quickly with smart search across all your uploaded files.
- **Note Taking** – Take notes while reading and save them for later. All your notes are organized and easy to find.
- **Chat History** – Keep track of all your conversations with each document. Never lose important insights.
- **User Management** – Secure login system with personal document libraries for each user.
- **Cloud Storage** – All your documents are safely stored in the cloud and accessible from anywhere.
- **Responsive Design** – Works great on desktop, tablet, and mobile devices.

## How It Works

1. **Sign Up** – Create your free account to get started
2. **Upload PDFs** – Drag and drop your documents or browse to upload
3. **Organize** – Create collections to group related documents
4. **Chat** – Ask questions about your documents and get AI-powered answers
5. **Take Notes** – Save important insights and thoughts while reading
6. **Search** – Find any document or conversation quickly

## Tech Stack  

- **Frontend**: React.js, TailwindCSS, Vite  
- **Backend**: Express.js, Node.js  
- **Database**: MongoDB  
- **AI**: Google Gemini AI  
- **File Storage**: Cloudinary  
- **Authentication**: JWT Tokens  

## Screenshots  
<img width="1090" height="935" alt="image" src="https://github.com/user-attachments/assets/ca7a4b6b-a345-4df3-a426-688d1db27de2" />
<img width="1814" height="616" alt="image" src="https://github.com/user-attachments/assets/51d22f49-0e05-4f7e-9e44-c29f15651363" />
<img width="1916" height="947" alt="image" src="https://github.com/user-attachments/assets/8abeb417-26a5-4d9d-b4ea-bb063f8e8917" />
<img width="1904" height="950" alt="image" src="https://github.com/user-attachments/assets/e86ec7af-3d3d-43a4-b44a-a9b27146152f" />





(Include images of the UI here)  

## Installation  

Clone the repository:
```sh
git clone https://github.com/AdityaKrSingh26/LexiAI.git
cd LexiAI
```

### Backend Setup  

```sh
cd server
npm install
```

Create a `.env` file in the server directory:
```
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
JWT_SECRET=your_jwt_secret
```

Start the server:
```sh
npm start
```

### Frontend Setup  

```sh
cd client
npm install
npm run dev
```

The app will be running at `http://localhost:5173`

## Key Features Implemented

### Document Management
- **File Upload**: Drag & drop PDF upload with Cloudinary integration
- **Collections System**: Organize documents with custom colors and categories
- **Search & Filter**: Find documents quickly with text search and filters
- **Document Analytics**: Track usage statistics and document insights

### AI Chat System  
- **Context-Aware Responses**: AI understands document content and provides relevant answers
- **Chat History**: All conversations are saved and can be resumed anytime
- **Multi-Document Support**: Switch between different documents seamlessly
- **Real-time Processing**: Fast AI responses with loading indicators

### User Experience
- **Responsive Design**: Works on all screen sizes with mobile-first approach
- **Dark Theme**: Modern dark UI for comfortable reading
- **Loading States**: Smooth animations and loading indicators throughout
- **Error Handling**: User-friendly error messages and recovery options

### Security & Performance
- **JWT Authentication**: Secure user sessions with token-based auth
- **Rate Limiting**: API protection against spam and abuse
- **Input Validation**: Server-side validation for all user inputs
- **CORS Configuration**: Proper cross-origin request handling

## Usage  

1. **Create Account** – Sign up with your email and password
2. **Upload Documents** – Click "Upload Document" and select your PDF files  
3. **Organize** – Create collections and add documents to them
4. **Start Chatting** – Click on any document and start asking questions
5. **Take Notes** – Use the notes feature to save important information
6. **Manage Library** – View all your documents in the dashboard  

## What Makes This Project Special

- **Full-Stack Development** – Built from scratch with modern React frontend and Express.js backend. Shows proficiency in both client and server-side development.
- **AI Integration** – Implemented Google Gemini AI for document querying. Demonstrates ability to work with AI APIs and handle complex data processing.
- **Database Design** – Designed MongoDB schemas for users, documents, chats, and collections. Shows understanding of NoSQL database architecture.
- **File Handling** – Implemented secure file upload, processing, and storage with Cloudinary. Shows expertise in handling file operations.
- **State Management** – Used Zustand for efficient state management across the application. Demonstrates modern React patterns.
- **User Authentication** – Built secure login/signup system with JWT tokens and password hashing. Shows security best practices.
- **Responsive UI** – Crafted modern, mobile-first interface with TailwindCSS. Demonstrates frontend design skills.
