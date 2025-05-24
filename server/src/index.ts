import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

// Import configuration and routes
import { PORT, CORS_ORIGIN, NODE_ENV } from './config/index.js';
import worksheetRoutes from './routes/worksheet.js';
import { errorHandler } from './middleware/errorHandler.js';

console.log(`🚀 Starting LearningLab server in ${NODE_ENV} mode...`);

// Load environment variables
dotenv.config();

// Top-level error handling
process.on('uncaughtException', (error) => {
  console.error('\n🚨 UNCAUGHT EXCEPTION! Shutting down...');
  console.error(error.name, error.message);
  console.error(error.stack || '');
  
  // Give server time to handle current requests
  setTimeout(() => {
    process.exit(1);
  }, 100);
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error('\n🚨 UNHANDLED REJECTION! Shutting down...');
  const error = reason as Error;
  console.error('Unhandled Rejection reason:', error);
  console.error(error.stack || '');
  
  // Check if server is defined before trying to close it
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Define app first
const app = express();
const isProduction = NODE_ENV === 'production';

// Declare server variable with proper type
type ServerType = ReturnType<typeof app.listen>;
let server: ServerType | undefined = undefined;

// Handle SIGTERM for graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 SIGTERM RECEIVED. Shutting down gracefully');
  if (server) {
    server.close(() => {
      console.log('💥 Process terminated!');
    });
  } else {
    process.exit(0);
  }
});

// App and server configuration moved above server declaration

// Basic request logging middleware
app.use((req: Request, _res: Response, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: CORS_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Simple health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// API Routes
app.use('/api', worksheetRoutes);

// Serve static files from the React app in production
if (isProduction) {
  const publicPath = path.join(__dirname, '../../public');
  console.log(`Serving static files from: ${publicPath}`);
  
  // Serve static files
  app.use(express.static(publicPath));
  
  // Handle React routing, return all requests to React app
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// Development mode - provide a simple response for the root route
if (!isProduction) {
  app.get('/', (_req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>LearningLab Dev Server</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px;
            }
            .container { 
              padding: 20px; 
              border-radius: 8px; 
              background: #f8f9fa; 
              margin-top: 40px;
            }
            h1 { color: #2c3e50; }
            .link { 
              display: inline-block; 
              margin-top: 20px; 
              padding: 10px 15px; 
              background: #3182ce; 
              color: white; 
              text-decoration: none; 
              border-radius: 4px;
            }
            .link:hover { background: #2c5282; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>LearningLab Development Server</h1>
            <p>Welcome to the LearningLab development environment.</p>
            <p>The React frontend is running on <a href="http://localhost:5173">http://localhost:5173</a></p>
            <p>API endpoints are available under <code>/api</code> path</p>
            <a href="http://localhost:5173" class="link">Go to React App</a>
            <a href="/api/health" class="link" style="margin-left: 10px;">Check API Health</a>
          </div>
        </body>
      </html>
    `);
  });
}

// 404 handler for unmatched routes
app.use((req: Request, res: Response) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ 
      status: 'error',
      message: 'API endpoint not found',
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  } else if (!isProduction) {
    res.redirect('http://localhost:5173/404');
  } else {
    res.status(404).send('Not found');
  }
});

// Error handling middleware
app.use(errorHandler);

// Start server
server = app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT} in ${isProduction ? 'production' : 'development'} mode`);
  console.log(`📅 ${new Date().toISOString()}`);
  console.log('----------------------------------------');
  
  if (!isProduction) {
    console.log(`🔗 Frontend dev server: http://localhost:5173`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
