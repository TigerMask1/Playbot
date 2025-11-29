const { getCollection, COLLECTIONS } = require('../core/database');
const { createAuditLog } = require('./AuditService');

const CURRENCY_ACTIONS = {
  GRANT: 'grant',
  DEDUCT: 'deduct',
  TRANSFER: 'transfer',
  CONVERT: 'convert',
  PURCHASE: 'purchase',
  REWARD: 'reward',
  PENALTY: 'penalty',
  TRADE: 'trade',
  BATTLE: 'battle',
  QUEST: 'quest',
  WORK: 'work',
  DAILY: 'daily',
  EVENT: 'event',
  ADMIN: 'admin'
};

class CurrencyService {
  static async getGlobalBalance(discordId) {
    try {
      const collection = await getCollection(COLLECTIONS.GLOBAL.USERS);
      const user = await collection.findOne({ odiscordId: discordId });
      
      if (!user) {
        return { playCoins: 0, playGems: 0 };
      }
      
      return user.globalCurrency || { playCoins: 0, playGems: 0 };
    } catch (error) {
      console.error('Error getting global balance:', error);
      return { playCoins: 0, playGems: 0 };
    }
  }

  static async getServerBalance(discordId, serverId) {
    try {
      const collection = await getCollection(COLLECTIONS.USER.PLAYER_DATA);
      const player = await collection.findOne({ odiscordId: discordId, serverId });
      
      if (!player) {
        return { coins: 0, gems: 0 };
      }
      
      return player.currency || { coins: 0, gems: 0 };
    } catch (error) {
      console.error('Error getting server balance:', error);
      return { coins: 0, gems: 0 };
    }
  }

  static async modifyGlobalCurrency(discordId, username, amount, currencyType, action, reason, authorizedBy) {
    try {
      const isSuperAdmin = await this.isSuperAdmin(authorizedBy.id);
      if (!isSuperAdmin) {
        return { 
          success: false, 
          message: 'Only super admins can modify global currency' 
        };
      }

      const collection = await getCollection(COLLECTIONS.GLOBAL.USERS);
      const field = currencyType === 'playGems' ? 'globalCurrency.playGems' : 'globalCurrency.playCoins';
      
      const currentBalance = await this.getGlobalBalance(discordId);
      const currentAmount = currencyType === 'playGems' ? currentBalance.playGems : currentBalance.playCoins;
      
      if (amount < 0 && currentAmount + amount < 0) {
        return { 
          success: false, 
          message: 'Insufficient balance',
          currentBalance: currentAmount
        };
      }

      await collection.updateOne(
        { odiscordId: discordId },
        { 
          $inc: { [field]: amount },
          $set: { updatedAt: new Date() },
          $setOnInsert: { 
            odiscordId: discordId,
            username,
            createdAt: new Date()
          }
        },
        { upsert: true }
      );

      await this.recordTransaction({
        userId: discordId,
        username,
        currencyType,
        amount,
        action,
        reason,
        authorizedBy: authorizedBy.id,
        authorizedByName: authorizedBy.username,
        balanceBefore: currentAmount,
        balanceAfter: currentAmount + amount,
        isGlobal: true
      });

      await createAuditLog({
        action: 'GLOBAL_CURRENCY_MODIFIED',
        category: 'currency',
        userId: authorizedBy.id,
        username: authorizedBy.username,
        targetId: discordId,
        targetType: 'user',
        metadata: {
          currencyType,
          amount,
          action,
          reason,
          balanceBefore: currentAmount,
          balanceAfter: currentAmount + amount
        }
      });

      return { 
        success: true, 
        message: `Successfully ${action === 'grant' ? 'granted' : 'deducted'} ${Math.abs(amount)} ${currencyType}`,
        newBalance: currentAmount + amount
      };
    } catch (error) {
      console.error('Error modifying global currency:', error);
      return { success: false, message: 'Failed to modify currency' };
    }
  }

  static async modifyServerCurrency(discordId, serverId, username, amount, currencyType, action, reason, authorizedBy = null) {
    try {
      const collection = await getCollection(COLLECTIONS.USER.PLAYER_DATA);
      const field = currencyType === 'gems' ? 'currency.gems' : 'currency.coins';
      
      const currentBalance = await this.getServerBalance(discordId, serverId);
      const currentAmount = currencyType === 'gems' ? currentBalance.gems : currentBalance.coins;
      
      if (amount < 0 && currentAmount + amount < 0) {
        return { 
          success: false, 
          message: 'Insufficient balance',
          currentBalance: currentAmount
        };
      }

      await collection.updateOne(
        { odiscordId: discordId, serverId },
        { 
          $inc: { [field]: amount },
          $set: { updatedAt: new Date() },
          $setOnInsert: { 
            odiscordId: discordId,
            serverId,
            username,
            currency: { coins: 0, gems: 0 },
            createdAt: new Date()
          }
        },
        { upsert: true }
      );

      await this.recordTransaction({
        userId: discordId,
        username,
        serverId,
        currencyType,
        amount,
        action,
        reason,
        authorizedBy: authorizedBy?.id || 'system',
        authorizedByName: authorizedBy?.username || 'System',
        balanceBefore: currentAmount,
        balanceAfter: currentAmount + amount,
        isGlobal: false
      });

      return { 
        success: true, 
        newBalance: currentAmount + amount
      };
    } catch (error) {
      console.error('Error modifying server currency:', error);
      return { success: false, message: 'Failed to modify currency' };
    }
  }

