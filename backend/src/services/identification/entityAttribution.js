/**
 * Entity Attribution Service
 * 
 * This service maps clustered addresses to known entities with confidence scoring.
 * It uses multiple signals to attribute addresses to entities including:
 * - Known address lists
 * - Network analysis
 * - Behavioral patterns
 * - External metadata
 */

const logger = require('../../utils/logger');
const entityService = require('../entity');
const clusteringService = require('./clusteringService');

/**
 * Attribute clusters to known entities
 * @param {Object} clusters - Address clusters from clustering algorithms
 * @returns {Promise<Object>} Attribution results with confidence scores
 */
async function attributeClusters(clusters) {
  try {
    const attributionResults = {};
    
    // Get all known entities
    const entities = await entityService.getEntities();
    
    // Process each cluster
    for (const clusterId in clusters) {
      const clusterAddresses = clusters[clusterId];
      
      // Check if any address in the cluster belongs to a known entity
      const attributions = [];
      
      for (const address of clusterAddresses) {
        // Find entity for this address
        const entity = await entityService.findEntityForAddress(address);
        
        if (entity) {
          attributions.push({
            entityId: entity.id,
            entityName: entity.name,
            entityType: entity.type,
            matchedAddress: address,
            confidenceBase: entity.confidenceScore,
          });
        }
      }
      
      if (attributions.length > 0) {
        // Calculate consensus attribution and confidence score
        const attribution = calculateConsensusAttribution(attributions, clusterAddresses.length);
        
        attributionResults[clusterId] = {
          entityId: attribution.entityId,
          entityName: attribution.entityName,
          entityType: attribution.entityType,
          confidence: attribution.confidence,
          addresses: clusterAddresses,
          matchedAddresses: attribution.matchedAddresses,
        };
      } else {
        // No known entity found for this cluster
        attributionResults[clusterId] = {
          entityId: null,
          entityName: 'Unknown',
          entityType: 'Unknown',
          confidence: 0,
          addresses: clusterAddresses,
          matchedAddresses: [],
        };
      }
    }
    
    return attributionResults;
  } catch (error) {
    logger.error('Error in cluster attribution:', error);
    throw new Error(`Cluster attribution failed: ${error.message}`);
  }
}

/**
 * Attribute an address to a known entity with confidence scoring
 * @param {string} address - Blockchain address to attribute
 * @param {Array} transactions - Transactions involving the address
 * @returns {Promise<Object>} Attribution result with confidence score
 */
async function attributeAddress(address, transactions = []) {
  try {
    // Step 1: Check if address is already known
    const knownEntity = await entityService.findEntityForAddress(address);
    if (knownEntity) {
      return {
        entityId: knownEntity.id,
        entityName: knownEntity.name,
        entityType: knownEntity.type,
        confidence: knownEntity.confidenceScore,
        attributionMethod: 'direct_match',
      };
    }
    
    // Step 2: Get transactions for this address if not provided
    let addressTransactions = transactions;
    if (!addressTransactions || addressTransactions.length === 0) {
      // In a real implementation, you would fetch transactions from a data store
      // addressTransactions = await transactionService.getAddressTransactions(address);
      addressTransactions = [];
    }
    
    // Step 3: Use clustering to find related addresses
    let relatedAddresses = [];
    if (addressTransactions.length > 0) {
      const addresses = new Set();
      addressTransactions.forEach(tx => {
        const inputAddrs = getInputAddresses(tx);
        const outputAddrs = getOutputAddresses(tx);
        inputAddrs.concat(outputAddrs).forEach(addr => addresses.add(addr));
      });
      
      const clusters = await clusteringService.combinedClustering(
        addressTransactions,
        Array.from(addresses)
      );
      
      // Find which cluster contains our address
      for (const clusterId in clusters) {
        if (clusters[clusterId].includes(address)) {
          relatedAddresses = clusters[clusterId].filter(addr => addr !== address);
          break;
        }
      }
    }
    
    // Step 4: Check if any related address belongs to a known entity
    const attributions = [];
    
    for (const relatedAddress of relatedAddresses) {
      const entity = await entityService.findEntityForAddress(relatedAddress);
      
      if (entity) {
        attributions.push({
          entityId: entity.id,
          entityName: entity.name,
          entityType: entity.type,
          matchedAddress: relatedAddress,
          confidenceBase: entity.confidenceScore,
        });
      }
    }
    
    // Step 5: Calculate attribution based on related addresses
    if (attributions.length > 0) {
      const attribution = calculateConsensusAttribution(attributions, relatedAddresses.length);
      
      return {
        entityId: attribution.entityId,
        entityName: attribution.entityName,
        entityType: attribution.entityType,
        confidence: attribution.confidence,
        attributionMethod: 'cluster_analysis',
        relatedAddresses: relatedAddresses,
        matchedAddresses: attribution.matchedAddresses,
      };
    }
    
    // Step 6: Use behavioral analysis for attribution
    const behavioralAttribution = await attributeByBehavior(address, addressTransactions);
    if (behavioralAttribution && behavioralAttribution.confidence > 0.5) {
      return {
        ...behavioralAttribution,
        attributionMethod: 'behavioral_analysis',
      };
    }
    
    // Step 7: No strong attribution found
    return {
      entityId: null,
      entityName: 'Unknown',
      entityType: 'Unknown',
      confidence: 0,
      attributionMethod: 'none',
    };
  } catch (error) {
    logger.error(`Error in address attribution for ${address}:`, error);
    throw new Error(`Address attribution failed: ${error.message}`);
  }
}

