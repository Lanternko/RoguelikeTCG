// ===== 🏆 SEASON MANAGER (src/systems/SeasonManager.js) =====

import { EventBus } from '../core/EventBus.js';
import { CardRegistry } from '../cards/CardRegistry.js';
import { GAME_BALANCE } from '../data/balance/GameBalance.js';

/**
 * 🏆 賽季管理器
 * 管理15場戰鬥的完整賽季流程
 */
export class SeasonManager {
  constructor(eventBus) {
    this.eventBus = eventBus || new EventBus();
    this.currentSeason = null;
    this.isSeasonActive = false;
  }

  /**
   * 🌟 開始新賽季
   */
  startNewSeason() {
    console.log('🌟 開始新賽季...');
    
    this.currentSeason = {
      seasonId: Date.now(),
      startTime: new Date(),
      currentBattle: 1,
      totalBattles: GAME_BALANCE.TOTAL_BATTLES_PER_SEASON,
      battleHistory: [],
      badges: [],
      totalCardsEarned: 0,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      favoriteCards: {},
      
      // 玩家牌組
      playerDeck: this.createStarterDeck(),
      availableCards: [], // 玩家擁有的所有卡牌
      
      // 賽季狀態
      status: 'active', // 'active', 'victory', 'defeat'
      difficultyMultiplier: 1.0
    };
    
    this.isSeasonActive = true;
    
    // 發出賽季開始事件
    this.eventBus.emit('season_started', {
      season: this.currentSeason
    });
    
    console.log(`✅ 賽季 ${this.currentSeason.seasonId} 開始！`);
    return this.currentSeason;
  }

  /**
   * 🎴 創建起始牌組
   */
  createStarterDeck() {
    const starterCards = [
      // 基礎人屬性卡牌 (8張)
      'hero', 'hero', 'kindness', 'kindness',
      'president', 'democracy', 'lottery', 'strongman',
      
      // 混合屬性 (7張)
      'shadow_devour', 'lone_shadow', 'holy_light',
      'weapon_master', 'yinyang_harmony', 'evil_genius',
      'democracy' // 第二張民主
    ];
    
    return starterCards.map(cardId => CardRegistry.create(cardId));
  }

  /**
   * ⚔️ 開始戰鬥
   */
  startBattle(battleNumber = null) {
    if (!this.isSeasonActive) {
      throw new Error('沒有活躍的賽季');
    }
    
    const battle = battleNumber || this.currentSeason.currentBattle;
    const battleData = this.generateBattleData(battle);
    
    console.log(`⚔️ 開始第 ${battle} 場戰鬥: ${battleData.enemyName}`);
    
    // 發出戰鬥開始事件
    this.eventBus.emit('battle_started', {
      battleNumber: battle,
      battleData,
      season: this.currentSeason
    });
    
    return battleData;
  }

  /**
   * 🎯 生成戰鬥數據
   */
  generateBattleData(battleNumber) {
    const difficulty = this.calculateBattleDifficulty(battleNumber);
    
    const battleData = {
      battleNumber,
      enemyName: this.generateEnemyName(battleNumber),
      enemyType: this.getEnemyType(battleNumber),
      
      // 敵人數值 (隨戰鬥數增強)
      pitcherHP: Math.round(GAME_BALANCE.PITCHER_INITIAL_HP * difficulty.hpMultiplier),
      pitcherAttack: Math.round(GAME_BALANCE.PITCHER_BASE_ATTACK * difficulty.attackMultiplier),
      pitcherAttribute: this.getEnemyAttribute(battleNumber),
      
      // 戰鬥特殊規則
      specialRules: this.getBattleSpecialRules(battleNumber),
      
      // 勝利獎勵
      rewards: this.generateBattleRewards(battleNumber),
      
      difficulty: difficulty.level
    };
    
    return battleData;
  }

