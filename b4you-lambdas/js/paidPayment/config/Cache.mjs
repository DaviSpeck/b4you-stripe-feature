import { redisClient, start, stop } from './redis.mjs';

export default class Cache {
  static async connect() {
    try {
      if (!redisClient.isOpen) {
        await start();
      }
      return true;
    } catch (error) {
      console.log('Erro ao conectar Redis:', error);
      return false;
    }
  }

  static async disconnect() {
    try {
      if (redisClient.isOpen) {
        await stop();
      }
      return true;
    } catch (error) {
      console.log('Erro ao desconectar Redis:', error);
      return false;
    }
  }

  static async set(key, value, timeInMinutes = 5) {
    if (!redisClient.isOpen) {
      await this.connect();
    }
    return redisClient.setEx(key, timeInMinutes * 60, value);
  }

  static async get(key) {
    if (!redisClient.isOpen) {
      await this.connect();
    }
    return redisClient.get(key);
  }

  static async del(key) {
    if (!redisClient.isOpen) {
      await this.connect();
    }
    return redisClient.del(key);
  }
}
