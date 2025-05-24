# LearningLab Server

This is the backend server for LearningLab, an AI-Powered Reading Comprehension Worksheet Generator.

## Prerequisites

- Node.js >= 16.0.0
- npm >= 7.0.0
- TypeScript >= 4.7.0

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/learninglab.git
   cd learninglab/server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the server root directory and add the required environment variables:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # CORS Configuration
   CORS_ORIGIN=http://localhost:5173
   
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   ```

### Development

To start the development server with hot-reload:

```bash
npm run dev
```

This will start the server with nodemon, which will automatically restart the server when files change.

### Building for Production

To build the application for production:

```bash
npm run build
```

This will compile the TypeScript code to JavaScript in the `dist` directory.

### Running in Production

To start the application in production mode:

```bash
npm start
```

## Project Structure

```
server/
├── src/                    # Source files
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── app.ts             # Express application setup
│   └── index.ts           # Application entry point
├── client/                # Frontend React application
├── public/                # Static files (served in production)
├── .env                   # Environment variables
├── .eslintrc.cjs          # ESLint configuration
├── .prettierrc            # Prettier configuration
├── package.json           # Project dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## API Documentation

### Health Check

- **GET /api/health**
  - Description: Check if the API is running
  - Response:
    ```json
    {
      "status": "ok",
      "timestamp": "2023-05-19T17:30:00.000Z"
    }
    ```

### Error Handling

The API uses standard HTTP status codes to indicate the success or failure of an API request.

- `200 OK` - The request was successful
- `400 Bad Request` - The request was invalid
- `401 Unauthorized` - Authentication is required
- `403 Forbidden` - The user doesn't have permission to access the resource
- `404 Not Found` - The requested resource was not found
- `500 Internal Server Error` - An error occurred on the server

## Testing

To run tests:

```bash
npm test
```

## Linting and Formatting

To check for linting errors:

```bash
npm run lint
```

To automatically fix linting errors:

```bash
npm run lint:fix
```

To format code according to Prettier:

```bash
npm run format
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Port the server will run on | 3000 |
| NODE_ENV | Application environment (development, production) | development |
| CORS_ORIGIN | Allowed CORS origin | http://localhost:5173 |
| OPENAI_API_KEY | OpenAI API key | - |

## Deployment

### Docker

Build the Docker image:

```bash
docker build -t learninglab-server .
```

Run the Docker container:

```bash
docker run -p 3000:3000 --env-file .env learninglab-server
```

### PM2

Install PM2 globally:

```bash
npm install -g pm2
```

Start the application with PM2:

```bash
NODE_ENV=production pm2 start dist/index.js --name learninglab-server
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