  /**
   * 📈 計算戰鬥難度
   */
  calculateBattleDifficulty(battleNumber) {
    const baseMultiplier = 1.0 + (battleNumber - 1) * 0.15; // 每場戰鬥+15%
    
    // 特殊戰鬥額外難度
    const specialBattles = [5, 10, 15]; // Boss戰
    const isSpecialBattle = specialBattles.includes(battleNumber);
    
    const finalMultiplier = baseMultiplier * (isSpecialBattle ? 1.5 : 1.0) * this.currentSeason.difficultyMultiplier;
    
    return {
      level: battleNumber <= 3 ? 'easy' : battleNumber <= 8 ? 'normal' : battleNumber <= 12 ? 'hard' : 'extreme',
      hpMultiplier: finalMultiplier,
      attackMultiplier: finalMultiplier * 0.8, // 攻擊力增長較慢
      isSpecialBattle
    };
  }

  /**
   * 👹 生成敵人名稱
   */
  generateEnemyName(battleNumber) {
    const enemyNames = [
      // 前期 (1-5)
      '新手投手', '街頭選手', '業餘好手', '校隊王牌', '地區冠軍',
      // 中期 (6-10)
      '職業新秀', '聯盟老將', '明星選手', '全明星', '賽揚候選',
      // 後期 (11-15)
      '傳奇投手', '殿堂級', '不敗神話', '時代巨星', '終極魔王'
    ];
    
    return enemyNames[battleNumber - 1] || `第${battleNumber}號投手`;
  }

  /**
   * 🎭 獲取敵人類型
   */
  getEnemyType(battleNumber) {
    if ([5, 10, 15].includes(battleNumber)) return 'boss';
    if ([3, 7, 12].includes(battleNumber)) return 'elite';
    return 'normal';
  }

  /**
   * 🌈 獲取敵人屬性
   */
  getEnemyAttribute(battleNumber) {
    const attributes = ['heaven', 'earth', 'yin', 'yang', 'human'];
    return attributes[(battleNumber - 1) % attributes.length];
  }

  /**
   * 🎲 獲取戰鬥特殊規則
   */
  getBattleSpecialRules(battleNumber) {
    const rules = [];
    
    // Boss戰特殊規則
    if ([5, 10, 15].includes(battleNumber)) {
      rules.push('二階段Boss：血量降至50%時進入第二階段');
    }
    
    // 中後期規則
    if (battleNumber >= 8) {
      rules.push('強化投手：疲勞率減半');
    }
    
    if (battleNumber >= 12) {
      rules.push('限制手牌：手牌上限-1');
    }
    
    return rules;
  }

  /**
   * 🎁 生成戰鬥獎勵
   */
  generateBattleRewards(battleNumber) {
    const rewards = {
      cardChoices: [], // 可選擇的卡牌
      cardCount: 1,    // 可選擇的卡牌數量
      badge: null,     // 徽章獎勵
      specialReward: null
    };
    
    // 徽章戰鬥
    if (GAME_BALANCE.BADGE_BATTLE_NUMBERS.includes(battleNumber)) {
      rewards.badge = this.generateBadgeReward(battleNumber);
    }
    
    // Boss戰額外獎勵
    if ([5, 10, 15].includes(battleNumber)) {
      rewards.cardCount = 3; // Boss戰可選3張卡
      rewards.specialReward = '稀有卡牌保證';
    }
    
    // 生成可選卡牌
    rewards.cardChoices = this.generateCardChoices(battleNumber, rewards.cardCount);
    
    return rewards;
  }

  /**
   * 🏅 生成徽章獎勵
   */
  generateBadgeReward(battleNumber) {
    const badgeData = {
      1: {
        id: 'rookie_spirit',
        name: '新手之魂',
        description: '所有普通卡攻擊力+2',
        effect: 'common_attack_boost',
        value: 2
      },
      4: {
        id: 'team_player',
        name: '團隊精神',
        description: '人屬性卡牌效果增強50%',
        effect: 'human_effect_boost',
        value: 0.5
      },
      7: {
        id: 'shadow_master',
        name: '影之掌控',
        description: '陰屬性卡暴擊率+20%',
        effect: 'yin_crit_boost',
        value: 20
      },
      10: {
        id: 'light_bringer',
        name: '光明使者',
        description: '陽屬性法術效果翻倍',
        effect: 'yang_spell_double',
        value: 1
      },
      13: {
        id: 'ultimate_warrior',
        name: '終極戰士',
        description: '所有卡牌攻擊力+5，暴擊率+10%',
        effect: 'ultimate_boost',
        value: { attack: 5, crit: 10 }
      }
    };
    
    return badgeData[battleNumber] || null;
  }