/**
 * Add newly identified addresses to entities
 * @param {Object} attributionResults - Results from attribution process
 * @param {number} confidenceThreshold - Minimum confidence to update entities
 * @returns {Promise<Object>} Update results
 */
async function updateEntitiesWithAttributions(attributionResults, confidenceThreshold = 0.8) {
  try {
    const updateResults = {
      updated: [],
      created: [],
      skipped: [],
    };
    
    for (const clusterId in attributionResults) {
      const attribution = attributionResults[clusterId];
      
      // Skip low confidence attributions
      if (attribution.confidence < confidenceThreshold) {
        updateResults.skipped.push({
          clusterId,
          reason: 'low_confidence',
          confidence: attribution.confidence,
        });
        continue;
      }
      
      if (attribution.entityId) {
        // Update existing entity
        try {
          const entity = await entityService.getEntityById(attribution.entityId);
          
          // Find addresses that are not already in the entity
          const newAddresses = attribution.addresses.filter(
            addr => !entity.addresses.includes(addr)
          );
          
          if (newAddresses.length === 0) {
            updateResults.skipped.push({
              clusterId,
              entityId: attribution.entityId,
              reason: 'no_new_addresses',
            });
            continue;
          }
          
          // Update entity with new addresses
          const updatedEntity = await entityService.updateEntity(
            attribution.entityId,
            {
              addresses: [...entity.addresses, ...newAddresses],
            }
          );
          
          updateResults.updated.push({
            clusterId,
            entityId: attribution.entityId,
            entityName: updatedEntity.name,
            addressesAdded: newAddresses,
          });
        } catch (error) {
          logger.error(`Error updating entity ${attribution.entityId}:`, error);
          updateResults.skipped.push({
            clusterId,
            entityId: attribution.entityId,
            reason: 'update_error',
            error: error.message,
          });
        }
      } else if (attribution.addresses.length >= 3) {
        // Create a new entity for large clusters without attribution
        try {
          const newEntity = await entityService.createEntity({
            name: `Cluster ${clusterId}`,
            type: 'Unknown',
            description: 'Automatically identified address cluster',
            addresses: attribution.addresses,
            confidenceScore: 0.6, // Default confidence for new clusters
          });
          
          updateResults.created.push({
            clusterId,
            entityId: newEntity.id,
            entityName: newEntity.name,
            addressCount: attribution.addresses.length,
          });
        } catch (error) {
          logger.error(`Error creating entity for cluster ${clusterId}:`, error);
          updateResults.skipped.push({
            clusterId,
            reason: 'creation_error',
            error: error.message,
          });
        }
      } else {
        // Skip small clusters without attribution
        updateResults.skipped.push({
          clusterId,
          reason: 'small_unattributed_cluster',
          addressCount: attribution.addresses.length,
        });
      }
    }
    
    return updateResults;
  } catch (error) {
    logger.error('Error updating entities with attributions:', error);
    throw new Error(`Entity update failed: ${error.message}`);
  }
}

/**
 * Attribute an address based on its behavioral patterns
 * @param {string} address - Blockchain address to attribute
 * @param {Array} transactions - Transactions involving the address
 * @returns {Promise<Object>} Attribution result with confidence score
 */
async function attributeByBehavior(address, transactions) {
  try {
    // This is a placeholder for a more sophisticated behavioral analysis
    // In a production system, this would use various signals:
    // 1. Transaction patterns (frequency, values, gas prices)
    // 2. Common interacted addresses
    // 3. Contract usage patterns
    // 4. Temporal patterns
    
    // Get all known entities
    const entities = await entityService.getEntities();
    
    // Calculate behavioral features for the address
    const addressFeatures = calculateBehavioralFeatures(address, transactions);
    
    // Compare with known entities' behavioral patterns
    let bestMatchEntity = null;
    let bestMatchScore = 0;
    
    for (const entity of entities) {
      // In a real implementation, we would have behavioral profiles for entities
      // For this demo, we'll use a placeholder approach
      const entityAddresses = entity.addresses;
      
      // Skip entities with no addresses
      if (!entityAddresses || entityAddresses.length === 0) {
        continue;
      }
      
      // Check if the address interacts frequently with this entity's addresses
      const interactionScore = calculateInteractionScore(address, entityAddresses, transactions);
      
      // Check for similar transaction patterns
      const patternScore = 0.3; // Placeholder
      
      // Combined score
      const score = (interactionScore * 0.7) + (patternScore * 0.3);
      
      if (score > bestMatchScore && score > 0.5) {
        bestMatchScore = score;
        bestMatchEntity = entity;
      }
    }
    
    if (bestMatchEntity) {
      return {
        entityId: bestMatchEntity.id,
        entityName: bestMatchEntity.name,
        entityType: bestMatchEntity.type,
        confidence: bestMatchScore,
      };
    }
    
    return null;
  } catch (error) {
    logger.error(`Error in behavioral attribution for ${address}:`, error);
    throw new Error(`Behavioral attribution failed: ${error.message}`);
  }
}

