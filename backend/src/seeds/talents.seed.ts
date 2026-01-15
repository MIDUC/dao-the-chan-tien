import { DataSource } from 'typeorm';
import { Talent, TalentGrade, TalentEffectType } from '../entities/talent.entity';
import { getDataSourceOptions } from '../config/database.config';

/**
 * Seed talents data
 */
export async function seedTalents() {
  const dataSource = new DataSource(getDataSourceOptions());
  await dataSource.initialize();

  const talentRepository = dataSource.getRepository(Talent);

  const talents = [
    // Starter Talents (3 thiên phú khởi đầu)
    {
      code: 'tien_cot',
      name: 'Tiên Cốt',
      description:
        'Thiên phú đặc biệt với căn cốt tiên nhân. Mỗi khi lên cấp, căn cốt được tăng thêm 150% so với bình thường.',
      grade: TalentGrade.RARE,
      is_starter: true,
      effects: [
        {
          type: TalentEffectType.STAT_BOOST,
          target: 'can_cot',
          value: 150, // 150% bonus
          description: 'Tăng 150% căn cốt khi lên cấp',
        },
      ],
    },
    {
      code: 'kim_o_the',
      name: 'Kim Ô Thể',
      description:
        'Thể chất đặc biệt phù hợp với hỏa thuộc tính. Tăng 150% sát thương hỏa, nhận dương khí khi lên cấp và mỗi ngày.',
      grade: TalentGrade.EPIC,
      is_starter: true,
      effects: [
        {
          type: TalentEffectType.DAMAGE_BOOST,
          target: 'hoa',
          value: 150, // 150% fire damage boost
          description: 'Tăng 150% sát thương hỏa',
        },
        {
          type: TalentEffectType.RESOURCE_GAIN,
          target: 'duong_khi',
          value: 10, // Fixed amount
          description: 'Nhận dương khí khi lên cấp',
        },
        {
          type: TalentEffectType.DAILY_BONUS,
          target: 'duong_khi',
          value: 5, // Daily bonus
          description: 'Nhận 5 dương khí mỗi ngày',
        },
      ],
    },
    {
      code: 'thien_van',
      name: 'Thiên Vận',
      description:
        'Vận may trời ban, tăng phúc duyên và may mắn trong các sự kiện ngẫu nhiên.',
      grade: TalentGrade.UNCOMMON,
      is_starter: true,
      effects: [
        {
          type: TalentEffectType.STAT_BOOST,
          target: 'phuc_duyen',
          value: 20, // +20 luck
          description: 'Tăng 20 phúc duyên',
        },
        {
          type: TalentEffectType.EXP_BOOST,
          target: 'all',
          value: 10, // 10% exp boost
          description: 'Tăng 10% EXP nhận được',
        },
      ],
    },
    // Additional Talents (có thể nhận từ quest, đan dược...)
    {
      code: 'linh_can_thien_pham',
      name: 'Linh Căn Thiên Phẩm',
      description:
        'Linh căn đạt đến phẩm cấp thiên, tăng tốc độ tu luyện và hiệu quả hấp thụ linh khí.',
      grade: TalentGrade.LEGENDARY,
      is_starter: false,
      effects: [
        {
          type: TalentEffectType.CULTIVATION_BOOST,
          target: 'exp_gain',
          value: 50, // 50% cultivation speed
          description: 'Tăng 50% tốc độ tu luyện',
        },
        {
          type: TalentEffectType.EXP_BOOST,
          target: 'all',
          value: 25, // 25% exp boost
          description: 'Tăng 25% EXP nhận được',
        },
      ],
    },
    {
      code: 'thanh_long_huyet',
      name: 'Thanh Long Huyết',
      description:
        'Mang trong người dòng máu Thanh Long, tăng sức mạnh thể chất và khả năng phục hồi.',
      grade: TalentGrade.MYTHIC,
      is_starter: false,
      effects: [
        {
          type: TalentEffectType.STAT_BOOST,
          target: 'luc_dao',
          value: 100, // 100% bonus
          description: 'Tăng 100% lực đạo',
        },
        {
          type: TalentEffectType.STAT_BOOST,
          target: 'can_cot',
          value: 100, // 100% bonus
          description: 'Tăng 100% căn cốt',
        },
        {
          type: TalentEffectType.RESOURCE_GAIN,
          target: 'hoi_phuc',
          value: 20, // Recovery bonus
          description: 'Tăng 20% tốc độ hồi phục',
        },
      ],
    },
    {
      code: 'dao_tam_vo_ngai',
      name: 'Đạo Tâm Vô Ngại',
      description:
        'Tâm cảnh vững vàng, không bị ảnh hưởng bởi tà niệm, tăng định lực và ổn định tu luyện.',
      grade: TalentGrade.RARE,
      is_starter: false,
      effects: [
        {
          type: TalentEffectType.STAT_BOOST,
          target: 'dinh_luc',
          value: 50, // +50 willpower
          description: 'Tăng 50 định lực',
        },
        {
          type: TalentEffectType.STAT_BOOST,
          target: 'tam_canh',
          value: 30, // +30 state of mind
          description: 'Tăng 30 tâm cảnh',
        },
        {
          type: TalentEffectType.CULTIVATION_BOOST,
          target: 'stability',
          value: 30, // 30% stability
          description: 'Tăng 30% ổn định tu luyện',
        },
      ],
    },
  ];

  console.log('🌱 Seeding talents...');

  for (const talentData of talents) {
    const existing = await talentRepository.findOne({
      where: { code: talentData.code },
    });

    if (existing) {
      console.log(`  ⏭️  Talent ${talentData.code} already exists, skipping`);
      continue;
    }

    const talent = talentRepository.create(talentData);
    await talentRepository.save(talent);
    console.log(`  ✅ Created talent: ${talentData.name} (${talentData.code})`);
  }

  console.log('✅ Talents seeding completed');
  await dataSource.destroy();
}

