import express from 'express';
import cors from 'cors';
import portfolioRoutes from './routes/portfolio';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/portfolio', portfolioRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server running with TypeScript' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
