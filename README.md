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

### Frontend
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

## 🚀 Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/LearningLab.git
   cd LearningLab
   ```

2. **Backend Setup**
   ```bash
   # Navigate to server directory
   cd server
   
   # Install dependencies
   npm install
   
   # Configure environment variables
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   
   # Start the server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   # Navigate to UI directory
   cd ui
   
   # Install dependencies
   npm install
   
   # Start the development server
   npm run dev
   ```

4. **Access the Application**
   - Backend will run on: http://localhost:3001
   - Frontend will run on: http://localhost:5173

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