/**
 * Calculate a consensus attribution from multiple potential attributions
 * @param {Array} attributions - List of potential attributions
 * @param {number} totalAddresses - Total number of addresses in the cluster
 * @returns {Object} Consensus attribution with confidence score
 */
function calculateConsensusAttribution(attributions, totalAddresses) {
  // Group attributions by entity
  const entityGroups = {};
  const matchedAddresses = [];
  
  attributions.forEach(attribution => {
    const { entityId, matchedAddress } = attribution;
    
    if (!entityGroups[entityId]) {
      entityGroups[entityId] = {
        entityId,
        entityName: attribution.entityName,
        entityType: attribution.entityType,
        attributions: [],
        baseConfidence: attribution.confidenceBase,
      };
    }
    
    entityGroups[entityId].attributions.push(attribution);
    matchedAddresses.push(matchedAddress);
  });
  
  // Find the entity with the most attributions
  let bestEntityId = null;
  let bestCount = 0;
  
  for (const entityId in entityGroups) {
    const count = entityGroups[entityId].attributions.length;
    if (count > bestCount) {
      bestCount = count;
      bestEntityId = entityId;
    }
  }
  
  // Calculate confidence based on several factors
  const bestEntity = entityGroups[bestEntityId];
  
  // 1. Proportion of addresses attributed to this entity
  const coverageScore = bestCount / totalAddresses;
  
  // 2. Base confidence of the entity
  const baseConfidence = bestEntity.baseConfidence;
  
  // 3. Consensus strength (how dominant this entity is versus others)
  const consensusStrength = bestCount / attributions.length;
  
  // Combined confidence score (weighted average)
  const confidence = (
    (coverageScore * 0.3) +
    (baseConfidence * 0.4) +
    (consensusStrength * 0.3)
  );
  
  return {
    entityId: bestEntityId,
    entityName: bestEntity.entityName,
    entityType: bestEntity.entityType,
    confidence: Math.min(0.99, confidence), // Cap at 0.99
    matchedAddresses: Array.from(new Set(matchedAddresses)),
  };
}

// Helper functions

/**
 * Get input addresses from a transaction
 * Implementation depends on the blockchain type
 */
function getInputAddresses(transaction) {
  // This is a placeholder implementation
  // In a real scenario, you would extract addresses based on the blockchain format
  return transaction.inputs ? transaction.inputs.map(input => input.address) : [transaction.from];
}

/**
 * Get output addresses from a transaction
 * Implementation depends on the blockchain type
 */
function getOutputAddresses(transaction) {
  // This is a placeholder implementation
  return transaction.outputs ? transaction.outputs.map(output => output.address) : [transaction.to];
}

/**
 * Calculate behavioral features for an address
 */
function calculateBehavioralFeatures(address, transactions) {
  // This is a placeholder implementation
  // In a real scenario, you would calculate various features:
  // - Transaction frequency
  // - Average transaction value
  // - Time of day patterns
  // - Gas price preferences
  // - Contract interactions
  
  return {
    transactionCount: transactions.length,
    averageValue: 0,
    timePattern: [],
    gasPriceAvg: 0,
    contractInteractions: [],
  };
}

/**
 * Calculate interaction score between an address and entity addresses
 */
function calculateInteractionScore(address, entityAddresses, transactions) {
  // Count interactions between the address and entity addresses
  let interactionCount = 0;
  
  transactions.forEach(tx => {
    const from = tx.from;
    const to = tx.to;
    
    if (from === address && entityAddresses.includes(to)) {
      interactionCount++;
    } else if (to === address && entityAddresses.includes(from)) {
      interactionCount++;
    }
  });
  
  // Calculate score based on proportion of transactions that interact with the entity
  const interactionRatio = transactions.length > 0 ? interactionCount / transactions.length : 0;
  
  // Apply a non-linear scaling to emphasize stronger connections
  return Math.min(0.95, interactionRatio * 1.5);
}

module.exports = {
  attributeClusters,
  attributeAddress,
  updateEntitiesWithAttributions,
  attributeByBehavior,
};