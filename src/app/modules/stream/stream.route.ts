import express from 'express';
import { getStreamToken } from './stream.controller';

const router = express.Router();

// POST /api/v1/stream/token
router.post('/token', getStreamToken);

export const streamRoutes = router;
