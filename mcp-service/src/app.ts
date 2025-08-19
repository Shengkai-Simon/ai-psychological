import express, { Application, Request, Response } from 'express';
import 'dotenv/config';

import surveyRoutes from './api/survey.routes';
import errorHandler from './middleware/errorHandler.middleware';
import { ResponseHandler } from './utils/response.util';

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// This public health check endpoint
app.get('/health', (req: Request, res: Response) => {
    ResponseHandler.success(res, { status: 'UP', timestamp: new Date() });
});

// All our routes are now under a single router
const apiRouter = express.Router();
apiRouter.use(surveyRoutes);

// Mount the router on the main app
app.use('/api', apiRouter);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`MCP Service is running on port ${PORT}`);
});
