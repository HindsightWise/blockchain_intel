const logger = require('../../utils/logger');
const { v4: uuidv4 } = require('uuid');

// This service would interact with a graph database like Neo4j in a production environment
// For demo purposes, we use in-memory data

// Mock data for demo purposes
const entities = [
  {
    id: '1',
    name: 'Binance',
    type: 'Exchange',
    description: 'Major cryptocurrency exchange',
    addresses: ['0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE', '0xD551234Ae421e3BCBA99A0Da6d736074f22192FF'],
    totalBalance: '2,500,000 ETH',
    confidenceScore: 0.95,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-03-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Coinbase',
    type: 'Exchange',
    description: 'US-based cryptocurrency exchange',
    addresses: ['0x71660c4005BA85c37ccec55d0C4493E66Fe775d3', '0x503828976D22510aad0201ac7EC88293211D23Da'],
    totalBalance: '1,800,000 ETH',
    confidenceScore: 0.98,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-03-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Uniswap',
    type: 'DeFi Protocol',
    description: 'Decentralized exchange protocol',
    addresses: ['0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'],
    totalBalance: '350,000 ETH',
    confidenceScore: 0.92,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-03-01T00:00:00Z',
  },
];

// Map of addresses to entity IDs for quick lookups
const addressToEntityMap = {};
entities.forEach(entity => {
  entity.addresses.forEach(address => {
    addressToEntityMap[address.toLowerCase()] = entity.id;
  });
});

/**
 * Get all entities with optional filtering
 * @param {Object} filters - Optional filters for entities
 * @returns {Promise<Array>} List of entities
 */
async function getEntities(filters = {}) {
  try {
    // In a real implementation, this would query a database with filters
    return entities;
  } catch (error) {
    logger.error('Error fetching entities:', error);
    throw new Error(`Unable to fetch entities: ${error.message}`);
  }
}

/**
 * Get entity by ID
 * @param {string} id - Entity ID
 * @returns {Promise<Object>} Entity details
 */
async function getEntityById(id) {
  try {
    const entity = entities.find(e => e.id === id);
    if (!entity) {
      throw new Error(`Entity with ID ${id} not found`);
    }
    return entity;
  } catch (error) {
    logger.error(`Error fetching entity ${id}:`, error);
    throw new Error(`Unable to fetch entity: ${error.message}`);
  }
}

/**
 * Find entity for an address
 * @param {string} address - Blockchain address
 * @returns {Promise<Object|null>} Entity details or null if not found
 */
async function findEntityForAddress(address) {
  try {
    const normalizedAddress = address.toLowerCase();
    const entityId = addressToEntityMap[normalizedAddress];
    if (!entityId) {
      return null;
    }
    return getEntityById(entityId);
  } catch (error) {
    logger.error(`Error finding entity for address ${address}:`, error);
    throw new Error(`Unable to find entity for address: ${error.message}`);
  }
}

/**
 * Create a new entity
 * @param {Object} entityData - Entity data
 * @returns {Promise<Object>} Created entity
 */
async function createEntity(entityData) {
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const newEntity = {
      id,
      ...entityData,
      confidenceScore: entityData.confidenceScore || 0.5,
      createdAt: now,
      updatedAt: now,
    };
    
    entities.push(newEntity);
    
    // Update address to entity mapping
    if (newEntity.addresses && Array.isArray(newEntity.addresses)) {
      newEntity.addresses.forEach(address => {
        addressToEntityMap[address.toLowerCase()] = id;
      });
    }
    
    return newEntity;
  } catch (error) {
    logger.error('Error creating entity:', error);
    throw new Error(`Unable to create entity: ${error.message}`);
  }
}

/**
 * Update an existing entity
 * @param {string} id - Entity ID
 * @param {Object} entityData - Updated entity data
 * @returns {Promise<Object>} Updated entity
 */
async function updateEntity(id, entityData) {
  try {
    const entityIndex = entities.findIndex(e => e.id === id);
    if (entityIndex === -1) {
      throw new Error(`Entity with ID ${id} not found`);
    }
    
    const updatedEntity = {
      ...entities[entityIndex],
      ...entityData,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };
    
    entities[entityIndex] = updatedEntity;
    
    // Update address to entity mapping if addresses changed
    if (entityData.addresses && Array.isArray(entityData.addresses)) {
      // Remove old mappings
      Object.keys(addressToEntityMap).forEach(address => {
        if (addressToEntityMap[address] === id) {
          delete addressToEntityMap[address];
        }
      });
      
      // Add new mappings
      updatedEntity.addresses.forEach(address => {
        addressToEntityMap[address.toLowerCase()] = id;
      });
    }
    
    return updatedEntity;
  } catch (error) {
    logger.error(`Error updating entity ${id}:`, error);
    throw new Error(`Unable to update entity: ${error.message}`);
  }
}

module.exports = {
  getEntities,
  getEntityById,
  findEntityForAddress,
  createEntity,
  updateEntity,
};