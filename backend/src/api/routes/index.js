const express = require('express');
const router = express.Router();

// Import route modules
const addressRoutes = require('./address');
const entityRoutes = require('./entity');
const transactionRoutes = require('./transaction');
const blockRoutes = require('./block');

// Register routes
router.use('/address', addressRoutes);
router.use('/entity', entityRoutes);
router.use('/transaction', transactionRoutes);
router.use('/block', blockRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;