  static async convertGlobalToServer(discordId, serverId, username, playCoins = 0, playGems = 0) {
    try {
      const TenantService = require('./TenantService');
      const serverConfig = await TenantService.getServerConfig(serverId);
      
      if (!serverConfig) {
        return { success: false, message: 'Server not configured' };
      }

      const rates = serverConfig.economy?.globalToServerRate || { playCoins: 1, playGems: 1 };
      
      const globalBalance = await this.getGlobalBalance(discordId);
      
      if (playCoins > 0 && globalBalance.playCoins < playCoins) {
        return { success: false, message: 'Insufficient PlayCoins' };
      }
      if (playGems > 0 && globalBalance.playGems < playGems) {
        return { success: false, message: 'Insufficient PlayGems' };
      }

      const serverCoins = Math.floor(playCoins * rates.playCoins);
      const serverGems = Math.floor(playGems * rates.playGems);

      if (playCoins > 0) {
        const globalUsers = await getCollection(COLLECTIONS.GLOBAL.USERS);
        await globalUsers.updateOne(
          { odiscordId: discordId },
          { $inc: { 'globalCurrency.playCoins': -playCoins } }
        );
      }
      if (playGems > 0) {
        const globalUsers = await getCollection(COLLECTIONS.GLOBAL.USERS);
        await globalUsers.updateOne(
          { odiscordId: discordId },
          { $inc: { 'globalCurrency.playGems': -playGems } }
        );
      }

      if (serverCoins > 0) {
        await this.modifyServerCurrency(discordId, serverId, username, serverCoins, 'coins', CURRENCY_ACTIONS.CONVERT, 'Global to server conversion');
      }
      if (serverGems > 0) {
        await this.modifyServerCurrency(discordId, serverId, username, serverGems, 'gems', CURRENCY_ACTIONS.CONVERT, 'Global to server conversion');
      }

      await this.recordTransaction({
        userId: discordId,
        username,
        serverId,
        currencyType: 'conversion',
        amount: 0,
        action: CURRENCY_ACTIONS.CONVERT,
        reason: 'Global to server conversion',
        metadata: {
          playCoinsSpent: playCoins,
          playGemsSpent: playGems,
          serverCoinsReceived: serverCoins,
          serverGemsReceived: serverGems,
          rates
        },
        isGlobal: false
      });

      return { 
        success: true, 
        message: `Converted ${playCoins} PlayCoins and ${playGems} PlayGems to ${serverCoins} coins and ${serverGems} gems`,
        received: { coins: serverCoins, gems: serverGems }
      };
    } catch (error) {
      console.error('Error converting currency:', error);
      return { success: false, message: 'Failed to convert currency' };
    }
  }

  static async recordTransaction(transaction) {
    try {
      const collection = await getCollection(COLLECTIONS.GLOBAL.CURRENCY_LEDGER);
      
      await collection.insertOne({
        ...transaction,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error recording transaction:', error);
    }
  }

  static async getTransactionHistory(discordId, serverId = null, limit = 50) {
    try {
      const collection = await getCollection(COLLECTIONS.GLOBAL.CURRENCY_LEDGER);
      
      const query = { userId: discordId };
      if (serverId) {
        query.serverId = serverId;
      }
      
      const transactions = await collection
        .find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();
      
      return transactions;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }

  static async transferServerCurrency(fromId, toId, serverId, fromUsername, toUsername, amount, currencyType, reason = 'Transfer') {
    try {
      const fromBalance = await this.getServerBalance(fromId, serverId);
      const currentAmount = currencyType === 'gems' ? fromBalance.gems : fromBalance.coins;
      
      if (currentAmount < amount) {
        return { success: false, message: 'Insufficient balance' };
      }

      await this.modifyServerCurrency(fromId, serverId, fromUsername, -amount, currencyType, CURRENCY_ACTIONS.TRANSFER, `Transfer to ${toUsername}: ${reason}`);
      await this.modifyServerCurrency(toId, serverId, toUsername, amount, currencyType, CURRENCY_ACTIONS.TRANSFER, `Transfer from ${fromUsername}: ${reason}`);

      return { success: true, message: `Transferred ${amount} ${currencyType}` };
    } catch (error) {
      console.error('Error transferring currency:', error);
      return { success: false, message: 'Failed to transfer currency' };
    }
  }

  static async isSuperAdmin(userId) {
    try {
      const collection = await getCollection(COLLECTIONS.GLOBAL.SUPER_ADMINS);
      const admin = await collection.findOne({ odiscordId: userId });
      return !!admin;
    } catch (error) {
      console.error('Error checking super admin:', error);
      return false;
    }
  }

  static async addSuperAdmin(userId, username, addedBy) {
    try {
      const isAdmin = await this.isSuperAdmin(addedBy.id);
      if (!isAdmin) {
        return { success: false, message: 'Only super admins can add other super admins' };
      }

      const collection = await getCollection(COLLECTIONS.GLOBAL.SUPER_ADMINS);
      
      await collection.updateOne(
        { odiscordId: userId },
        { 
          $set: { 
            odiscordId: userId,
            username,
            addedBy: addedBy.id,
            addedAt: new Date()
          }
        },
        { upsert: true }
      );

      await createAuditLog({
        action: 'SUPER_ADMIN_ADDED',
        category: 'permission',
        userId: addedBy.id,
        username: addedBy.username,
        targetId: userId,
        targetType: 'user'
      });

      return { success: true, message: 'Super admin added' };
    } catch (error) {
      console.error('Error adding super admin:', error);
      return { success: false, message: 'Failed to add super admin' };
    }
  }
}

module.exports = { CurrencyService, CURRENCY_ACTIONS };
