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

## 🔒 Security Features

### Abuse Prevention
- **Rate Limiting**: 10 worksheet generations per hour per IP
- **Request Size Limits**: Maximum 1KB request payload
- **Input Validation**: 
  - Grade level validation (K-12 only)
  - Topic length limits (3-100 characters)
  - Inappropriate content filtering
  - Spam pattern detection
- **Progressive Delays**: Automatic slowdown after 3 requests
- **Usage Monitoring**: Comprehensive request logging

### Content Safety
- Blocks inappropriate topics (violence, adult content, etc.)
- Validates educational grade levels
- Prevents spam and abuse patterns
- Detailed error messages for rejected content

## 💡 Future Improvements

### Security Enhancements
- User authentication with individual API quotas
- OpenAI API key rotation and management
- Request caching to reduce API costs

### Code Quality
- Add comprehensive unit and integration tests
- Implement structured logging with different levels
- Enhanced error tracking and monitoring

### Features
- User authentication for worksheet management
- Worksheet saving and history
- More customization options for worksheets
- Support for multiple languages

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm 8+
- **OpenAI API key** (required) - You must obtain your own API key from [OpenAI's platform](https://platform.openai.com/api-keys)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/LearningLab.git
   cd LearningLab
   ```

2. Install dependencies:
   ```bash
   # Install root dependencies and all workspace dependencies
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit the .env file with your OpenAI API key
   # You MUST replace 'your_openai_api_key_here' with your actual OpenAI API key
   # OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   ```

   **⚠️ Important**: You must provide your own OpenAI API key. Get one from [OpenAI's platform](https://platform.openai.com/api-keys). The application will not work without a valid API key.

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
- **Environment Variables**: Configure in `.env` (root level)

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

Create a `.env` file in the root directory with the following variables:
```env
# Required
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Security Settings (Optional - secure defaults provided)
WORKSHEET_RATE_LIMIT_MAX_REQUESTS=10
WORKSHEET_RATE_LIMIT_WINDOW_MS=3600000
GENERAL_RATE_LIMIT_MAX_REQUESTS=100
GENERAL_RATE_LIMIT_WINDOW_MS=900000
MAX_REQUEST_SIZE=1024
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
