import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Skill, DamageFormula } from '../entities/skill.entity';
import { getDataSourceOptions } from '../config/database.config';
import { ElementType } from '../entities/character-element.entity';

/**
 * Seed skills data
 */
export async function seedSkills() {
  const dataSource = new DataSource(getDataSourceOptions());
  await dataSource.initialize();

  const skillRepository = dataSource.getRepository(Skill);

  const skills = [
    {
      code: 'hoa_van_chuong',
      name: 'Hỏa Vân Chưởng',
      description: 'Chưởng pháp hỏa thuộc tính, gây sát thương dựa trên lực đạo và các nguyên tố hỏa, thủy.',
      damage_formula: [
        { stat: 'luc_dao', multiplier: 100 },
        { element: ElementType.HOA, multiplier: 200 },
        { element: ElementType.THUY, multiplier: 150 },
      ] as DamageFormula[],
      cooldown: 5,
      mana_cost: 50,
      min_level: 1,
    },
    {
      code: 'kim_cang_quyen',
      name: 'Kim Cang Quyền',
      description: 'Quyền pháp kim thuộc tính, sát thương dựa trên căn cốt và nguyên tố kim.',
      damage_formula: [
        { stat: 'can_cot', multiplier: 120 },
        { element: ElementType.KIM, multiplier: 180 },
      ] as DamageFormula[],
      cooldown: 4,
      mana_cost: 40,
      min_level: 1,
    },
    {
      code: 'thuy_long_truyen',
      name: 'Thủy Long Truyền',
      description: 'Truyền pháp thủy thuộc tính, kết hợp thủy và băng để tạo sát thương.',
      damage_formula: [
        { stat: 'ngo_tinh', multiplier: 110 },
        { element: ElementType.THUY, multiplier: 200 },
        { element: ElementType.BANG, multiplier: 150 },
      ] as DamageFormula[],
      cooldown: 6,
      mana_cost: 60,
      min_level: 2,
    },
    {
      code: 'moc_than_tru',
      name: 'Mộc Thần Trù',
      description: 'Trù pháp mộc thuộc tính, hút máu và gây sát thương dựa trên mộc và thổ.',
      damage_formula: [
        { stat: 'dinh_luc', multiplier: 100 },
        { element: ElementType.MOC, multiplier: 190 },
        { element: ElementType.THO, multiplier: 140 },
      ] as DamageFormula[],
      cooldown: 8,
      mana_cost: 70,
      min_level: 3,
    },
    {
      code: 'loi_dien_thien',
      name: 'Lôi Điện Thiên',
      description: 'Kỹ năng lôi thuộc tính, sát thương cao dựa trên lôi và dương.',
      damage_formula: [
        { stat: 'than_phap', multiplier: 130 },
        { element: ElementType.LOI, multiplier: 250 },
        { element: ElementType.DUONG, multiplier: 120 },
      ] as DamageFormula[],
      cooldown: 10,
      mana_cost: 80,
      min_level: 5,
    },
    {
      code: 'am_quy_phap',
      name: 'Âm Quỷ Pháp',
      description: 'Pháp thuật âm thuộc tính, sát thương tối đa với âm và hỏa.',
      damage_formula: [
        { stat: 'ngo_tinh', multiplier: 150 },
        { element: ElementType.AM, multiplier: 300 },
        { element: ElementType.HOA, multiplier: 100 },
      ] as DamageFormula[],
      cooldown: 15,
      mana_cost: 100,
      min_level: 7,
    },
  ];

  console.log('🌱 Seeding skills...');

  for (const skillData of skills) {
    const existing = await skillRepository.findOne({
      where: { code: skillData.code },
    });

    if (existing) {
      console.log(`  ⏭️  Skill ${skillData.code} already exists, skipping`);
      continue;
    }

    const skill = skillRepository.create(skillData);
    await skillRepository.save(skill);
    console.log(`  ✅ Created skill: ${skillData.name} (${skillData.code})`);
  }

  console.log('✅ Skills seeding completed');
  await dataSource.destroy();
}

