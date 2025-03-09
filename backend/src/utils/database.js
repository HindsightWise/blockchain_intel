const mongoose = require('mongoose');
const neo4j = require('neo4j-driver');
const { Client } = require('@elastic/elasticsearch');
const logger = require('./logger');

// Configuration (should be moved to environment variables in production)
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/blockchain-intel';
const neo4jUri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const neo4jUser = process.env.NEO4J_USER || 'neo4j';
const neo4jPassword = process.env.NEO4J_PASSWORD || 'password';
const elasticUri = process.env.ELASTIC_URI || 'http://localhost:9200';

// Database connections
let mongoConnection;
let neo4jDriver;
let elasticClient;

/**
 * Initialize database connections
 */
async function initDatabases() {
  try {
    // Connect to MongoDB
    mongoConnection = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('MongoDB connected successfully');

    // Connect to Neo4j
    neo4jDriver = neo4j.driver(
      neo4jUri,
      neo4j.auth.basic(neo4jUser, neo4jPassword)
    );
    await neo4jDriver.verifyConnectivity();
    logger.info('Neo4j connected successfully');

    // Connect to Elasticsearch
    elasticClient = new Client({ node: elasticUri });
    const elasticInfo = await elasticClient.info();
    logger.info(`Elasticsearch connected successfully: ${elasticInfo.body.version.number}`);

    return { mongoConnection, neo4jDriver, elasticClient };
  } catch (error) {
    logger.error('Error connecting to databases:', error);
    throw error;
  }
}

/**
 * Close database connections
 */
async function closeDatabases() {
  try {
    if (mongoConnection) {
      await mongoose.disconnect();
      logger.info('MongoDB disconnected');
    }

    if (neo4jDriver) {
      await neo4jDriver.close();
      logger.info('Neo4j disconnected');
    }

    if (elasticClient) {
      await elasticClient.close();
      logger.info('Elasticsearch disconnected');
    }
  } catch (error) {
    logger.error('Error closing database connections:', error);
    throw error;
  }
}

/**
 * Get MongoDB connection
 */
function getMongo() {
  return mongoConnection;
}

/**
 * Get Neo4j session
 */
function getNeo4jSession() {
  return neo4jDriver.session();
}

/**
 * Get Elasticsearch client
 */
function getElastic() {
  return elasticClient;
}

module.exports = {
  initDatabases,
  closeDatabases,
  getMongo,
  getNeo4jSession,
  getElastic,
};