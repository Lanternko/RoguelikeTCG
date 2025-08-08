// ===== 🎴 DECKBUILDING SYSTEM (src/systems/DeckbuilderSystem.js) =====

import { EventBus } from '../core/EventBus.js';
import { CardRegistry } from '../cards/CardRegistry.js';

/**
 * 🎴 牌組構築系統
 * 管理卡牌收集、牌組編輯、卡牌選擇等功能
 */
export class DeckbuilderSystem {
  constructor(eventBus) {
    this.eventBus = eventBus || new EventBus();
    this.currentSession = null;
  }

  /**
   * 🎯 開始卡牌選擇會話
   */
  startCardSelection(availableCards, selectionCount = 1, context = 'battle_reward') {
    console.log(`🎯 開始卡牌選擇: ${selectionCount}/${availableCards.length}`);
    
    this.currentSession = {
      sessionId: Date.now(),
      availableCards: [...availableCards],
      selectionCount,
      selectedCards: [],
      context,
      startTime: Date.now()
    };
    
    this.eventBus.emit('card_selection_started', {
      session: this.currentSession
    });
    
    return this.currentSession;
  }

  /**
   * ✅ 選擇卡牌
   */
  selectCard(cardId) {
    if (!this.currentSession) {
      throw new Error('沒有活躍的卡牌選擇會話');
    }
    
    const card = this.currentSession.availableCards.find(c => c.id === cardId);
    if (!card) {
      throw new Error(`卡牌 ${cardId} 不在可選列表中`);
    }
    
    if (this.currentSession.selectedCards.length >= this.currentSession.selectionCount) {
      throw new Error('已達到選擇上限');
    }
    
    this.currentSession.selectedCards.push(card);
    
    console.log(`✅ 選擇卡牌: ${card.name}`);
    
    this.eventBus.emit('card_selected', {
      card,
      session: this.currentSession,
      isSelectionComplete: this.isSelectionComplete()
    });
    
    return {
      success: true,
      selectedCard: card,
      isComplete: this.isSelectionComplete()
    };
  }

  /**
   * ❌ 取消選擇卡牌
   */
  deselectCard(cardId) {
    if (!this.currentSession) {
      throw new Error('沒有活躍的卡牌選擇會話');
    }
    
    const index = this.currentSession.selectedCards.findIndex(c => c.id === cardId);
    if (index === -1) {
      throw new Error(`卡牌 ${cardId} 未被選中`);
    }
    
    const removedCard = this.currentSession.selectedCards.splice(index, 1)[0];
    
    console.log(`❌ 取消選擇: ${removedCard.name}`);
    
    this.eventBus.emit('card_deselected', {
      card: removedCard,
      session: this.currentSession
    });
    
    return removedCard;
  }

  /**
   * 🏁 完成選擇
   */
  finishSelection() {
    if (!this.currentSession) {
      throw new Error('沒有活躍的卡牌選擇會話');
    }
    
    if (!this.isSelectionComplete()) {
      throw new Error(`還需要選擇 ${this.currentSession.selectionCount - this.currentSession.selectedCards.length} 張卡牌`);
    }
    
    const result = {
      selectedCards: [...this.currentSession.selectedCards],
      context: this.currentSession.context,
      duration: Date.now() - this.currentSession.startTime
    };
    
    console.log(`🏁 完成卡牌選擇: ${result.selectedCards.map(c => c.name).join(', ')}`);
    
    this.eventBus.emit('card_selection_completed', {
      result,
      session: this.currentSession
    });
    
    this.currentSession = null;
    return result;
  }

  /**
   * 🔍 檢查選擇是否完成
   */
  isSelectionComplete() {
    return this.currentSession && 
           this.currentSession.selectedCards.length >= this.currentSession.selectionCount;
  }

