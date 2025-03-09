const express = require('express');
const router = express.Router();

/**
 * @route GET /api/v1/block/recent
 * @description Get recent blocks
 * @access Public
 */
router.get('/recent', (req, res) => {
  // This is a placeholder implementation
  // In a real application, this would query the database for recent blocks
  
  // Simulate database delay
  setTimeout(() => {
    res.json([
      {
        number: 15000000,
        hash: '0xabc...123',
        timestamp: '2023-03-01T12:00:00Z',
        miner: '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',
        transactionCount: 156,
        gasUsed: '12500000',
        gasLimit: '15000000',
        size: '42500',
      },
      {
        number: 14999999,
        hash: '0xdef...456',
        timestamp: '2023-03-01T11:55:00Z',
        miner: '0x71660c4005BA85c37ccec55d0C4493E66Fe775d3',
        transactionCount: 143,
        gasUsed: '11800000',
        gasLimit: '15000000',
        size: '38700',
      },
    ]);
  }, 500);
});

/**
 * @route GET /api/v1/block/:numberOrHash
 * @description Get details for a specific block by number or hash
 * @access Public
 */
router.get('/:numberOrHash', (req, res) => {
  const numberOrHash = req.params.numberOrHash;
  
  // Simulate database delay
  setTimeout(() => {
    res.json({
      number: 15000000,
      hash: numberOrHash.startsWith('0x') ? numberOrHash : '0xabc...123',
      timestamp: '2023-03-01T12:00:00Z',
      miner: '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',
      parentHash: '0xdef...456',
      nonce: '0x1234567890abcdef',
      difficulty: '12345678901234',
      totalDifficulty: '1234567890123456789012345',
      transactionCount: 156,
      gasUsed: '12500000',
      gasLimit: '15000000',
      size: '42500',
      extraData: '0x',
    });
  }, 500);
});

/**
 * @route GET /api/v1/block/:numberOrHash/transactions
 * @description Get transactions for a specific block
 * @access Public
 */
router.get('/:numberOrHash/transactions', (req, res) => {
  const numberOrHash = req.params.numberOrHash;
  
  // Simulate database delay
  setTimeout(() => {
    res.json([
      {
        hash: '0x123...abc',
        blockNumber: 15000000,
        timestamp: '2023-03-01T12:00:00Z',
        from: '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',
        to: '0x71660c4005BA85c37ccec55d0C4493E66Fe775d3',
        value: '10.5 ETH',
        gasPrice: '20 Gwei',
        gasUsed: '21000',
        status: 'success',
      },
      {
        hash: '0x456...def',
        blockNumber: 15000000,
        timestamp: '2023-03-01T12:00:01Z',
        from: '0x71660c4005BA85c37ccec55d0C4493E66Fe775d3',
        to: '0x503828976D22510aad0201ac7EC88293211D23Da',
        value: '5.2 ETH',
        gasPrice: '22 Gwei',
        gasUsed: '21000',
        status: 'success',
      },
    ]);
  }, 500);
});

module.exports = router;