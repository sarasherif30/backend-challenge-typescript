import http from 'http';
import express, { Express, Request, Response } from 'express';
import morgan from 'morgan';
import { BookingsRoute } from './bookings/bookings.route';
import prisma from './prisma';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';

export const app: Express = express();

// Logging
app.use(morgan('dev'));

// Parse the request
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Swagger
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerDocument));

// Routes
const bookingsRoute = new BookingsRoute();
app.use(bookingsRoute.getRouter());

// Error handling
app.use((req: Request, res: Response) => {
  const error = new Error('Not found');
  res.status(404).json({
    message: error.message
  });
});

// Server
let server: http.Server;

export async function startServer() {
  return new Promise((resolve, reject) => {
    const port = 8000;
    server = http.createServer(app);
    server
      .listen(port, () => {
        console.log(`The server is running on http://localhost:${port}`);
        resolve('Server started');
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

export async function stopServer() {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve('Server stopped');
    });
  });
}

async function initialize() {
  try {
    await prisma.$connect();

    // Start the server if not running
    if (!server) {
      await startServer();
    }
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

initialize()
  .then(() => {
    console.log('Initialized');
  })
  .catch((error) => {
    console.error(error);
  });
