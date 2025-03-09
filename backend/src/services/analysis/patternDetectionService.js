/**
 * Pattern Detection Service
 * 
 * This service identifies transaction patterns and anomalies in blockchain data.
 * It uses statistical and ML-based approaches to detect significant patterns.
 */

const logger = require('../../utils/logger');

/**
 * Detect transaction patterns for an address
 * @param {string} address - Blockchain address to analyze
 * @param {Array} transactions - Transaction history
 * @param {Object} options - Detection options
 * @returns {Promise<Object>} Detected patterns
 */
async function detectAddressPatterns(address, transactions, options = {}) {
  try {
    const patterns = {};
    
    // Only proceed if we have enough transactions to analyze
    if (!transactions || transactions.length < 3) {
      return {
        address,
        patternCount: 0,
        patterns: {},
        message: 'Insufficient transaction history for pattern detection',
      };
    }
    
    // Activity timing patterns
    patterns.activityTiming = detectActivityTimingPatterns(address, transactions);
    
    // Value distribution patterns
    patterns.valueDistribution = detectValueDistributionPatterns(address, transactions);
    
    // Counterparty patterns
    patterns.counterparties = detectCounterpartyPatterns(address, transactions);
    
    // Periodic transaction patterns
    patterns.periodicActivity = detectPeriodicPatterns(address, transactions);
    
    // Gas usage patterns
    patterns.gasUsage = detectGasUsagePatterns(address, transactions);
    
    // Filter out empty patterns
    const significantPatterns = {};
    let patternCount = 0;
    
    for (const category in patterns) {
      if (patterns[category] && Object.keys(patterns[category]).length > 0) {
        significantPatterns[category] = patterns[category];
        patternCount += Object.keys(patterns[category]).length;
      }
    }
    
    return {
      address,
      patternCount,
      patterns: significantPatterns,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    logger.error(`Error detecting patterns for address ${address}:`, error);
    throw new Error(`Pattern detection failed: ${error.message}`);
  }
}

/**
 * Detect anomalies in transaction activity
 * @param {string} address - Blockchain address to analyze
 * @param {Array} transactions - Transaction history
 * @param {Object} options - Detection options
 * @returns {Promise<Object>} Detected anomalies
 */
async function detectAnomalies(address, transactions, options = {}) {
  try {
    const anomalies = [];
    
    // Only proceed if we have enough transactions to establish a baseline
    if (!transactions || transactions.length < 10) {
      return {
        address,
        anomalyCount: 0,
        anomalies: [],
        message: 'Insufficient transaction history for anomaly detection',
      };
    }
    
    // Value anomalies (unusually large transactions)
    const valueAnomalies = detectValueAnomalies(address, transactions);
    if (valueAnomalies.length > 0) {
      anomalies.push(...valueAnomalies);
    }
    
    // Timing anomalies (sudden bursts of activity)
    const timingAnomalies = detectTimingAnomalies(address, transactions);
    if (timingAnomalies.length > 0) {
      anomalies.push(...timingAnomalies);
    }
    
    // Behavior change anomalies
    const behaviorAnomalies = detectBehaviorChangeAnomalies(address, transactions);
    if (behaviorAnomalies.length > 0) {
      anomalies.push(...behaviorAnomalies);
    }
    
    // Counterparty anomalies (sudden interaction with high-risk entities)
    const counterpartyAnomalies = detectCounterpartyAnomalies(address, transactions);
    if (counterpartyAnomalies.length > 0) {
      anomalies.push(...counterpartyAnomalies);
    }
    
    // Sort anomalies by severity (descending)
    anomalies.sort((a, b) => b.severity - a.severity);
    
    return {
      address,
      anomalyCount: anomalies.length,
      anomalies,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    logger.error(`Error detecting anomalies for address ${address}:`, error);
    throw new Error(`Anomaly detection failed: ${error.message}`);
  }
}

// Helper functions for pattern detection

/**
 * Detect patterns in activity timing (time of day, day of week, etc.)
 */
function detectActivityTimingPatterns(address, transactions) {
  // This is a placeholder implementation
  const patterns = {};
  
  // Process transactions to extract timing information
  const hourDistribution = new Array(24).fill(0);
  const dayOfWeekDistribution = new Array(7).fill(0);
  
  transactions.forEach(tx => {
    const date = new Date(tx.timestamp);
    const hour = date.getUTCHours();
    const dayOfWeek = date.getUTCDay();
    
    hourDistribution[hour]++;
    dayOfWeekDistribution[dayOfWeek]++;
  });
  
  // Normalize distributions
  const totalTx = transactions.length;
  const normalizedHourDist = hourDistribution.map(count => count / totalTx);
  const normalizedDayDist = dayOfWeekDistribution.map(count => count / totalTx);
  
  // Identify peak hours (hours with significantly higher activity)
  const hourMean = normalizedHourDist.reduce((sum, val) => sum + val, 0) / 24;
  const hourStdDev = Math.sqrt(
    normalizedHourDist.reduce((sum, val) => sum + Math.pow(val - hourMean, 2), 0) / 24
  );
  
  const peakHours = [];
  normalizedHourDist.forEach((value, hour) => {
    if (value > hourMean + 2 * hourStdDev) {
      peakHours.push(hour);
    }
  });
  
  if (peakHours.length > 0) {
    patterns.peakHours = {
      hours: peakHours,
      description: `Activity concentrated during hours: ${peakHours.join(', ')}`,
      confidence: calculateConfidence(peakHours.length, totalTx),
    };
  }
  
  // Identify active days
  const dayMean = normalizedDayDist.reduce((sum, val) => sum + val, 0) / 7;
  const dayStdDev = Math.sqrt(
    normalizedDayDist.reduce((sum, val) => sum + Math.pow(val - dayMean, 2), 0) / 7
  );
  
  const activeDays = [];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  normalizedDayDist.forEach((value, day) => {
    if (value > dayMean + 1.5 * dayStdDev) {
      activeDays.push(dayNames[day]);
    }
  });
  
  if (activeDays.length > 0) {
    patterns.activeDays = {
      days: activeDays,
      description: `Activity concentrated on days: ${activeDays.join(', ')}`,
      confidence: calculateConfidence(activeDays.length, totalTx),
    };
  }
  
  return patterns;
}

/**
 * Detect patterns in transaction values
 */
function detectValueDistributionPatterns(address, transactions) {
  // This is a placeholder implementation
  const patterns = {};
  
  // Extract transaction values
  const values = transactions.map(tx => {
    // Convert string values (e.g., "10.5 ETH") to numbers
    if (typeof tx.value === 'string') {
      const match = tx.value.match(/([\d.]+)/);
      return match ? parseFloat(match[1]) : 0;
    }
    return tx.value || 0;
  });
  
  // Calculate statistics
  const sortedValues = [...values].sort((a, b) => a - b);
  const min = sortedValues[0];
  const max = sortedValues[sortedValues.length - 1];
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  
  // Check for round-number patterns (many transactions with exact values like 1.0, 5.0, etc.)
  const roundValueCounts = {};
  values.forEach(value => {
    if (value === Math.round(value)) {
      roundValueCounts[value] = (roundValueCounts[value] || 0) + 1;
    }
  });
  
  const significantRoundValues = Object.entries(roundValueCounts)
    .filter(([value, count]) => count >= 3) // At least 3 occurrences
    .map(([value, count]) => ({
      value: parseFloat(value),
      count,
      percentage: (count / values.length) * 100,
    }))
    .sort((a, b) => b.count - a.count);
  
  if (significantRoundValues.length > 0) {
    patterns.roundValues = {
      values: significantRoundValues,
      description: `Frequent round-value transactions detected`,
      confidence: calculateConfidence(significantRoundValues.length, values.length),
    };
  }
  
  // Check for recurring exact values (non-round)
  const exactValueCounts = {};
  values.forEach(value => {
    if (value !== Math.round(value)) {
      const key = value.toFixed(8); // Use fixed precision to avoid floating-point issues
      exactValueCounts[key] = (exactValueCounts[key] || 0) + 1;
    }
  });
  
  const significantExactValues = Object.entries(exactValueCounts)
    .filter(([value, count]) => count >= 3) // At least 3 occurrences
    .map(([value, count]) => ({
      value: parseFloat(value),
      count,
      percentage: (count / values.length) * 100,
    }))
    .sort((a, b) => b.count - a.count);
  
  if (significantExactValues.length > 0) {
    patterns.recurringValues = {
      values: significantExactValues,
      description: `Recurring exact-value transactions detected`,
      confidence: calculateConfidence(significantExactValues.length, values.length),
    };
  }
  
  // Value range categorization
  if (max > min * 100) { // Wide range of values
    patterns.wideValueRange = {
      min,
      max,
      ratio: max / min,
      description: `Wide range of transaction values (${min.toFixed(2)} to ${max.toFixed(2)})`,
      confidence: 0.7,
    };
  }
  
  return patterns;
}

/**
 * Detect patterns in counterparty interactions
 */
function detectCounterpartyPatterns(address, transactions) {
  // This is a placeholder implementation
  const patterns = {};
  
  // Count interactions with each counterparty
  const counterpartyCounts = {};
  
  transactions.forEach(tx => {
    const counterparty = tx.from === address ? tx.to : tx.from;
    counterpartyCounts[counterparty] = (counterpartyCounts[counterparty] || 0) + 1;
  });
  
  // Find frequent counterparties
  const frequentCounterparties = Object.entries(counterpartyCounts)
    .filter(([addr, count]) => count >= 3) // At least 3 interactions
    .map(([addr, count]) => ({
      address: addr,
      count,
      percentage: (count / transactions.length) * 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 most frequent
  
  if (frequentCounterparties.length > 0) {
    patterns.frequentCounterparties = {
      counterparties: frequentCounterparties,
      description: `Regular interactions with ${frequentCounterparties.length} addresses`,
      confidence: calculateConfidence(frequentCounterparties.length, transactions.length),
    };
  }
  
  // Check for one-time interactions (single transaction with many different counterparties)
  const oneTimeCount = Object.values(counterpartyCounts).filter(count => count === 1).length;
  const oneTimePercentage = (oneTimeCount / Object.keys(counterpartyCounts).length) * 100;
  
  if (oneTimePercentage > 80 && Object.keys(counterpartyCounts).length > 10) {
    patterns.manyOneTimeInteractions = {
      count: oneTimeCount,
      percentage: oneTimePercentage,
      description: `High percentage (${oneTimePercentage.toFixed(1)}%) of one-time interactions`,
      confidence: 0.7,
    };
  }
  
  return patterns;
}

/**
 * Detect periodic transaction patterns
 */
function detectPeriodicPatterns(address, transactions) {
  // This is a placeholder implementation
  const patterns = {};
  
  // Sort transactions by timestamp
  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(a.timestamp) - new Date(b.timestamp);
  });
  
  // Calculate time intervals between consecutive transactions
  const intervals = [];
  for (let i = 1; i < sortedTransactions.length; i++) {
    const prev = new Date(sortedTransactions[i-1].timestamp).getTime();
    const curr = new Date(sortedTransactions[i].timestamp).getTime();
    intervals.push((curr - prev) / (1000 * 60 * 60)); // Interval in hours
  }
  
  if (intervals.length < 5) {
    return patterns; // Not enough data for reliable periodicity detection
  }
  
  // Look for daily patterns (24 ± 1 hours)
  const dailyIntervals = intervals.filter(interval => interval >= 23 && interval <= 25);
  if (dailyIntervals.length >= 3 && dailyIntervals.length / intervals.length >= 0.3) {
    patterns.dailyActivity = {
      count: dailyIntervals.length,
      description: 'Regular daily transaction pattern detected',
      confidence: calculateConfidence(dailyIntervals.length, intervals.length),
    };
  }
  
  // Look for weekly patterns (168 ± 5 hours)
  const weeklyIntervals = intervals.filter(interval => interval >= 163 && interval <= 173);
  if (weeklyIntervals.length >= 3 && weeklyIntervals.length / intervals.length >= 0.2) {
    patterns.weeklyActivity = {
      count: weeklyIntervals.length,
      description: 'Regular weekly transaction pattern detected',
      confidence: calculateConfidence(weeklyIntervals.length, intervals.length),
    };
  }
  
  // Look for monthly patterns (720 ± 24 hours)
  const monthlyIntervals = intervals.filter(interval => interval >= 696 && interval <= 744);
  if (monthlyIntervals.length >= 2 && monthlyIntervals.length / intervals.length >= 0.15) {
    patterns.monthlyActivity = {
      count: monthlyIntervals.length,
      description: 'Regular monthly transaction pattern detected',
      confidence: calculateConfidence(monthlyIntervals.length, intervals.length),
    };
  }
  
  return patterns;
}

/**
 * Detect patterns in gas usage
 */
function detectGasUsagePatterns(address, transactions) {
  // This is a placeholder implementation
  const patterns = {};
  
  // Only analyze transactions with gas information
  const txsWithGas = transactions.filter(tx => {
    return tx.gasPrice && tx.gasUsed;
  });
  
  if (txsWithGas.length < 5) {
    return patterns; // Not enough data for reliable gas pattern detection
  }
  
  // Extract gas prices (convert string values if needed)
  const gasPrices = txsWithGas.map(tx => {
    if (typeof tx.gasPrice === 'string') {
      const match = tx.gasPrice.match(/([\d.]+)/);
      return match ? parseFloat(match[1]) : 0;
    }
    return tx.gasPrice || 0;
  });
  
  // Calculate statistics
  const mean = gasPrices.reduce((sum, val) => sum + val, 0) / gasPrices.length;
  const stdDev = Math.sqrt(
    gasPrices.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / gasPrices.length
  );
  
  // Check for consistent gas price usage
  const gasVariability = stdDev / mean; // Coefficient of variation
  
  if (gasVariability < 0.1 && txsWithGas.length >= 10) {
    patterns.consistentGasPrice = {
      mean,
      stdDev,
      variability: gasVariability,
      description: 'Consistently uses similar gas price across transactions',
      confidence: 0.8,
    };
  }
  
  // Check for high gas price preference
  const marketAvgGasPrice = 20; // This would be obtained from external source in real implementation
  const avgRatio = mean / marketAvgGasPrice;
  
  if (avgRatio > 1.5) {
    patterns.highGasPricePreference = {
      avgPrice: mean,
      marketRatio: avgRatio,
      description: 'Consistently uses above-market gas prices',
      confidence: calculateConfidence(txsWithGas.length, transactions.length),
    };
  } else if (avgRatio < 0.75) {
    patterns.lowGasPricePreference = {
      avgPrice: mean,
      marketRatio: avgRatio,
      description: 'Consistently uses below-market gas prices',
      confidence: calculateConfidence(txsWithGas.length, transactions.length),
    };
  }
  
  return patterns;
}

// Anomaly detection helper functions

/**
 * Detect value anomalies (unusually large or small transactions)
 */
function detectValueAnomalies(address, transactions) {
  const anomalies = [];
  
  // Extract transaction values
  const values = transactions.map(tx => {
    // Convert string values (e.g., "10.5 ETH") to numbers
    if (typeof tx.value === 'string') {
      const match = tx.value.match(/([\d.]+)/);
      return {
        value: match ? parseFloat(match[1]) : 0,
        tx
      };
    }
    return {
      value: tx.value || 0,
      tx
    };
  });
  
  // Calculate statistics
  const numericValues = values.map(v => v.value);
  const mean = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
  const stdDev = Math.sqrt(
    numericValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numericValues.length
  );
  
  // Identify outliers (values more than 3 standard deviations from the mean)
  values.forEach(item => {
    const { value, tx } = item;
    const zScore = (value - mean) / stdDev;
    
    if (zScore > 3 && value > mean) {
      anomalies.push({
        type: 'large_value',
        value,
        zScore,
        timestamp: tx.timestamp,
        hash: tx.hash,
        description: `Unusually large transaction value (${value.toFixed(2)})`,
        severity: Math.min(0.9, 0.5 + (zScore - 3) / 10), // Scale severity based on how extreme the outlier is
      });
    }
  });
  
  return anomalies;
}

/**
 * Detect timing anomalies (sudden bursts of activity)
 */
function detectTimingAnomalies(address, transactions) {
  const anomalies = [];
  
  // Sort transactions by timestamp
  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(a.timestamp) - new Date(b.timestamp);
  });
  
  // Calculate time intervals between consecutive transactions
  const intervals = [];
  for (let i = 1; i < sortedTransactions.length; i++) {
    const prev = new Date(sortedTransactions[i-1].timestamp).getTime();
    const curr = new Date(sortedTransactions[i].timestamp).getTime();
    intervals.push({
      interval: (curr - prev) / (1000 * 60 * 60), // Interval in hours
      tx: sortedTransactions[i]
    });
  }
  
  if (intervals.length < 5) {
    return anomalies; // Not enough data for reliable anomaly detection
  }
  
  // Calculate statistics for intervals
  const numericIntervals = intervals.map(i => i.interval);
  const mean = numericIntervals.reduce((sum, val) => sum + val, 0) / numericIntervals.length;
  const stdDev = Math.sqrt(
    numericIntervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numericIntervals.length
  );
  
  // Look for unusually short intervals (bursts of activity)
  intervals.forEach(item => {
    const { interval, tx } = item;
    if (interval < mean / 5 && interval < 1) { // Less than 1/5 of average interval and less than 1 hour
      anomalies.push({
        type: 'activity_burst',
        interval,
        timestamp: tx.timestamp,
        hash: tx.hash,
        description: `Unusually rapid transaction (${interval.toFixed(2)} hours after previous)`,
        severity: Math.min(0.8, 0.4 + (mean / interval) / 20), // Scale severity based on how extreme the burst is
      });
    }
  });
  
  // Look for clusters of transactions (many transactions in short period)
  // This would use a more sophisticated clustering algorithm in a real implementation
  
  return anomalies;
}

/**
 * Detect behavior change anomalies
 */
function detectBehaviorChangeAnomalies(address, transactions) {
  const anomalies = [];
  
  // Need a significant number of transactions to detect behavior changes
  if (transactions.length < 20) {
    return anomalies;
  }
  
  // Sort transactions by timestamp
  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(a.timestamp) - new Date(b.timestamp);
  });
  
  // Split into two periods (first half and second half)
  const midpoint = Math.floor(sortedTransactions.length / 2);
  const firstPeriod = sortedTransactions.slice(0, midpoint);
  const secondPeriod = sortedTransactions.slice(midpoint);
  
  // Compare value distributions
  const firstPeriodValues = firstPeriod.map(tx => {
    if (typeof tx.value === 'string') {
      const match = tx.value.match(/([\d.]+)/);
      return match ? parseFloat(match[1]) : 0;
    }
    return tx.value || 0;
  });
  
  const secondPeriodValues = secondPeriod.map(tx => {
    if (typeof tx.value === 'string') {
      const match = tx.value.match(/([\d.]+)/);
      return match ? parseFloat(match[1]) : 0;
    }
    return tx.value || 0;
  });
  
  const firstMean = firstPeriodValues.reduce((sum, val) => sum + val, 0) / firstPeriodValues.length;
  const secondMean = secondPeriodValues.reduce((sum, val) => sum + val, 0) / secondPeriodValues.length;
  
  // Detect significant changes in average transaction value
  const valueRatio = secondMean / firstMean;
  if (valueRatio > 5 || valueRatio < 0.2) {
    anomalies.push({
      type: 'value_behavior_change',
      firstPeriodMean: firstMean,
      secondPeriodMean: secondMean,
      ratio: valueRatio,
      changeDate: sortedTransactions[midpoint].timestamp,
      description: `Significant change in transaction value patterns (${valueRatio > 1 ? 'increase' : 'decrease'})`,
      severity: 0.6,
    });
  }
  
  // Compare counterparty distributions (could be more sophisticated in real implementation)
  const firstPeriodCounterparties = new Set();
  const secondPeriodCounterparties = new Set();
  
  firstPeriod.forEach(tx => {
    const counterparty = tx.from === address ? tx.to : tx.from;
    firstPeriodCounterparties.add(counterparty);
  });
  
  secondPeriod.forEach(tx => {
    const counterparty = tx.from === address ? tx.to : tx.from;
    secondPeriodCounterparties.add(counterparty);
  });
  
  // Convert sets to arrays for intersection and union operations
  const firstCounterpartiesArray = Array.from(firstPeriodCounterparties);
  const secondCounterpartiesArray = Array.from(secondPeriodCounterparties);
  
  // Calculate Jaccard similarity between counterparty sets
  const intersection = firstCounterpartiesArray.filter(cp => secondPeriodCounterparties.has(cp)).length;
  const union = firstPeriodCounterparties.size + secondPeriodCounterparties.size - intersection;
  const similarity = intersection / union;
  
  // Low similarity indicates a significant change in counterparties
  if (similarity < 0.1 && firstCounterpartiesArray.length >= 5 && secondCounterpartiesArray.length >= 5) {
    anomalies.push({
      type: 'counterparty_behavior_change',
      firstPeriodCounterparties: firstCounterpartiesArray.length,
      secondPeriodCounterparties: secondCounterpartiesArray.length,
      similarity,
      changeDate: sortedTransactions[midpoint].timestamp,
      description: 'Significant change in transaction counterparties',
      severity: 0.7,
    });
  }
  
  return anomalies;
}

/**
 * Detect counterparty anomalies
 */
function detectCounterpartyAnomalies(address, transactions) {
  // This is a placeholder implementation
  const anomalies = [];
  
  // For a real implementation, this would check for:
  // 1. Sudden interactions with high-risk entities (mixers, darknet markets, etc.)
  // 2. Interactions with sanctioned addresses
  // 3. Unusual transaction patterns with specific counterparties
  
  return anomalies;
}

/**
 * Calculate confidence score based on sample size and strength of pattern
 * @param {number} patternStrength - Strength of the detected pattern
 * @param {number} sampleSize - Total number of data points
 * @returns {number} Confidence score (0-1)
 */
function calculateConfidence(patternStrength, sampleSize) {
  // Simple confidence calculation based on pattern strength and sample size
  // In a real implementation, this would be more sophisticated
  const sizeFactor = Math.min(1, sampleSize / 20); // Max out at 20 data points
  const strengthFactor = Math.min(1, patternStrength / 10); // Arbitrary scaling
  
  return Math.min(0.95, sizeFactor * 0.6 + strengthFactor * 0.4);
}

module.exports = {
  detectAddressPatterns,
  detectAnomalies,
};