const { Category, Product, sequelize } = require('../models');

async function consolidate() {
  const transaction = await sequelize.transaction();
  try {
    const root = await Category.findOne({ where: { slug: 'iot-products' }, transaction });
    if (!root) throw new Error('Root IoT Products category not found');

    const targets = [
      { name: 'Smart Home & Automation', slug: 'smart-home-automation' },
      { name: 'Security & Monitoring', slug: 'security-monitoring' },
      { name: 'Development Boards', slug: 'development-boards-iot' },
      { name: 'Kits & Enclosures', slug: 'kits-enclosures' }
    ];

    const targetMap = {};
    for (const t of targets) {
      let [cat] = await Category.findOrCreate({
        where: { slug: t.slug },
        defaults: {
          name: t.name,
          slug: t.slug,
          parentId: root.id,
          level: 1,
          isActive: true
        },
        transaction
      });
      targetMap[t.name] = cat;
    }

    const mapping = {
      'iot-prod-smart-home': 'Smart Home & Automation',
      'iot-prod-lighting': 'Smart Home & Automation',
      'iot-prod-energy': 'Smart Home & Automation',
      'iot-prod-water': 'Smart Home & Automation',
      'iot-prod-security': 'Security & Monitoring',
      'iot-prod-air-quality': 'Security & Monitoring',
      'iot-prod-agri-garden': 'Security & Monitoring',
      'iot-prod-dev-boards': 'Development Boards',
      'iot-prod-bundles': 'Kits & Enclosures',
      'iot-prod-3d-printing': 'Kits & Enclosures'
    };

    const oldSubs = await Category.findAll({ where: { parentId: root.id }, transaction });

    for (const oldSub of oldSubs) {
      const targetName = mapping[oldSub.slug];
      if (targetName && targetMap[targetName] && oldSub.id !== targetMap[targetName].id) {
        const targetCategory = targetMap[targetName];
        const [updatedCount] = await Product.update(
          { subCategoryId: targetCategory.id },
          { where: { subCategoryId: oldSub.id }, transaction }
        );
        console.log(`Migrated ${updatedCount} products from ${oldSub.name} to ${targetCategory.name}`);
        await oldSub.destroy({ transaction });
        console.log(`Deleted old subcategory: ${oldSub.name}`);
      }
    }

    await transaction.commit();
    console.log('Successfully consolidated to Option 1 (4 subcategories)!');
  } catch (err) {
    await transaction.rollback();
    console.error('Error consolidating categories:', err);
  } finally {
    process.exit();
  }
}

consolidate();