  /**
   * 📊 分析牌組
   */
  analyzeDeck(deck) {
    const analysis = {
      totalCards: deck.length,
      byAttribute: {},
      byType: {},
      byRarity: {},
      averageStats: {
        attack: 0,
        crit: 0,
        hp_bonus: 0
      },
      powerLevel: 0,
      synergies: [],
      recommendations: []
    };
    
    let totalAttack = 0;
    let totalCrit = 0;
    let totalHP = 0;
    let totalPower = 0;
    
    // 統計卡牌分佈
    deck.forEach(card => {
      // 屬性分佈
      analysis.byAttribute[card.attribute] = (analysis.byAttribute[card.attribute] || 0) + 1;
      
      // 類型分佈
      analysis.byType[card.type] = (analysis.byType[card.type] || 0) + 1;
      
      // 稀有度分佈
      analysis.byRarity[card.rarity] = (analysis.byRarity[card.rarity] || 0) + 1;
      
      // 累計數值
      totalAttack += card.stats.attack;
      totalCrit += card.stats.crit;
      totalHP += card.stats.hp_bonus;
      totalPower += CardRegistry.calculatePowerLevel(card);
    });
    
    // 計算平均值
    if (deck.length > 0) {
      analysis.averageStats.attack = Math.round(totalAttack / deck.length);
      analysis.averageStats.crit = Math.round(totalCrit / deck.length);
      analysis.averageStats.hp_bonus = Math.round(totalHP / deck.length);
      analysis.powerLevel = Math.round(totalPower / deck.length);
    }
    
    // 分析協同效應
    analysis.synergies = this.findSynergies(deck);
    
    // 生成建議
    analysis.recommendations = this.generateRecommendations(analysis);
    
    return analysis;
  }

  /**
   * 🔗 尋找協同效應
   */
  findSynergies(deck) {
    const synergies = [];
    const analysis = this.basicDeckAnalysis(deck);
    
    // 人屬性協同
    if (analysis.byAttribute.human >= 5) {
      synergies.push({
        type: 'attribute_synergy',
        attribute: 'human',
        strength: analysis.byAttribute.human >= 8 ? 'strong' : 'moderate',
        description: `人屬性協同 (${analysis.byAttribute.human}張)：總統等卡牌獲得強化`
      });
    }
    
    // 陰陽平衡
    const yinCount = analysis.byAttribute.yin || 0;
    const yangCount = analysis.byAttribute.yang || 0;
    if (yinCount >= 2 && yangCount >= 2) {
      synergies.push({
        type: 'balance_synergy',
        strength: 'strong',
        description: `陰陽平衡 (陰${yinCount}張, 陽${yangCount}張)：陰陽調和等卡牌觸發條件更容易滿足`
      });
    }
    
    // 法術支援
    const spellCount = analysis.byType.spell || 0;
    if (spellCount >= 3) {
      synergies.push({
        type: 'spell_focus',
        strength: spellCount >= 5 ? 'strong' : 'moderate',
        description: `法術流派 (${spellCount}張)：提供充足的工具性效果`
      });
    }
    
    // 高暴擊構築
    const highCritCards = deck.filter(card => card.stats.crit >= 60).length;
    if (highCritCards >= 4) {
      synergies.push({
        type: 'crit_focus',
        strength: highCritCards >= 6 ? 'strong' : 'moderate',
        description: `暴擊流派 (${highCritCards}張高暴擊卡)：爆發力強但較不穩定`
      });
    }
    
    return synergies;
  }

  /**
   * 💡 生成建議
   */
  generateRecommendations(analysis) {
    const recommendations = [];
    
    // 牌組大小建議
    if (analysis.totalCards < 12) {
      recommendations.push({
        type: 'deck_size',
        priority: 'high',
        message: '牌組過小，建議增加到15-20張卡牌'
      });
    } else if (analysis.totalCards > 25) {
      recommendations.push({
        type: 'deck_size',
        priority: 'medium',
        message: '牌組較大，可能導致抽到關鍵卡的機率降低'
      });
    }
    
    // 屬性平衡建議
    const attributeCount = Object.keys(analysis.byAttribute).length;
    if (attributeCount <= 2) {
      recommendations.push({
        type: 'attribute_focus',
        priority: 'low',
        message: `單一屬性構築 (${attributeCount}種屬性)：專注但缺乏靈活性`
      });
    } else if (attributeCount >= 4) {
      recommendations.push({
        type: 'attribute_spread',
        priority: 'medium',
        message: `多屬性構築 (${attributeCount}種屬性)：靈活但可能缺乏協同效應`
      });
    }
    
    // 平均攻擊力建議
    if (analysis.averageStats.attack < 20) {
      recommendations.push({
        type: 'low_attack',
        priority: 'high',
        message: '平均攻擊力偏低，建議加入更多攻擊型卡牌'
      });
    } else if (analysis.averageStats.attack > 30) {
      recommendations.push({
        type: 'high_attack',
        priority: 'low',
        message: '攻擊力很高，但注意生存能力'
      });
    }
    
    // 稀有卡建議
    const rareCount = (analysis.byRarity.rare || 0) + (analysis.byRarity.legendary || 0);
    if (rareCount < 3) {
      recommendations.push({
        type: 'need_rare_cards',
        priority: 'medium',
        message: '稀有卡較少，建議獲得更多高品質卡牌'
      });
    }
    
    return recommendations;
  }

