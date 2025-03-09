/**
 * Risk Scoring Service
 * 
 * This service calculates risk scores for blockchain addresses based on various risk factors.
 * It uses transaction history, entity associations, behavioral patterns, and other signals
 * to estimate the risk level of an address.
 */

const logger = require('../../utils/logger');
const entityService = require('../entity');
const identificationService = require('../identification');

// Risk factor weights (should ideally be configurable)
const RISK_WEIGHTS = {
  mixerInteraction: 0.8,
  sanctionedEntity: 0.9,
  darknetInteraction: 0.7,
  highRiskExchange: 0.6,
  unusualActivityPattern: 0.5,
  newAddress: 0.4,
  highValueTransfers: 0.5,
  rapidFundMovement: 0.6,
  manyHops: 0.4,
  lowTransparencyEntity: 0.5,
};

// Entity type risk levels (0 to 1, with 1 being highest risk)
const ENTITY_TYPE_RISK = {
  'Mixer': 0.9,
  'DarknetMarket': 0.9,
  'Sanctioned': 1.0,
  'HighRiskExchange': 0.7,
  'Exchange': 0.2,
  'DeFi Protocol': 0.3,
  'Token': 0.2,
  'Wallet': 0.2,
  'Unknown': 0.5,
};

/**
 * Calculate risk score for an address
 * @param {string} address - Blockchain address to analyze
 * @param {Object} options - Calculation options
 * @returns {Promise<Object>} Risk assessment result
 */
