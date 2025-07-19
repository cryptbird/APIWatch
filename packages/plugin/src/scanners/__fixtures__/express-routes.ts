/**
 * Fixture for ExpressScanner tests.
 */
import express from 'express';
const app = express();

app.get('/users', (req, res) => res.json([]));
app.post('/users', (req, res) => res.status(201).json({}));
app.get('/users/:id', (req, res) => res.json({}));

const router = express.Router();
router.get('/items', (req, res) => res.json([]));
app.use('/api', router);

export default app;
