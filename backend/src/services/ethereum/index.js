const Web3 = require('web3');
const { ethers } = require('ethers');
const logger = require('../../utils/logger');

// Configuration
const providerUrl = process.env.ETH_PROVIDER_URL || 'https://mainnet.infura.io/v3/your-infura-key';

// Initialize Web3 and ethers providers
let web3;
let ethersProvider;

try {
  web3 = new Web3(providerUrl);
  ethersProvider = new ethers.providers.JsonRpcProvider(providerUrl);
  logger.info('Ethereum providers initialized successfully');
} catch (error) {
  logger.error('Failed to initialize Ethereum providers:', error);
}

/**
 * Get transaction details
 * @param {string} txHash - Transaction hash
 * @returns {Promise<Object>} Transaction details
 */
async function getTransaction(txHash) {
  try {
    const tx = await web3.eth.getTransaction(txHash);
    const receipt = await web3.eth.getTransactionReceipt(txHash);
    const block = await web3.eth.getBlock(tx.blockNumber);
    
    return {
      hash: tx.hash,
      blockNumber: tx.blockNumber,
      timestamp: new Date(block.timestamp * 1000).toISOString(),
      from: tx.from,
      to: tx.to,
      value: web3.utils.fromWei(tx.value, 'ether') + ' ETH',
      gasPrice: web3.utils.fromWei(tx.gasPrice, 'gwei') + ' Gwei',
      gasUsed: receipt.gasUsed.toString(),
      gasLimit: tx.gas.toString(),
      nonce: tx.nonce,
      status: receipt.status ? 'success' : 'failed',
      contractAddress: receipt.contractAddress,
      input: tx.input,
    };
  } catch (error) {
    logger.error(`Error fetching transaction ${txHash}:`, error);
    throw new Error(`Unable to fetch transaction: ${error.message}`);
  }
}

/**
 * Get address details
 * @param {string} address - Ethereum address
 * @returns {Promise<Object>} Address details
 */
async function getAddressDetails(address) {
  try {
    const balance = await web3.eth.getBalance(address);
    
    // We would typically query our database for additional information
    // For demo purposes, we return basic information from the blockchain
    return {
      address,
      balance: web3.utils.fromWei(balance, 'ether') + ' ETH',
      // The following fields would typically be populated from our database
      transactionCount: 0,
      firstTransaction: '',
      lastTransaction: '',
      entity: 'Unknown',
      tags: [],
    };
  } catch (error) {
    logger.error(`Error fetching address details ${address}:`, error);
    throw new Error(`Unable to fetch address details: ${error.message}`);
  }
}

/**
 * Get block details
 * @param {number|string} blockNumberOrHash - Block number or hash
 * @returns {Promise<Object>} Block details
 */
async function getBlock(blockNumberOrHash) {
  try {
    const block = await web3.eth.getBlock(blockNumberOrHash);
    
    return {
      number: block.number,
      hash: block.hash,
      timestamp: new Date(block.timestamp * 1000).toISOString(),
      miner: block.miner,
      parentHash: block.parentHash,
      nonce: block.nonce,
      difficulty: block.difficulty.toString(),
      totalDifficulty: block.totalDifficulty.toString(),
      transactionCount: block.transactions.length,
      gasUsed: block.gasUsed.toString(),
      gasLimit: block.gasLimit.toString(),
      size: block.size.toString(),
      extraData: block.extraData,
    };
  } catch (error) {
    logger.error(`Error fetching block ${blockNumberOrHash}:`, error);
    throw new Error(`Unable to fetch block: ${error.message}`);
  }
}

module.exports = {
  web3,
  ethersProvider,
  getTransaction,
  getAddressDetails,
  getBlock,
};