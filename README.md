# LearningLab - AI-Powered Reading Comprehension Worksheet Generator

A powerful tool for educators and parents to create engaging reading comprehension worksheets tailored to specific grade levels and topics. This application leverages OpenAI's advanced language models to generate high-quality, educational content instantly.

## 🌟 Features

- **Grade-Level Specific Content (K-12)**
  - Tailored passages and questions for each grade level
  - Age-appropriate vocabulary and complexity
  
- **Topic-Based Generation**
  - Custom passage generation for any subject
  - Curriculum-aligned content options
  
- **AI-Powered Content**
  - Utilizes OpenAI's advanced language models
  - High-quality, contextually relevant content
  
- **User-Friendly Interface**
  - Clean, modern design using Tailwind CSS
  - Intuitive worksheet customization
  - Real-time preview capabilities
  
- **Professional Output**
  - Well-formatted worksheet generation
  - PDF export functionality
  - Consistent styling and layout

## 🛠️ Tech Stack

### Monorepo Structure

```
learninglab/
├── server/                 # Backend server
│   ├── src/               # Server source code
│   ├── client/            # Frontend React app
│   │   ├── src/           # React components and pages
│   │   ├── public/        # Static assets
│   │   └── ...
│   ├── package.json       # Combined dependencies
│   └── tsconfig.json      # TypeScript config
├── .gitignore
└── README.md
```

### Combined Stack

- **Frontend**
- **React** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - UI component library
- **Vite** - Build tool and development server

### Backend
- **Node.js** - Runtime environment
- **Express** - Web application framework
- **OpenAI API** - AI content generation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18.0.0 or higher)
- npm (v8.0.0 or higher) or yarn
- A valid OpenAI API key

## 🔄 Latest Updates (May 2025)

- Updated all dependencies to their latest versions
- Improved compatibility with the latest OpenAI API (v4.28.0)
- Enhanced security practices
- Performance optimizations

## 💡 Recommended Improvements

### Security
- Remove `dangerouslyAllowBrowser: true` flag from OpenAI configuration in server code
- Implement proper API key rotation and management
- Add rate limiting to prevent abuse

### Code Quality
- Migrate backend to TypeScript for better type safety
- Replace `any` types in frontend with proper interfaces
- Add comprehensive unit and integration tests
- Implement a more structured logging solution

### Features
- Add user authentication for worksheet management
- Implement worksheet saving and history
- Add more customization options for worksheets
- Support for multiple languages

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd client
   npm install
   cd ../..
   ```
3. Set up environment variables:
   ```bash
   cp server/.env.example server/.env
   # Edit the .env file with your OpenAI API key
   ```

### Development

Start both frontend and backend in development mode:

```bash
# From the project root
npm run dev
```

This will start:
- Backend server on `http://localhost:3000`
- Frontend development server on `http://localhost:5173` with hot reloading

The frontend will automatically proxy API requests to the backend.

### Production Build

```bash
# Build both frontend and backend
npm run build

# Start production server
npm start
```

The production build will serve the React app from the Express server at `http://localhost:3000`.

### Development Workflow

- **Frontend Development**: Work in `server/client/src/`
- **Backend Development**: Work in `server/src/`
- **Shared Types**: Define in `server/src/types/` and import in the frontend
- **Environment Variables**: Configure in `server/.env`

### Key Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:server` - Start only the backend server
- `npm run dev:client` - Start only the frontend development server
- `npm run build` - Build both frontend and backend for production
- `npm start` - Start production server

## 🛠️ Tech Stack

### Backend

- **Node.js** with **Express**
- **TypeScript** for type safety
- **OpenAI API** for AI-powered content generation
- **Environment variables** for configuration
- **RESTful API** design

## ⚙️ Environment Variables

Create a `.env` file in the server directory with the following variables:
```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## 🔒 Security Notes

- Never commit your `.env` file to version control
- Keep your OpenAI API key secure
- Use environment variables for all sensitive data
- The `.env.example` file is provided as a template

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions, please:
1. Check the existing issues
2. Create a new issue with a detailed description
3. Include steps to reproduce the problem
