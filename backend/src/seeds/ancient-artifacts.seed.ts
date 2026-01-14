import { DataSource } from 'typeorm';
import { Item, ItemType, ItemRarity } from '../entities/item.entity';

/**
 * Seed Ancient Artifacts (Cổ Bảo)
 * Cổ bảo có effects (tác dụng) và penalties (tác hại)
 */
export async function seedAncientArtifacts(dataSource: DataSource): Promise<void> {
  const itemRepository = dataSource.getRepository(Item);

  const artifacts = [
    {
      name: 'Kiếm Tử Thần',
      description: 'Kiếm ma quỷ, tăng sức tấn công cực mạnh nhưng mỗi lần tấn công sẽ mất máu',
      item_type: ItemType.SPECIAL,
      category: 'ancient_artifact',
      rarity: ItemRarity.MYTHIC,
      grade: 10,
      max_stack: 1,
      sellable: false,
      sell_price: 0,
      usable: false,
      equipment_slot: undefined,
      equipment_stats: {
        strength: 100,
        agility: 50,
      },
      artifact_effects: {
        attack_bonus: 500,
        crit_chance: 20,
        crit_damage: 50,
      },
      artifact_penalties: {
        hp_loss_per_attack: 500,
        hp_drain_per_second: 10,
      },
      required_level: 50,
      required_realm_level: 31, // Nguyên Anh
      is_active: true,
    },
    {
      name: 'Áo Giáp Huyết Ma',
      description: 'Áo giáp được làm từ máu ma quỷ, tăng phòng thủ nhưng liên tục mất máu',
      item_type: ItemType.SPECIAL,
      category: 'ancient_artifact',
      rarity: ItemRarity.LEGENDARY,
      grade: 9,
      max_stack: 1,
      sellable: false,
      sell_price: 0,
      usable: false,
      equipment_slot: undefined,
      equipment_stats: {
        defense: 300,
        hp: 2000,
      },
      artifact_effects: {
        defense_bonus: 300,
        hp_bonus: 2000,
      },
      artifact_penalties: {
        hp_drain_per_second: 50,
        speed_reduction: 20,
      },
      required_level: 45,
      required_realm_level: 31,
      is_active: true,
    },
    {
      name: 'Nhẫn Linh Hồn',
      description: 'Nhẫn chứa linh hồn, tăng MP nhưng mất MP mỗi khi dùng skill',
      item_type: ItemType.SPECIAL,
      category: 'ancient_artifact',
      rarity: ItemRarity.EPIC,
      grade: 8,
      max_stack: 1,
      sellable: false,
      sell_price: 0,
      usable: false,
      equipment_slot: undefined,
      equipment_stats: {
        wisdom: 150,
      },
      artifact_effects: {
        mp_bonus: 1000,
        exp_bonus: 15,
      },
      artifact_penalties: {
        mp_loss_per_skill: 200,
        exp_reduction: 5,
      },
      required_level: 40,
      required_realm_level: 31,
      is_active: true,
    },
    {
      name: 'Vòng Tốc Độ',
      description: 'Vòng tăng tốc độ cực nhanh nhưng giảm phòng thủ',
      item_type: ItemType.SPECIAL,
      category: 'ancient_artifact',
      rarity: ItemRarity.RARE,
      grade: 7,
      max_stack: 1,
      sellable: false,
      sell_price: 0,
      usable: false,
      equipment_slot: undefined,
      equipment_stats: {
        agility: 200,
      },
      artifact_effects: {
        speed_bonus: 100,
        dodge_chance: 15,
      },
      artifact_penalties: {
        defense_reduction: 100,
        hp_loss_per_attack: 100,
      },
      required_level: 35,
      required_realm_level: 31,
      is_active: true,
    },
    {
      name: 'Ngọc Bội Sinh Mệnh',
      description: 'Ngọc bội tăng HP tối đa nhưng mất HP liên tục',
      item_type: ItemType.SPECIAL,
      category: 'ancient_artifact',
      rarity: ItemRarity.LEGENDARY,
      grade: 9,
      max_stack: 1,
      sellable: false,
      sell_price: 0,
      usable: false,
      equipment_slot: undefined,
      equipment_stats: {
        hp: 5000,
      },
      artifact_effects: {
        hp_bonus: 5000,
        defense_bonus: 100,
      },
      artifact_penalties: {
        hp_drain_per_second: 100,
        mp_drain_per_second: 20,
      },
      required_level: 50,
      required_realm_level: 35,
      is_active: true,
    },
    {
      name: 'Mặt Nạ Tà Ác',
      description: 'Mặt nạ tăng sát thương bạo kích nhưng giảm chỉ số cơ bản',
      item_type: ItemType.SPECIAL,
      category: 'ancient_artifact',
      rarity: ItemRarity.EPIC,
      grade: 8,
      max_stack: 1,
      sellable: false,
      sell_price: 0,
      usable: false,
      equipment_slot: undefined,
      equipment_stats: {},
      artifact_effects: {
        crit_chance: 30,
        crit_damage: 100,
        attack_bonus: 300,
      },
      artifact_penalties: {
        stat_reduction: {
          strength: 50,
          agility: 50,
          wisdom: 50,
        },
        defense_reduction: 150,
      },
      required_level: 45,
      required_realm_level: 33,
      is_active: true,
    },
    {
      name: 'Bùa Hộ Mệnh',
      description: 'Bùa tăng tỷ lệ rơi đồ nhưng giảm EXP gain',
      item_type: ItemType.SPECIAL,
      category: 'ancient_artifact',
      rarity: ItemRarity.RARE,
      grade: 6,
      max_stack: 1,
      sellable: false,
      sell_price: 0,
      usable: false,
      equipment_slot: undefined,
      equipment_stats: {},
      artifact_effects: {
        drop_rate_bonus: 50,
        exp_bonus: 10,
      },
      artifact_penalties: {
        exp_reduction: 20,
        hp_drain_per_second: 5,
      },
      required_level: 30,
      required_realm_level: 31,
      is_active: true,
    },
    {
      name: 'Huyết Ngọc',
      description: 'Ngọc huyết tăng tất cả chỉ số nhưng mất máu rất nhanh',
      item_type: ItemType.SPECIAL,
      category: 'ancient_artifact',
      rarity: ItemRarity.MYTHIC,
      grade: 10,
      max_stack: 1,
      sellable: false,
      sell_price: 0,
      usable: false,
      equipment_slot: undefined,
      equipment_stats: {
        strength: 200,
        agility: 200,
        wisdom: 200,
        hp: 3000,
        defense: 200,
      },
      artifact_effects: {
        attack_bonus: 800,
        defense_bonus: 400,
        hp_bonus: 3000,
        mp_bonus: 1500,
        crit_chance: 25,
        speed_bonus: 150,
      },
      artifact_penalties: {
        hp_drain_per_second: 200,
        mp_drain_per_second: 50,
        hp_loss_per_attack: 1000,
      },
      required_level: 60,
      required_realm_level: 40,
      is_active: true,
    },
  ];

  for (const artifactData of artifacts) {
    const existing = await itemRepository.findOne({
      where: { name: artifactData.name },
    });

    if (!existing) {
      const artifact = itemRepository.create(artifactData);
      await itemRepository.save(artifact);
      console.log(`✅ Created Ancient Artifact: ${artifactData.name}`);
    } else {
      console.log(`⏭️  Ancient Artifact already exists: ${artifactData.name}`);
    }
  }

  console.log(`✅ Seeded ${artifacts.length} Ancient Artifacts`);
}

