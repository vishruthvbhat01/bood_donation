const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, './frontend')));

const { MongoMemoryServer } = require('mongodb-memory-server');
const seed = require('./seed');

// MongoDB Connection
async function connectDB() {
  try {
    // Try local connection first with a fast timeout
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/blooddonation', {
      serverSelectionTimeoutMS: 2000
    });
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.log('⚠️ Local MongoDB not found. Starting in-memory database...');
    const mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log('✅ In-Memory MongoDB Connected');
    await seed(false); // populate with dummy data since it's empty
  }
}
connectDB();

// Routes
app.use('/api/donors', require('./routes/donors'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/stock', require('./routes/stock'));
app.use('/api/admin', require('./routes/admin'));

// Serve frontend for all other routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, './frontend/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
