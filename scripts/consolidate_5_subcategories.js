const db = require('../config/database');
const Category = require('../models/category');
const Product = require('../models/product');

const IOT_ROOT_ID = 'a65fd260-8438-4390-b1e6-30babd0c4e95';

// 5 Compact Groups:
const compactCategories = [
  {
    name: 'Development Boards & Modules',
    slug: 'development-boards-modules',
    description: 'Microcontrollers, Dev boards, RTC, SD storage, robotics boards & chassis'
  },
  {
    name: 'Sensors',
    slug: 'sensors',
    description: 'Temperature, humidity, environmental, gas, current, ultrasonic & optical sensors'
  },
  {
    name: 'Actuators, Drivers & Displays',
    slug: 'actuators-drivers-displays',
    description: 'Relays, SSR, motor drivers, servos, solenoid valves, OLED, LCD & LED strips'
  },
  {
    name: 'Wireless & Connectivity',
    slug: 'wireless-connectivity',
    description: 'GPS, GSM/GPRS, LoRa, RF, Wi-Fi & antenna modules'
  },
  {
    name: 'Power & Hardware Lab',
    slug: 'power-hardware-lab',
    description: 'Li-ion chargers, batteries, converters, adapters, breadboards, wiring, tools & enclosures'
  }
];

// Mapping previous categories to the new 5 groups:
const previousToCompactMap = {
  // 1. Boards & Modules
  'Microcontrollers': 'Development Boards & Modules',
  'Controller Boards': 'Development Boards & Modules',
  'Modules': 'Development Boards & Modules',
  'Robotics': 'Development Boards & Modules',

  // 2. Sensors
  'Sensors': 'Sensors',

  // 3. Actuators, Drivers & Displays
  'Actuator / Switching': 'Actuators, Drivers & Displays',
  'Actuators & Outputs': 'Actuators, Drivers & Displays',
  'Display': 'Actuators, Drivers & Displays',
  'Lighting': 'Actuators, Drivers & Displays',

  // 4. Wireless & Connectivity
  'Communication': 'Wireless & Connectivity',
  'Connectivity': 'Wireless & Connectivity',

  // 5. Power & Hardware Lab
  'Power': 'Power & Hardware Lab',
  'Accessories': 'Power & Hardware Lab',
  'Prototyping': 'Power & Hardware Lab',
  'Enclosure': 'Power & Hardware Lab',
  'Wiring': 'Power & Hardware Lab',
  'Tools': 'Power & Hardware Lab'
};

async function consolidateTo5Categories() {
  await db.authenticate();
  console.log('Connected to database.');

  // 1. Fetch all current subcategories of IoT
  const currentSubCats = await Category.findAll({
    where: { parentId: IOT_ROOT_ID }
  });
  console.log(`Current subcategories under IoT: ${currentSubCats.length}`);

  // 2. Ensure the 5 compact categories exist
  const newCatMap = {}; // name -> Category instance

  for (const group of compactCategories) {
    let existing = currentSubCats.find(c => 
      c.name.toLowerCase() === group.name.toLowerCase() || c.slug === group.slug
    );

    if (existing) {
      await existing.update({
        name: group.name,
        slug: group.slug,
        description: group.description,
        status: 'active'
      });
      newCatMap[group.name] = existing;
      console.log(`[Consolidated Target Ready]: "${group.name}" (ID: ${existing.id})`);
    } else {
      const created = await Category.create({
        name: group.name,
        slug: group.slug,
        description: group.description,
        status: 'active',
        parentId: IOT_ROOT_ID
      });
      newCatMap[group.name] = created;
      console.log(`[Consolidated Target Created]: "${group.name}" (ID: ${created.id})`);
    }
  }

  // 3. Re-map products from old subcategories to the 5 consolidated categories
  const targetIds = new Set(Object.values(newCatMap).map(c => c.id));
  const oldCatsToDelete = currentSubCats.filter(c => !targetIds.has(c.id));

  console.log(`\nRe-mapping products to 5 compact groups...`);

  for (const oldCat of oldCatsToDelete) {
    const targetGroupName = previousToCompactMap[oldCat.name] || 'Power & Hardware Lab';
    const targetCategory = newCatMap[targetGroupName];

    if (!targetCategory) continue;

    const [updatedCount] = await Product.update(
      { subCategoryId: targetCategory.id },
      { where: { subCategoryId: oldCat.id } }
    );

    console.log(`Re-mapped ${updatedCount} products from "${oldCat.name}" -> "${targetGroupName}"`);

    // Safe delete old category record
    await oldCat.destroy();
    console.log(`Removed redundant subcategory: "${oldCat.name}"`);
  }

  // Double check all products under IoT Component have one of the 5 subcategories
  const allSubCats = await Category.findAll({ where: { parentId: IOT_ROOT_ID } });
  console.log(`\nActive Subcategories under IoT Component (${allSubCats.length}):`);
  allSubCats.forEach(c => console.log(` - ${c.name} (${c.id})`));

  console.log('\n=== CONSOLIDATION FINISHED SUCCESSFULLY ===');
}

consolidateTo5Categories()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error during consolidation:', err);
    process.exit(1);
  });
