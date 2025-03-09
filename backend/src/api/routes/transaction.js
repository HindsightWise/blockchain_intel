const express = require('express');
const router = express.Router();

/**
 * @route GET /api/v1/transaction/recent
 * @description Get recent transactions
 * @access Public
 */
router.get('/recent', (req, res) => {
  // This is a placeholder implementation
  // In a real application, this would query the database for recent transactions
  
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
        blockNumber: 14999999,
        timestamp: '2023-03-01T11:55:00Z',
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

/**
 * @route GET /api/v1/transaction/:hash
 * @description Get details for a specific transaction
 * @access Public
 */
router.get('/:hash', (req, res) => {
  const hash = req.params.hash;
  
  // Simulate database delay
  setTimeout(() => {
    res.json({
      hash,
      blockNumber: 15000000,
      timestamp: '2023-03-01T12:00:00Z',
      from: '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',
      to: '0x71660c4005BA85c37ccec55d0C4493E66Fe775d3',
      value: '10.5 ETH',
      gasPrice: '20 Gwei',
      gasUsed: '21000',
      gasLimit: '21000',
      nonce: 42,
      status: 'success',
      contractAddress: null,
      input: '0x',
    });
  }, 500);
});

/**
 * @route GET /api/v1/transaction/:hash/flow
 * @description Get transaction flow for visualizing related transactions
 * @access Public
 */
router.get('/:hash/flow', (req, res) => {
  const hash = req.params.hash;
  
  // Simulate database delay
  setTimeout(() => {
    res.json({
      rootTransaction: {
        hash,
        blockNumber: 15000000,
        timestamp: '2023-03-01T12:00:00Z',
        from: '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',
        to: '0x71660c4005BA85c37ccec55d0C4493E66Fe775d3',
        value: '10.5 ETH',
        gasPrice: '20 Gwei',
        gasUsed: '21000',
        status: 'success',
      },
      relatedTransactions: [
        {
          hash: '0x456...def',
          blockNumber: 14999999,
          timestamp: '2023-03-01T11:55:00Z',
          from: '0x71660c4005BA85c37ccec55d0C4493E66Fe775d3',
          to: '0x503828976D22510aad0201ac7EC88293211D23Da',
          value: '5.2 ETH',
          gasPrice: '22 Gwei',
          gasUsed: '21000',
          status: 'success',
        },
        {
          hash: '0x789...ghi',
          blockNumber: 15000010,
          timestamp: '2023-03-01T12:10:00Z',
          from: '0x71660c4005BA85c37ccec55d0C4493E66Fe775d3',
          to: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
          value: '2.8 ETH',
          gasPrice: '21 Gwei',
          gasUsed: '21000',
          status: 'success',
        },
      ],
      entities: {
        '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE': {
          name: 'Binance',
          type: 'Exchange',
        },
        '0x71660c4005BA85c37ccec55d0C4493E66Fe775d3': {
          name: 'Coinbase',
          type: 'Exchange',
        },
        '0x503828976D22510aad0201ac7EC88293211D23Da': {
          name: 'Ethereum Whale 1',
          type: 'Whale',
        },
        '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984': {
          name: 'Uniswap',
          type: 'DeFi Protocol',
        },
      },
    });
  }, 500);
});

module.exports = router;