  /**
   * 🎴 生成卡牌選擇
   */
  generateCardChoices(battleNumber, choiceCount) {
    const choices = [];
    
    // 根據戰鬥數決定卡牌稀有度分佈
    const rarityWeights = this.calculateRarityWeights(battleNumber);
    
    for (let i = 0; i < choiceCount + 2; i++) { // 多生成2張備選
      const rarity = this.selectRarityByWeight(rarityWeights);
      const availableCards = CardRegistry.getCardsByRarity(rarity);
      
      if (availableCards.length > 0) {
        const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
        
        // 避免重複
        if (!choices.find(choice => choice.id === randomCard.id)) {
          choices.push(randomCard);
        }
      }
    }
    
    return choices.slice(0, choiceCount);
  }

  /**
   * 🎯 計算稀有度權重
   */
  calculateRarityWeights(battleNumber) {
    // 前期：普通卡為主
    if (battleNumber <= 5) {
      return { common: 70, rare: 25, legendary: 5 };
    }
    // 中期：稀有卡增加
    else if (battleNumber <= 10) {
      return { common: 50, rare: 40, legendary: 10 };
    }
    // 後期：傳說卡更常見
    else {
      return { common: 30, rare: 45, legendary: 25 };
    }
  }

  /**
   * 🎲 按權重選擇稀有度
   */
  selectRarityByWeight(weights) {
    const total = weights.common + weights.rare + weights.legendary;
    const random = Math.random() * total;
    
    if (random < weights.common) return 'common';
    if (random < weights.common + weights.rare) return 'rare';
    return 'legendary';
  }

  /**
   * 🏆 完成戰鬥
   */
  completeBattle(battleResult) {
    if (!this.isSeasonActive) {
      throw new Error('沒有活躍的賽季');
    }
    
    const battleData = {
      battleNumber: this.currentSeason.currentBattle,
      result: battleResult.victory ? 'victory' : 'defeat',
      playerDamageDealt: battleResult.playerDamageDealt || 0,
      playerDamageReceived: battleResult.playerDamageReceived || 0,
      turnsPlayed: battleResult.turnsPlayed || 0,
      cardsPlayed: battleResult.cardsPlayed || [],
      completedAt: new Date()
    };
    
    this.currentSeason.battleHistory.push(battleData);
    this.currentSeason.totalDamageDealt += battleData.playerDamageDealt;
    this.currentSeason.totalDamageTaken += battleData.playerDamageReceived;
    
    if (battleResult.victory) {
      console.log(`🏆 第 ${this.currentSeason.currentBattle} 場戰鬥勝利！`);
      
      // 檢查是否完成賽季
      if (this.currentSeason.currentBattle >= this.currentSeason.totalBattles) {
        return this.completeSeason(true);
      } else {
        this.currentSeason.currentBattle++;
        
        // 發出戰鬥勝利事件
        this.eventBus.emit('battle_victory', {
          battleData,
          season: this.currentSeason,
          isSeasonComplete: false
        });
        
        return { 
          victory: true, 
          seasonComplete: false,
          nextBattle: this.currentSeason.currentBattle
        };
      }
    } else {
      console.log(`💀 第 ${this.currentSeason.currentBattle} 場戰鬥失敗！`);
      return this.completeSeason(false);
    }
  }

