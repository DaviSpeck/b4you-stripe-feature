import { redisClient } from '../config/redis.mjs';

export class RedisDebug {
  /**
   * Test Redis connection and basic operations
   */
  static async testConnection() {
    try {
      console.log('Testing Redis connection...');
      
      // Test basic ping
      const pingResult = await redisClient.ping();
      console.log('Ping result:', pingResult);
      
      // Test set/get operation
      const testKey = 'test_connection_' + Date.now();
      const testValue = 'test_value_' + Math.random();
      
      console.log(`Setting test key: ${testKey} = ${testValue}`);
      const setResult = await redisClient.setEx(testKey, 60, testValue);
      console.log('Set result:', setResult);
      
      // Verify the value was set
      const getValue = await redisClient.get(testKey);
      console.log('Retrieved value:', getValue);
      
      // Check if values match
      if (getValue === testValue) {
        console.log('✅ Redis is working correctly - data is being saved and retrieved');
        return true;
      } else {
        console.log('❌ Redis data mismatch - values do not match');
        return false;
      }
    } catch (error) {
      console.error('❌ Redis connection test failed:', error);
      return false;
    }
  }

  /**
   * Check Redis server info and configuration
   */
  static async getServerInfo() {
    try {
      console.log('Getting Redis server information...');
      
      const info = await redisClient.info();
      const lines = info.split('\r\n');
      
      // Extract key information
      const relevantInfo = {};
      const keysToCheck = [
        'redis_version',
        'used_memory_human',
        'maxmemory_human',
        'maxmemory_policy',
        'save',
        'rdb_last_save_time',
        'aof_enabled',
        'connected_clients'
      ];
      
      lines.forEach(line => {
        if (line.includes(':')) {
          const [key, value] = line.split(':');
          if (keysToCheck.includes(key)) {
            relevantInfo[key] = value;
          }
        }
      });
      
      console.log('Redis Server Info:', relevantInfo);
      return relevantInfo;
    } catch (error) {
      console.error('Error getting Redis server info:', error);
      return null;
    }
  }

  /**
   * Test key expiration behavior
   */
  static async testKeyExpiration() {
    try {
      console.log('Testing key expiration...');
      
      const testKey = 'test_expiration_' + Date.now();
      const testValue = 'expiration_test';
      
      // Set key with 5 second TTL
      await redisClient.setEx(testKey, 5, testValue);
      console.log(`Set key ${testKey} with 5 second TTL`);
      
      // Check immediately
      let value = await redisClient.get(testKey);
      console.log('Immediate check:', value);
      
      // Check TTL
      const ttl = await redisClient.ttl(testKey);
      console.log('TTL remaining:', ttl, 'seconds');
      
      // Wait 6 seconds and check again
      console.log('Waiting 6 seconds...');
      await new Promise(resolve => setTimeout(resolve, 6000));
      
      value = await redisClient.get(testKey);
      console.log('After 6 seconds:', value);
      
      if (value === null) {
        console.log('✅ Key expiration is working correctly');
        return true;
      } else {
        console.log('❌ Key did not expire as expected');
        return false;
      }
    } catch (error) {
      console.error('Error testing key expiration:', error);
      return false;
    }
  }

  /**
   * Run comprehensive Redis diagnostics
   */
  static async runDiagnostics() {
    console.log('🔍 Starting Redis Diagnostics...\n');
    
    const results = {
      connection: false,
      serverInfo: null,
      expiration: false
    };
    
    // Test connection
    results.connection = await this.testConnection();
    console.log('\n');
    
    // Get server info
    results.serverInfo = await this.getServerInfo();
    console.log('\n');
    
    // Test expiration
    results.expiration = await this.testKeyExpiration();
    console.log('\n');
    
    // Summary
    console.log('📊 Redis Diagnostics Summary:');
    console.log('Connection Test:', results.connection ? '✅ PASS' : '❌ FAIL');
    console.log('Server Info:', results.serverInfo ? '✅ RETRIEVED' : '❌ FAILED');
    console.log('Expiration Test:', results.expiration ? '✅ PASS' : '❌ FAIL');
    
    return results;
  }
}

