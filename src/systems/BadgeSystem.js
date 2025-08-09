// src/systems/BadgeSystem.js - 徽章系統

import { EventBus } from '../core/EventBus.js';

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