  /**
   * 🎁 添加卡牌到牌組
   */
  addCardToDeck(cardId) {
    if (!this.isSeasonActive) {
      throw new Error('沒有活躍的賽季');
    }
    
    const card = CardRegistry.create(cardId);
    this.currentSeason.playerDeck.push(card);
    this.currentSeason.availableCards.push(card);
    this.currentSeason.totalCardsEarned++;
    
    // 統計最愛卡牌
    this.currentSeason.favoriteCards[cardId] = (this.currentSeason.favoriteCards[cardId] || 0) + 1;
    
    console.log(`🎴 獲得新卡牌: ${card.name}`);
    
    this.eventBus.emit('card_earned', {
      card,
      totalCards: this.currentSeason.playerDeck.length,
      season: this.currentSeason
    });
  }

  /**
   * 🏅 添加徽章
   */
  addBadge(badge) {
    if (!this.isSeasonActive) {
      throw new Error('沒有活躍的賽季');
    }
    
    this.currentSeason.badges.push({
      ...badge,
      earnedAt: new Date(),
      battleNumber: this.currentSeason.currentBattle
    });
    
    console.log(`🏅 獲得徽章: ${badge.name}`);
    
    this.eventBus.emit('badge_earned', {
      badge,
      totalBadges: this.currentSeason.badges.length,
      season: this.currentSeason
    });
  }

  /**
   * 🏁 完成賽季
   */
  completeSeason(victory) {
    if (!this.isSeasonActive) {
      throw new Error('沒有活躍的賽季');
    }
    
    this.currentSeason.status = victory ? 'victory' : 'defeat';
    this.currentSeason.completedAt = new Date();
    this.currentSeason.duration = this.currentSeason.completedAt - this.currentSeason.startTime;
    
    this.isSeasonActive = false;
    
    const seasonStats = this.generateSeasonStats();
    
    console.log(`🏁 賽季${victory ? '勝利' : '失敗'}完成！`);
    
    this.eventBus.emit('season_complete', {
      victory,
      season: this.currentSeason,
      stats: seasonStats
    });
    
    return {
      victory,
      seasonComplete: true,
      stats: seasonStats,
      season: this.currentSeason
    };
  }

  /**
   * 📊 生成賽季統計
   */
  generateSeasonStats() {
    const season = this.currentSeason;
    
    return {
      battlesWon: season.battleHistory.filter(b => b.result === 'victory').length,
      totalBattles: season.battleHistory.length,
      totalDamageDealt: season.totalDamageDealt,
      totalDamageTaken: season.totalDamageTaken,
      cardsEarned: season.totalCardsEarned,
      badgesEarned: season.badges.length,
      finalDeckSize: season.playerDeck.length,
      favoriteCard: this.getMostUsedCard(),
      averageTurnsPerBattle: this.getAverageTurnsPerBattle(),
      playTime: season.duration
    };
  }

  /**
   * 🎴 獲取最常用卡牌
   */
  getMostUsedCard() {
    const favorites = this.currentSeason.favoriteCards;
    let mostUsed = null;
    let maxCount = 0;
    
    for (const [cardId, count] of Object.entries(favorites)) {
      if (count > maxCount) {
        maxCount = count;
        mostUsed = cardId;
      }
    }
    
    return mostUsed ? {
      cardId: mostUsed,
      count: maxCount,
      card: CardRegistry.create(mostUsed)
    } : null;
  }

  /**
   * ⏱️ 獲取平均回合數
   */
  getAverageTurnsPerBattle() {
    const battles = this.currentSeason.battleHistory;
    if (battles.length === 0) return 0;
    
    const totalTurns = battles.reduce((sum, battle) => sum + (battle.turnsPlayed || 0), 0);
    return Math.round(totalTurns / battles.length);
  }

  /**
   * 📋 獲取當前賽季狀態
   */
  getCurrentSeason() {
    return this.currentSeason;
  }

  /**
   * 🔍 獲取賽季進度
   */
  getSeasonProgress() {
    if (!this.currentSeason) return null;
    
    return {
      current: this.currentSeason.currentBattle,
      total: this.currentSeason.totalBattles,
      percentage: Math.round((this.currentSeason.currentBattle - 1) / this.currentSeason.totalBattles * 100),
      nextBadgeBattle: GAME_BALANCE.BADGE_BATTLE_NUMBERS.find(
        battle => battle > this.currentSeason.currentBattle
      )
    };
  }
}