  /**
   * 📋 基礎牌組分析
   */
  basicDeckAnalysis(deck) {
    const analysis = {
      byAttribute: {},
      byType: {},
      byRarity: {}
    };
    
    deck.forEach(card => {
      analysis.byAttribute[card.attribute] = (analysis.byAttribute[card.attribute] || 0) + 1;
      analysis.byType[card.type] = (analysis.byType[card.type] || 0) + 1;
      analysis.byRarity[card.rarity] = (analysis.byRarity[card.rarity] || 0) + 1;
    });
    
    return analysis;
  }

  /**
   * 🎯 推薦卡牌
   */
  recommendCards(currentDeck, availableCards, count = 3) {
    const deckAnalysis = this.analyzeDeck(currentDeck);
    const recommendations = [];
    
    // 根據牌組分析推薦卡牌
    availableCards.forEach(card => {
      let score = 0;
      
      // 基礎分數：卡牌力量等級
      score += CardRegistry.calculatePowerLevel(card);
      
      // 協同效應加分
      if (deckAnalysis.byAttribute[card.attribute] >= 3) {
        score += 20; // 屬性協同加分
      }
      
      // 平衡牌組
      if (deckAnalysis.averageStats.attack < 20 && card.stats.attack > 25) {
        score += 15; // 補充攻擊力
      }
      
      if ((deckAnalysis.byType.spell || 0) < 2 && card.type === 'spell') {
        score += 10; // 補充工具卡
      }
      
      // 稀有度加分
      if (card.rarity === 'rare') score += 5;
      if (card.rarity === 'legendary') score += 10;
      
      recommendations.push({
        card,
        score,
        reasons: this.getRecommendationReasons(card, deckAnalysis)
      });
    });
    
    // 按分數排序並返回前N張
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }

  /**
   * 💭 獲取推薦理由
   */
  getRecommendationReasons(card, deckAnalysis) {
    const reasons = [];
    
    // 協同效應
    if (deckAnalysis.byAttribute[card.attribute] >= 3) {
      reasons.push(`與現有${card.attribute}屬性卡牌形成協同`);
    }
    
    // 數值補強
    if (deckAnalysis.averageStats.attack < 20 && card.stats.attack > 25) {
      reasons.push('補強牌組攻擊力');
    }
    
    if (card.stats.crit > 60) {
      reasons.push('提供高爆發潛力');
    }
    
    // 功能性
    if (card.type === 'spell') {
      reasons.push('提供工具性效果');
    }
    
    if (card.type === 'support') {
      reasons.push('增強團隊配合');
    }
    
    // 稀有度
    if (card.rarity === 'legendary') {
      reasons.push('傳說品質，強大效果');
    }
    
    return reasons.length > 0 ? reasons : ['均衡的數值表現'];
  }

  /**
   * 📊 獲取當前會話狀態
   */
  getCurrentSession() {
    return this.currentSession;
  }
}

// ===== 🏅 BADGE SYSTEM (src/systems/BadgeSystem.js) =====

/**
 * 🏅 徽章系統
 * 管理徽章效果的應用和計算
 */
export class BadgeSystem {
  constructor(eventBus) {
    this.eventBus = eventBus || new EventBus();
    this.activeBadges = [];
  }

  /**
   * 🏅 應用徽章到牌組
   */
  applyBadgesToDeck(deck, badges) {
    if (!badges || badges.length === 0) {
      return deck;
    }
    
    console.log(`🏅 應用 ${badges.length} 個徽章效果...`);
    
    // 創建牌組副本以避免修改原始數據
    const enhancedDeck = deck.map(card => ({ ...card }));
    
    badges.forEach(badge => {
      this.applyBadgeEffect(enhancedDeck, badge);
    });
    
    return enhancedDeck;
  }

  /**
   * ⚡ 應用單個徽章效果
   */
  applyBadgeEffect(deck, badge) {
    console.log(`⚡ 應用徽章: ${badge.name}`);
    
    switch (badge.effect) {
      case 'common_attack_boost':
        this.applyCommonAttackBoost(deck, badge.value);
        break;
        
      case 'human_effect_boost':
        this.applyHumanEffectBoost(deck, badge.value);
        break;
        
      case 'yin_crit_boost':
        this.applyYinCritBoost(deck, badge.value);
        break;
        
      case 'yang_spell_double':
        this.applyYangSpellDouble(deck);
        break;
        
      case 'ultimate_boost':
        this.applyUltimateBoost(deck, badge.value);
        break;
        
      default:
        console.warn(`未知的徽章效果: ${badge.effect}`);
    }
  }