async function calculateAddressRisk(address, options = {}) {
  try {
    // Step 1: Get entity information for this address
    let entityInfo = null;
    
    try {
      entityInfo = await identificationService.identifyAddressEntity(address, {
        performAnalysis: true,
      });
    } catch (error) {
      logger.warn(`Entity identification failed for address ${address}: ${error.message}`);
      entityInfo = {
        entityId: null,
        entityName: 'Unknown',
        entityType: 'Unknown',
        confidence: 0,
      };
    }
    
    // Step 2: Get address transaction data
    // In a real implementation, this would be fetched from a data store
    // const transactions = await transactionService.getAddressTransactions(address);
    const transactions = []; // Placeholder
    
    // Step 3: Detect risk factors
    const riskFactors = detectRiskFactors(address, transactions, entityInfo);
    
    // Step 4: Calculate risk score based on detected factors
    const riskDetails = calculateRiskScore(riskFactors, entityInfo);
    
    // Step 5: Compile risk assessment result
    return {
      address,
      entityId: entityInfo.entityId,
      entityName: entityInfo.entityName,
      entityType: entityInfo.entityType,
      riskScore: riskDetails.score,
      riskLevel: riskLevelFromScore(riskDetails.score),
      riskFactors: riskDetails.significantFactors,
      transactionCount: transactions.length,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    logger.error(`Error calculating risk for address ${address}:`, error);
    throw new Error(`Risk scoring failed: ${error.message}`);
  }
}

/**
 * Calculate risk scores for multiple addresses
 * @param {Array} addresses - Blockchain addresses to analyze
 * @param {Object} options - Calculation options
 * @returns {Promise<Object>} Risk assessment results
 */
async function calculateBulkAddressRisk(addresses, options = {}) {
  try {
    const results = {};
    const errors = [];
    
    // Process addresses in batches to avoid overloading resources
    const batchSize = options.batchSize || 10;
    const batches = chunkArray(addresses, batchSize);
    
    for (const batch of batches) {
      const batchPromises = batch.map(async (address) => {
        try {
          const risk = await calculateAddressRisk(address, options);
          results[address] = risk;
        } catch (error) {
          errors.push({
            address,
            error: error.message,
          });
        }
      });
      
      await Promise.all(batchPromises);
    }
    
    return {
      results,
      errors,
      totalProcessed: addresses.length,
      successCount: Object.keys(results).length,
      errorCount: errors.length,
    };
  } catch (error) {
    logger.error('Error in bulk risk calculation:', error);
    throw new Error(`Bulk risk scoring failed: ${error.message}`);
  }
}

/**
 * Detect risk factors for an address based on its transactions and entity information
 * @param {string} address - Blockchain address
 * @param {Array} transactions - Transaction history
 * @param {Object} entityInfo - Entity information
 * @returns {Object} Detected risk factors with scores
 */
function detectRiskFactors(address, transactions, entityInfo) {
  const factors = {};
  
  // Entity-based risk factors
  if (entityInfo.entityType === 'Mixer' || hasMixerInteractions(address, transactions)) {
    factors.mixerInteraction = {
      score: RISK_WEIGHTS.mixerInteraction,
      description: 'Interaction with cryptocurrency mixing services detected',
    };
  }
  
  if (entityInfo.entityType === 'Sanctioned') {
    factors.sanctionedEntity = {
      score: RISK_WEIGHTS.sanctionedEntity,
      description: 'Address belongs to a sanctioned entity',
    };
  }
  
  if (entityInfo.entityType === 'DarknetMarket' || hasDarknetInteractions(address, transactions)) {
    factors.darknetInteraction = {
      score: RISK_WEIGHTS.darknetInteraction,
      description: 'Interaction with darknet markets detected',
    };
  }
  
  if (entityInfo.entityType === 'HighRiskExchange') {
    factors.highRiskExchange = {
      score: RISK_WEIGHTS.highRiskExchange,
      description: 'Address belongs to a high-risk exchange with weak KYC',
    };
  }
  
  // Transaction pattern-based risk factors
  if (hasUnusualActivityPattern(address, transactions)) {
    factors.unusualActivityPattern = {
      score: RISK_WEIGHTS.unusualActivityPattern,
      description: 'Unusual transaction patterns detected',
    };
  }
  
  if (isNewAddress(address, transactions)) {
    factors.newAddress = {
      score: RISK_WEIGHTS.newAddress,
      description: 'Recently created address with limited history',
    };
  }
  
  if (hasHighValueTransfers(address, transactions)) {
    factors.highValueTransfers = {
      score: RISK_WEIGHTS.highValueTransfers,
      description: 'High-value transfers detected',
    };
  }
  
  if (hasRapidFundMovement(address, transactions)) {
    factors.rapidFundMovement = {
      score: RISK_WEIGHTS.rapidFundMovement,
      description: 'Rapid movement of funds through multiple addresses',
    };
  }
  
  if (hasManyHops(address, transactions)) {
    factors.manyHops = {
      score: RISK_WEIGHTS.manyHops,
      description: 'Funds moving through many hops in short timeframe',
    };
  }
  
  if (isLowTransparencyEntity(entityInfo)) {
    factors.lowTransparencyEntity = {
      score: RISK_WEIGHTS.lowTransparencyEntity,
      description: 'Associated with entity having low transparency',
    };
  }
  
  return factors;
}

/**
 * Calculate the final risk score from the detected risk factors
 * @param {Object} riskFactors - Detected risk factors with scores
 * @param {Object} entityInfo - Entity information
 * @returns {Object} Risk score and significant factors
 */
function calculateRiskScore(riskFactors, entityInfo) {
  // Get base risk from entity type
  const entityTypeRisk = entityInfo.entityType ? 
    (ENTITY_TYPE_RISK[entityInfo.entityType] || ENTITY_TYPE_RISK.Unknown) : 
    ENTITY_TYPE_RISK.Unknown;
  
  // Start with entity-based risk, capped at 0.7 for entity type alone
  let score = Math.min(0.7, entityTypeRisk * entityInfo.confidence);
  
  // Count number of risk factors
  const factorCount = Object.keys(riskFactors).length;
  
  // Calculate the combined risk factor score
  let factorScore = 0;
  let maxFactorScore = 0;
  
  for (const factor in riskFactors) {
    factorScore += riskFactors[factor].score;
    if (riskFactors[factor].score > maxFactorScore) {
      maxFactorScore = riskFactors[factor].score;
    }
  }
  
  // Normalize factor score to avoid excessive accumulation
  const normalizedFactorScore = factorCount > 0 ?
    (factorScore / factorCount) * 0.7 + (maxFactorScore * 0.3) :
    0;
  
  // Combine scores with diminishing returns for multiple factors
  score = score + (1 - score) * normalizedFactorScore;
  
  // Cap at 0.95 maximum risk score
  score = Math.min(0.95, score);
  
  // Get significant factors (sorted by score)
  const significantFactors = Object.entries(riskFactors)
    .map(([key, value]) => ({
      type: key,
      score: value.score,
      description: value.description,
    }))
    .sort((a, b) => b.score - a.score);
  
  return {
    score,
    significantFactors,
  };
}

/**
 * Convert a risk score to a descriptive risk level
 * @param {number} score - Risk score (0 to 1)
 * @returns {string} Risk level description
 */
function riskLevelFromScore(score) {
  if (score >= 0.8) return 'Very High';
  if (score >= 0.6) return 'High';
  if (score >= 0.4) return 'Medium';
  if (score >= 0.2) return 'Low';
  return 'Very Low';
}

// Helper functions for detecting specific risk factors

/**
 * Check if an address has interactions with mixing services
 */
function hasMixerInteractions(address, transactions) {
  // This is a placeholder implementation
  // In a real system, this would check for interactions with known mixer addresses
  return false;
}

/**
 * Check if an address has interactions with darknet markets
 */
function hasDarknetInteractions(address, transactions) {
  // This is a placeholder implementation
  return false;
}

/**
 * Check if an address shows unusual activity patterns
 */
function hasUnusualActivityPattern(address, transactions) {
  // This is a placeholder implementation
  // Would analyze transaction timing, values, frequency compared to normal patterns
  return false;
}

/**
 * Check if an address is newly created with limited history
 */
function isNewAddress(address, transactions) {
  // This is a placeholder implementation
  if (transactions.length === 0) return true;
  
  // Check first transaction date
  const firstTx = transactions.reduce((earliest, tx) => {
    const txDate = new Date(tx.timestamp);
    return !earliest || txDate < earliest ? txDate : earliest;
  }, null);
  
  if (!firstTx) return true;
  
  // Consider 'new' if less than 30 days old
  const ageInDays = (Date.now() - firstTx.getTime()) / (1000 * 60 * 60 * 24);
  return ageInDays < 30;
}

/**
 * Check if an address has high-value transfers
 */
function hasHighValueTransfers(address, transactions) {
  // This is a placeholder implementation
  // Would check for transactions above certain thresholds
  return false;
}

/**
 * Check if funds move rapidly through the address
 */
function hasRapidFundMovement(address, transactions) {
  // This is a placeholder implementation
  return false;
}

/**
 * Check if funds move through many addresses (hops) quickly
 */
function hasManyHops(address, transactions) {
  // This is a placeholder implementation
  return false;
}

/**
 * Check if the entity has low transparency
 */
function isLowTransparencyEntity(entityInfo) {
  // This is a placeholder implementation
  return entityInfo.entityType === 'Unknown' || entityInfo.confidence < 0.3;
}

/**
 * Split an array into chunks of a specified size
 */
function chunkArray(array, chunkSize) {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

module.exports = {
  calculateAddressRisk,
  calculateBulkAddressRisk,
  riskLevelFromScore,
};