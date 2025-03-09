/**
 * Entity Identification Service
 * 
 * This service orchestrates the process of identifying entities from blockchain data.
 * It combines clustering algorithms and attribution methods to map addresses to entities.
 */

const logger = require('../../utils/logger');
const clusteringService = require('./clusteringService');
const entityAttributionService = require('./entityAttribution');
const entityService = require('../entity');

/**
 * Identify entities from a batch of transactions
 * @param {Array} transactions - Array of transactions to analyze
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Identification results
 */
async function identifyEntitiesFromTransactions(transactions, options = {}) {
  try {
    // Step 1: Extract unique addresses from transactions
    const addresses = extractUniqueAddresses(transactions);
    logger.info(`Extracted ${addresses.length} unique addresses from ${transactions.length} transactions`);
    
    // Step 2: Apply address clustering
    const clusters = await clusteringService.combinedClustering(transactions, addresses);
    const clusterCount = Object.keys(clusters).length;
    logger.info(`Identified ${clusterCount} address clusters`);
    
    // Step 3: Attribute clusters to entities
    const attributionResults = await entityAttributionService.attributeClusters(clusters);
    logger.info(`Completed entity attribution for ${clusterCount} clusters`);
    
    // Step 4: Update entity database with new findings (if enabled)
    const shouldUpdateEntities = options.updateEntities !== false;
    let updateResults = null;
    
    if (shouldUpdateEntities) {
      const confidenceThreshold = options.confidenceThreshold || 0.8;
      updateResults = await entityAttributionService.updateEntitiesWithAttributions(
        attributionResults,
        confidenceThreshold
      );
      
      logger.info(
        `Entity database update: ${updateResults.updated.length} entities updated, ` +
        `${updateResults.created.length} entities created, ` +
        `${updateResults.skipped.length} clusters skipped`
      );
    }
    
    // Step 5: Return identification results
    return {
      transactionCount: transactions.length,
      addressCount: addresses.length,
      clusterCount,
      clusters,
      attributions: attributionResults,
      updates: updateResults,
    };
  } catch (error) {
    logger.error('Error in entity identification process:', error);
    throw new Error(`Entity identification failed: ${error.message}`);
  }
}

/**
 * Identify entity for a specific address
 * @param {string} address - Blockchain address to identify
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Identification result
 */
async function identifyAddressEntity(address, options = {}) {
  try {
    // Step 1: Try to find entity from existing database
    const knownEntity = await entityService.findEntityForAddress(address);
    
    if (knownEntity) {
      return {
        address,
        entityId: knownEntity.id,
        entityName: knownEntity.name,
        entityType: knownEntity.type,
        confidence: knownEntity.confidenceScore,
        method: 'existing_entry',
        analysisPerformed: false,
      };
    }
    
    // Step 2: If not found and analysis is enabled, perform deeper identification
    const shouldAnalyze = options.performAnalysis !== false;
    
    if (shouldAnalyze) {
      // Fetch transactions for this address (in a real implementation)
      // const transactions = await transactionService.getAddressTransactions(address);
      const transactions = []; // Placeholder
      
      // Perform attribution analysis
      const attribution = await entityAttributionService.attributeAddress(address, transactions);
      
      return {
        address,
        entityId: attribution.entityId,
        entityName: attribution.entityName,
        entityType: attribution.entityType,
        confidence: attribution.confidence,
        method: attribution.attributionMethod,
        analysisPerformed: true,
        transactionsAnalyzed: transactions.length,
        ...(attribution.relatedAddresses && {
          relatedAddresses: attribution.relatedAddresses,
        }),
        ...(attribution.matchedAddresses && {
          matchedAddresses: attribution.matchedAddresses,
        }),
      };
    }
    
    // Step 3: If no analysis performed, return unknown result
    return {
      address,
      entityId: null,
      entityName: 'Unknown',
      entityType: 'Unknown',
      confidence: 0,
      method: 'none',
      analysisPerformed: false,
    };
  } catch (error) {
    logger.error(`Error identifying entity for address ${address}:`, error);
    throw new Error(`Address entity identification failed: ${error.message}`);
  }
}

/**
 * Extract unique addresses from a set of transactions
 * @param {Array} transactions - Array of transactions
 * @returns {Array} Unique addresses
 */
function extractUniqueAddresses(transactions) {
  const addressSet = new Set();
  
  transactions.forEach(tx => {
    // Add from address
    if (tx.from) {
      addressSet.add(tx.from);
    }
    
    // Add to address
    if (tx.to) {
      addressSet.add(tx.to);
    }
    
    // For transactions with multiple inputs/outputs
    if (tx.inputs && Array.isArray(tx.inputs)) {
      tx.inputs.forEach(input => {
        if (input.address) {
          addressSet.add(input.address);
        }
      });
    }
    
    if (tx.outputs && Array.isArray(tx.outputs)) {
      tx.outputs.forEach(output => {
        if (output.address) {
          addressSet.add(output.address);
        }
      });
    }
  });
  
  return Array.from(addressSet);
}

module.exports = {
  identifyEntitiesFromTransactions,
  identifyAddressEntity,
};