  /**
   * 🔰 新手之魂：所有普通卡攻擊力+2
   */
  applyCommonAttackBoost(deck, boost) {
    deck.forEach(card => {
      if (card.rarity === 'common') {
        card.stats = { ...card.stats };
        card.stats.attack += boost;
        console.log(`  🔰 ${card.name} 攻擊力 +${boost}`);
      }
    });
  }

  /**
   * 👥 團隊精神：人屬性卡牌效果增強50%
   */
  applyHumanEffectBoost(deck, multiplier) {
    deck.forEach(card => {
      if (card.attribute === 'human' && card.effects) {
        // 為人屬性卡牌添加效果增強標記
        card.badgeEnhanced = card.badgeEnhanced || {};
        card.badgeEnhanced.humanEffectBoost = multiplier;
        console.log(`  👥 ${card.name} 效果增強 +${Math.round(multiplier * 100)}%`);
      }
    });
  }

  /**
   * 🌙 影之掌控：陰屬性卡暴擊率+20%
   */
  applyYinCritBoost(deck, critBoost) {
    deck.forEach(card => {
      if (card.attribute === 'yin') {
        card.stats = { ...card.stats };
        card.stats.crit += critBoost;
        console.log(`  🌙 ${card.name} 暴擊率 +${critBoost}%`);
      }
    });
  }

  /**
   * ☀️ 光明使者：陽屬性法術效果翻倍
   */
  applyYangSpellDouble(deck) {
    deck.forEach(card => {
      if (card.attribute === 'yang' && card.type === 'spell') {
        card.badgeEnhanced = card.badgeEnhanced || {};
        card.badgeEnhanced.yangSpellDouble = true;
        console.log(`  ☀️ ${card.name} 法術效果翻倍`);
      }
    });
  }

  /**
   * 👑 終極戰士：所有卡牌攻擊力+5，暴擊率+10%
   */
  applyUltimateBoost(deck, boosts) {
    deck.forEach(card => {
      card.stats = { ...card.stats };
      card.stats.attack += boosts.attack;
      card.stats.crit += boosts.crit;
      console.log(`  👑 ${card.name} 攻擊 +${boosts.attack}, 暴擊 +${boosts.crit}%`);
    });
  }

  /**
   * 🎯 檢查徽章增強效果
   */
  checkBadgeEnhancement(card, effectType) {
    return card.badgeEnhanced && card.badgeEnhanced[effectType];
  }

  /**
   * 📊 計算徽章增強數值
   */
  calculateEnhancedValue(baseValue, card, effectType) {
    if (!this.checkBadgeEnhancement(card, effectType)) {
      return baseValue;
    }
    
    switch (effectType) {
      case 'humanEffectBoost':
        return Math.round(baseValue * (1 + card.badgeEnhanced.humanEffectBoost));
        
      case 'yangSpellDouble':
        return baseValue * 2;
        
      default:
        return baseValue;
    }
  }

  /**
   * 📋 獲取徽章摘要
   */
  getBadgesSummary(badges) {
    if (!badges || badges.length === 0) {
      return '無徽章效果';
    }
    
    return badges.map(badge => `🏅 ${badge.name}: ${badge.description}`).join('\n');
  }

  /**
   * 🏆 驗證徽章效果
   */
  validateBadgeEffects(deck, badges) {
    const report = {
      valid: true,
      enhancedCards: [],
      totalEnhancements: 0,
      errors: []
    };
    
    badges.forEach(badge => {
      try {
        const affectedCards = this.getAffectedCards(deck, badge);
        report.enhancedCards.push({
          badge: badge.name,
          affectedCards: affectedCards.map(card => card.name)
        });
        report.totalEnhancements += affectedCards.length;
      } catch (error) {
        report.valid = false;
        report.errors.push(`徽章 ${badge.name} 應用失敗: ${error.message}`);
      }
    });
    
    return report;
  }

  /**
   * 🎯 獲取受徽章影響的卡牌
   */
  getAffectedCards(deck, badge) {
    switch (badge.effect) {
      case 'common_attack_boost':
        return deck.filter(card => card.rarity === 'common');
        
      case 'human_effect_boost':
        return deck.filter(card => card.attribute === 'human' && card.effects);
        
      case 'yin_crit_boost':
        return deck.filter(card => card.attribute === 'yin');
        
      case 'yang_spell_double':
        return deck.filter(card => card.attribute === 'yang' && card.type === 'spell');
        
      case 'ultimate_boost':
        return deck; // 影響所有卡牌
        
      default:
        return [];
    }
  }
}