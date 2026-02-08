import { redisClient } from '../config/redis.mjs';

export class RedisUtils {
  constructor() {}

  /**
   * Verifica se uma chave existe no Redis
   * @param {string} key - Chave a ser verificada
   * @returns {Promise<boolean>} - True se a chave existe, false caso contrário
   */
  async keyExists(key) {
    try {
      const exists = await redisClient.exists(key);
      return exists === 1;
    } catch (error) {
      console.error(`Error checking key existence for ${key}:`, error);
      return false;
    }
  }

  /**
   * Obtém o valor de uma chave do Redis
   * @param {string} key - Chave a ser consultada
   * @returns {Promise<string|null>} - Valor da chave ou null se não existir
   */
  async getValue(key) {
    try {
      const value = await redisClient.get(key);
      return value;
    } catch (error) {
      console.error(`Error getting value for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Define um valor para uma chave no Redis
   * @param {string} key - Chave a ser definida
   * @param {string} value - Valor a ser armazenado
   * @param {number} ttl - Time to live em segundos (opcional, padrão: 3600 = 1 hora)
   * @returns {Promise<boolean>} - True se sucesso, false caso contrário
   */
  async setValue(key, value, ttl = null) {
    try {
      let result;
      if (ttl) {
        result = await redisClient.setEx(key, ttl, value);
      } else {
        result = await redisClient.set(key, value);
      }

      // Verify the operation was successful
      if (result === 'OK') {
        console.log(`Successfully set key: ${key} = ${value} (TTL: ${ttl}s)`);
        return true;
      } else {
        console.error(`Failed to set key: ${key}. Result: ${result}`);
        return false;
      }
    } catch (error) {
      console.error(`Error setting value for key ${key}:`, error);
      return false;
    }
  }
}

