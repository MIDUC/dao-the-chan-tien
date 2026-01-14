import { Repository } from 'typeorm';
import { QiEffect, QiType, QiCategory } from '../entities/qi.entity';

export async function seedQiEffects(
  qiEffectRepo: Repository<QiEffect>,
): Promise<QiEffect[]> {
  const effects: Partial<QiEffect>[] = [
    // ========== Nhóm Tâm Tính & Hành Vi (Core Gameplay) ==========
    {
      qi_type: QiType.KILLING_QI,
      category: QiCategory.CORE_GAMEPLAY,
      name: 'Sát Khí',
      description:
        'Hình thành từ việc tiêu diệt sinh linh. Tăng sát thương và bạo kích, nhưng nuôi Tâm Ma.',
      effects: {
        passive: {
          crit_damage_bonus: 30, // +30% crit damage
          fear_chance: 25, // 25% fear chance on weak enemies
        },
        active: {
          // Suppression effect: weak enemies flee or lose defense
        },
        sources: {
          quest_types: ['kill_monster', 'pvp_win'],
          fitness_activities: ['hiit', 'boxing'],
        },
        penalties: {
          heart_demon_strength: 1.5, // Heart demon boss 50% stronger
          self_attack_chance: 10, // 10% chance to attack self if Tam Canh < threshold
          cannot_use_heal_chance: 15, // 15% chance cannot use healing items
          npc_refuse_trade: true, // Righteous NPCs refuse trade
          price_increase: 20, // 20% price increase
        },
      },
    },
    {
      qi_type: QiType.SCHOLARLY_QI,
      category: QiCategory.CORE_GAMEPLAY,
      name: 'Văn Khí',
      description:
        'Khí toát ra từ sự hiểu biết. Không có tác hại, tăng hiệu quả và may mắn.',
      effects: {
        passive: {
          skill_learning_speed: 50, // +50% skill learning speed
          npc_price_reduction: 15, // 15% price reduction
        },
        active: {
          // See through: Show HP and weaknesses
          refine_success_rate: 20, // +20% refine success
        },
        sources: {
          quest_types: ['library', 'puzzle', 'collect_books'],
          fitness_activities: ['reading', 'study', 'focus_time'],
        },
      },
      // No penalties - pure buff
    },
    {
      qi_type: QiType.RIGHTEOUS_QI,
      category: QiCategory.CORE_GAMEPLAY,
      name: 'Hạo Nhiên Khí',
      description:
        'Khí chính trực. Khắc chế Tâm Ma và tạo giáp ảo, nhưng sẽ phản phệ nếu PK vô tội.',
      effects: {
        passive: {
          debuff_resistance: 50, // 50% debuff resistance
          magic_resistance: 20, // 20% magic resistance (against demons)
        },
        active: {
          shield: {
            max_shield: 500,
            regen_rate: 25,
            regen_delay: 5,
          },
        },
        sources: {
          quest_types: ['protect', 'donate_guild', 'kill_evil'],
          fitness_activities: ['early_wake', 'streak'],
        },
        penalties: {
          // If PK innocent while having Righteous Qi -> rapid loss and self-damage
          // This is handled in QiService
        },
      },
    },

    // ========== Nhóm Thể Chất & Sinh Tồn (Fitness) ==========
    {
      qi_type: QiType.BLOOD_QI,
      category: QiCategory.FITNESS,
      name: 'Huyết Khí',
      description:
        'Sức mạnh của máu thịt, cơ bắp. Tăng hồi máu và kháng sát thương vật lý.',
      effects: {
        passive: {
          hp_regen_per_second: 0.5, // 0.5 HP per second
          physical_resistance: 10, // 10% physical damage reduction
        },
        sources: {
          fitness_activities: ['gym', 'weight_lifting', 'squat', 'push_up'],
        },
      },
    },
    {
      qi_type: QiType.BLOOD_QI,
      category: QiCategory.FITNESS,
      name: 'Huyết Khí',
      description:
        'Sức mạnh của máu thịt, cơ bắp. Tăng HP và hồi máu, nhưng nếu quá cao mà Linh Khí thấp -> giảm kháng phép.',
      effects: {
        passive: {
          hp_regen_per_second: 0.5, // 0.5 HP per second
          physical_resistance: 10, // 10% physical damage reduction
        },
        sources: {
          fitness_activities: ['gym', 'weight_lifting', 'squat', 'push_up'],
        },
        penalties: {
          // If Blood Qi too high and Spiritual Qi too low -> reduce magic resistance
          magic_resistance_penalty: 15, // -15% magic resistance if imbalance
        },
      },
    },
    {
      qi_type: QiType.SPIRITUAL_QI,
      category: QiCategory.FITNESS,
      name: 'Linh Khí',
      description:
        'Năng lượng của trời đất. Tăng MP và sức mạnh phép thuật, nhưng thu hút quái Phệ Linh.',
      effects: {
        passive: {
          mp_regen_per_second: 1, // 1 MP per second
        },
        sources: {
          fitness_activities: ['meditation', 'yoga', 'breathwork', 'sleep'],
        },
        penalties: {
          attract_enemy_type: 'mana_drainer', // Attracts mana-draining enemies
        },
      },
    },
    {
      qi_type: QiType.IMPURE_QI,
      category: QiCategory.FITNESS,
      name: 'Trọc Khí',
      description:
        'Khí bẩn, cặn bã. Không có lợi ích, làm chậm tu luyện và chiếm chỗ mana.',
      effects: {
        passive: {
          cultivation_speed_penalty: 50, // -50% cultivation speed
        },
        sources: {
          // Accumulates from inactivity or doping
        },
        penalties: {
          mana_capacity_reduction: 1, // Reduces max mana by 1 per point
        },
      },
    },
    {
      qi_type: QiType.VITAL_QI,
      category: QiCategory.FITNESS,
      name: 'Nguyên Khí',
      description:
        'Khí gốc của con người khi sinh ra, rất quý. Dùng khi đột phá cảnh giới hoặc hồi sinh.',
      effects: {
        active: {
          breakthrough_success_rate: 50, // +50% breakthrough success
          revival_chance: 100, // 100% revival chance
        },
        sources: {
          events: ['major_event', 'streak_reward'],
          streak_days: 30,
        },
      },
    },

    // ========== Nhóm Tính Cách & Phe Phái ==========
    {
      qi_type: QiType.RIGHTEOUS_QI,
      category: QiCategory.ALIGNMENT,
      name: 'Hạo Nhiên Chính Khí',
      description:
        'Khí thế oai nghiêm, chính trực của bậc quân tử. Kháng mọi hiệu ứng xấu và khắc chế ma quỷ.',
      effects: {
        passive: {
          debuff_resistance: 50, // 50% debuff resistance
          magic_resistance: 20, // 20% magic resistance (against demons)
        },
        sources: {
          quest_types: ['help_npc', 'good_deed'],
          time_of_day: ['morning'],
        },
      },
    },
    {
      qi_type: QiType.KILLING_QI,
      category: QiCategory.ALIGNMENT,
      name: 'Sát Khí',
      description:
        'Hình thành từ việc tiêu diệt sinh linh. Tăng sát thương bạo kích và gây sợ hãi.',
      effects: {
        passive: {
          crit_damage_bonus: 30, // +30% crit damage
          fear_chance: 25, // 25% fear chance on weak enemies
        },
        sources: {
          quest_types: ['kill_boss', 'pvp_win'],
        },
      },
    },
    {
      qi_type: QiType.SCHOLARLY_QI,
      category: QiCategory.ALIGNMENT,
      name: 'Văn Khí',
      description:
        'Khí toát ra từ sự hiểu biết, kinh thư. Tăng tốc độ học kỹ năng và giảm giá NPC.',
      effects: {
        passive: {
          skill_learning_speed: 50, // +50% skill learning speed
          npc_price_reduction: 15, // 15% price reduction
        },
        sources: {
          quest_types: ['quiz', 'read_lore'],
        },
      },
    },
    {
      qi_type: QiType.DEMONIC_QI,
      category: QiCategory.ALIGNMENT,
      name: 'Ma Khí',
      description:
        'Khí tà ác, hỗn loạn. Tăng sức mạnh đột biến nhưng tụt máu dần (Berserk mode).',
      effects: {
        active: {
          berserk: {
            damage_multiplier: 2, // 2x damage
            hp_drain_per_second: 5, // 5 HP per second
            duration: 60, // 60 seconds
          },
        },
        sources: {
          quest_types: ['dark_cultivation'],
          time_of_day: ['night'],
        },
      },
    },

    // ========== Nhóm Nguyên Tố & Môi Trường ==========
    {
      qi_type: QiType.FROST_QI,
      category: QiCategory.ELEMENTAL,
      name: 'Hàn Khí',
      description: 'Khí lạnh giá. Đòn đánh gây làm chậm và đóng băng.',
      effects: {
        passive: {
          slow_chance: 30, // 30% slow chance
          freeze_chance: 15, // 15% freeze chance
        },
        sources: {
          locations: ['snow_mountain'],
          weather: ['snowy'],
        },
      },
    },
    {
      qi_type: QiType.YANG_QI,
      category: QiCategory.ELEMENTAL,
      name: 'Dương Khí',
      description: 'Khí dương tính. Tăng khả năng hồi phục và thiêu đốt âm tà.',
      effects: {
        passive: {
          hp_regen_per_second: 1, // 1 HP per second
          burn_chance: 20, // 20% burn chance
        },
        sources: {
          time_of_day: ['day'],
          locations: ['outdoor'],
        },
      },
    },
    {
      qi_type: QiType.YIN_QI,
      category: QiCategory.ELEMENTAL,
      name: 'Âm Khí',
      description: 'Khí âm tính. Tăng khả năng ẩn thân và tấn công linh hồn.',
      effects: {
        passive: {
          stealth_bonus: 40, // +40 stealth
          soul_damage_bonus: 30, // +30% soul damage
        },
        sources: {
          locations: ['cave', 'graveyard'],
          time_of_day: ['night'],
        },
      },
    },
    {
      qi_type: QiType.IMPURE_QI,
      category: QiCategory.ELEMENTAL,
      name: 'Trọc Khí',
      description:
        'Khí bẩn, cặn bã trong cơ thể. Tích tụ khi không hoạt động 24h, làm chậm tu luyện.',
      effects: {
        passive: {
          cultivation_speed_penalty: 50, // -50% cultivation speed
        },
        sources: {
          // Accumulates automatically when inactive
        },
      },
    },

    // ========== Nhóm Cao Cấp & Truyền Thuyết ==========
    {
      qi_type: QiType.PRENATAL_QI,
      category: QiCategory.LEGENDARY,
      name: 'Tiên Thiên Khí',
      description:
        'Khí có từ trước khi trời đất phân chia. Cải thiện Căn Cốt vĩnh viễn.',
      effects: {
        active: {
          root_bone_improvement: 1, // +1 root bone level
        },
        sources: {
          events: ['legendary_event', 'rebirth'],
        },
      },
    },
    {
      qi_type: QiType.GRANDMIST_PURPLE_QI,
      category: QiCategory.LEGENDARY,
      name: 'Hồng Mông Tử Khí',
      description:
        'Loại khí ngưng tụ vận may của thiên đạo. Đảm bảo 100% thành công khi rèn đồ Thần khí hoặc Đột phá. Chỉ xuất hiện 5:00-7:00 sáng.',
      effects: {
        active: {
          convert_to_any: true, // Can convert to any Qi type
          refine_success_rate: 100, // 100% refine success
          breakthrough_success_rate: 100, // 100% breakthrough success
        },
        sources: {
          time_of_day: ['5:00-7:00'], // Only 5-7 AM
          fitness_activities: ['early_wake'],
          events: ['divine_blessing'],
        },
      },
      // No penalties - pure benefit
    },
    {
      qi_type: QiType.CHAOS_QI,
      category: QiCategory.LEGENDARY,
      name: 'Hỗn Độn Khí',
      description:
        'Dung hợp của mọi loại khí. Chuyển hóa thành bất kỳ loại sát thương nào kẻ địch yếu nhất.',
      effects: {
        active: {
          damage_conversion: true, // Convert to enemy's weakest damage type
        },
        sources: {
          events: ['chaos_merger'],
        },
      },
    },
    {
      qi_type: QiType.IMPERIAL_QI,
      category: QiCategory.LEGENDARY,
      name: 'Đế Khí',
      description:
        'Khí của bậc đế vương. Buff chỉ số cho toàn bộ thành viên trong Bang hội/Party.',
      effects: {
        active: {
          guild_buff: {
            strength_bonus: 20,
            agility_bonus: 20,
            wisdom_bonus: 20,
          },
        },
        sources: {
          // Only for guild leaders
        },
      },
    },

    // ========== Nhóm Phòng Thủ & Hỗ Trợ ==========
    {
      qi_type: QiType.AURA_QI,
      category: QiCategory.DEFENSIVE,
      name: 'Cương Khí',
      description:
        'Lớp khí bảo vệ quanh người. Một lớp "Giáp ảo" tự hồi phục sau khi không chịu sát thương trong 5s.',
      effects: {
        active: {
          shield: {
            max_shield: 1000, // Max 1000 shield
            regen_rate: 50, // 50 shield per second
            regen_delay: 5, // 5 seconds delay
          },
        },
        sources: {
          fitness_activities: ['defensive_training'],
        },
      },
    },
    {
      qi_type: QiType.CORPSE_QI,
      category: QiCategory.DEFENSIVE,
      name: 'Thi Khí',
      description:
        'Độc tố từ xác chết. Ai đánh vào mình sẽ bị nhiễm độc (Phản đòn hệ Độc).',
      effects: {
        active: {
          poison_reflect: {
            damage_per_second: 10, // 10 poison damage per second
            duration: 30, // 30 seconds
          },
        },
        sources: {
          locations: ['graveyard', 'battlefield'],
        },
      },
    },

    // ========== Nhóm Đặc Biệt & Ẩn (Rare) ==========
    {
      qi_type: QiType.RESENTMENT_QI,
      category: QiCategory.RARE,
      name: 'Oán Khí',
      description:
        'Khí oán hận khi bị giết. Cho phép Báo Thù nhưng giảm may mắn.',
      effects: {
        active: {
          revenge_mode: {
            damage_multiplier: 3, // 3x damage (200% bonus) against killer
            duration: 3600, // 1 hour
          },
        },
        sources: {
          quest_types: ['pvp_death', 'graveyard'],
          locations: ['graveyard'],
        },
        penalties: {
          luck_penalty: 20, // -20 luck (Phúc Duyên)
        },
      },
    },
    {
      qi_type: QiType.CHARM_QI,
      category: QiCategory.RARE,
      name: 'Mị Khí',
      description:
        'Khí quyến rũ từ tương tác xã hội. Tăng khả năng thu phục nhưng dễ bị ghen ghét.',
      effects: {
        active: {
          charm_effect: {
            npc_charm_chance: 30, // 30% chance to charm NPC
            pet_tame_chance: 25, // 25% chance to tame pet
            first_strike_avoid: 20, // 20% chance to avoid first strike
          },
        },
        sources: {
          quest_types: ['social', 'gift', 'fashion'],
        },
        penalties: {
          same_gender_attack_bonus: 15, // Same gender enemies attack 15% harder
        },
      },
    },
    {
      qi_type: QiType.GRANDMIST_PURPLE_QI,
      category: QiCategory.RARE,
      name: 'Hồng Mông Tử Khí',
      description:
        'Loại khí cao cấp nhất - Cực hiếm, chỉ xuất hiện 5:00-7:00 sáng. Có thể chuyển hóa thành bất kỳ khí nào.',
      effects: {
        active: {
          convert_to_any: true, // Can convert to any Qi type
          breakthrough_success_rate: 100, // 100% breakthrough success
          refine_success_rate: 100, // 100% refine success
        },
        sources: {
          time_of_day: ['5:00-7:00'], // Only 5-7 AM
          fitness_activities: ['early_wake'],
        },
      },
      // No penalties - pure benefit
    },
    {
      qi_type: QiType.DEATH_QI,
      category: QiCategory.RARE,
      name: 'Tử Khí',
      description:
        'Khí chết chóc, độc hại. Tích tụ khi ở gần cái chết hoặc vùng đất chết quá lâu.',
      effects: {
        // No benefits - only penalties
        penalties: {
          // Reduces all stats gradually
          cultivation_speed_penalty: 30, // -30% cultivation speed
          magic_resistance_penalty: 20, // -20% magic resistance
          physical_resistance_penalty: 20, // -20% physical resistance
          // Gradually reduces HP over time
          hp_drain_per_second: 0.5, // 0.5 HP per second
          // Reduces luck
          luck_penalty: 30, // -30 luck (Phúc Duyên)
        },
        sources: {
          locations: ['graveyard', 'battlefield', 'death_realm'],
          quest_types: ['near_death', 'death_realm'],
        },
      },
    },
  ];

  const saved: QiEffect[] = [];

  for (const effectData of effects) {
    const existing = await qiEffectRepo.findOne({
      where: { qi_type: effectData.qi_type },
    });

    if (!existing) {
      const effect = qiEffectRepo.create(effectData);
      saved.push(await qiEffectRepo.save(effect));
    } else {
      // Update existing
      Object.assign(existing, effectData);
      saved.push(await qiEffectRepo.save(existing));
    }
  }

  return saved;
}
