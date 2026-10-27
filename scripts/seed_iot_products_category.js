const db = require('../config/database');
const Category = require('../models/category');
const Product = require('../models/product');

// 25 Trending IoT Products from User Table:
const iotTrendingData = [
  {
    subCat: 'Smart Home',
    name: 'Wi-Fi smart switch module 10A (2-way, Tuya/Smart Life)',
    whyTrending: 'Retrofit behind existing switchboards; works with Alexa/Google; cheapest entry to home automation',
    targetBuyer: 'Homeowners, electricians',
    buyCost: 260,
    marketPrice: 549,
    price: 519,
    netGst: 440,
    grossMargin: 180,
    marginPct: '40.9%',
    demand: 'High',
    priority: 'P1',
    tip: 'Buy Tuya-certified; list with wiring diagram images'
  },
  {
    subCat: 'Smart Home',
    name: 'Smart plug 16A with energy monitoring',
    whyTrending: 'AC/geyser scheduling + power bills; high search volume in summer',
    targetBuyer: 'Homeowners, renters',
    buyCost: 520,
    marketPrice: 999,
    price: 939,
    netGst: 796,
    grossMargin: 276,
    marginPct: '34.7%',
    demand: 'High',
    priority: 'P1',
    tip: 'Must be 16A rated for AC/geyser; show BIS info if available'
  },
  {
    subCat: 'Smart Home',
    name: 'Wi-Fi universal IR blaster',
    whyTrending: 'Makes old AC/TV/set-top box smart for <₹1k',
    targetBuyer: 'Homeowners',
    buyCost: 380,
    marketPrice: 799,
    price: 749,
    netGst: 635,
    grossMargin: 255,
    marginPct: '40.1%',
    demand: 'High',
    priority: 'P1',
    tip: 'Bundle with smart plug'
  },
  {
    subCat: 'Smart Home',
    name: 'Wi-Fi 4-gang glass touch switch panel (modular)',
    whyTrending: 'Premium flats/new construction choose touch panels',
    targetBuyer: 'Builders, interior designers',
    buyCost: 1500,
    marketPrice: 2799,
    price: 2649,
    netGst: 2245,
    grossMargin: 745,
    marginPct: '33.2%',
    demand: 'Medium',
    priority: 'P2',
    tip: 'Offer in 2/4/6/8 module sizes; B2B pricing for builders'
  },
  {
    subCat: 'Smart Home',
    name: 'Zigbee 3.0 gateway hub (Tuya)',
    whyTrending: 'Required for battery sensors; grows basket size',
    targetBuyer: 'Smart-home DIYers',
    buyCost: 850,
    marketPrice: 1599,
    price: 1509,
    netGst: 1279,
    grossMargin: 429,
    marginPct: '33.5%',
    demand: 'Medium',
    priority: 'P1',
    tip: "List as 'starter kit' with 3 sensors"
  },
  {
    subCat: 'Smart Home',
    name: 'Zigbee door/window contact sensor',
    whyTrending: 'Security + automation triggers; low price, high attach rate',
    targetBuyer: 'Homeowners, shops',
    buyCost: 300,
    marketPrice: 599,
    price: 559,
    netGst: 474,
    grossMargin: 174,
    marginPct: '36.7%',
    demand: 'High',
    priority: 'P1',
    tip: 'Sell in 2-packs'
  },
  {
    subCat: 'Smart Home',
    name: 'Zigbee PIR motion sensor',
    whyTrending: 'Auto lights, intrusion alerts',
    targetBuyer: 'Homeowners, offices',
    buyCost: 420,
    marketPrice: 799,
    price: 749,
    netGst: 635,
    grossMargin: 215,
    marginPct: '33.8%',
    demand: 'Medium',
    priority: 'P2',
    tip: 'Auto lighting automation setups'
  },
  {
    subCat: 'Smart Home',
    name: 'Zigbee temperature & humidity sensor with LCD',
    whyTrending: 'AC automation, baby rooms, server rooms',
    targetBuyer: 'Homeowners, IT rooms',
    buyCost: 380,
    marketPrice: 699,
    price: 659,
    netGst: 558,
    grossMargin: 178,
    marginPct: '32.0%',
    demand: 'Medium',
    priority: 'P2',
    tip: 'Works with smart AC blasters'
  },
  {
    subCat: 'Smart Home',
    name: 'Wi-Fi water leak sensor with buzzer',
    whyTrending: 'Bathrooms/RO/kitchen leak alerts',
    targetBuyer: 'Apartments',
    buyCost: 360,
    marketPrice: 699,
    price: 659,
    netGst: 558,
    grossMargin: 198,
    marginPct: '35.5%',
    demand: 'Medium',
    priority: 'P3',
    tip: 'Independent audio alarm + push alert'
  },
  {
    subCat: 'Lighting',
    name: 'Wi-Fi RGB+CCT smart LED bulb 9W B22',
    whyTrending: 'Lowest ticket smart product; festive demand (Diwali)',
    targetBuyer: 'Everyone',
    buyCost: 210,
    marketPrice: 449,
    price: 419,
    netGst: 355,
    grossMargin: 145,
    marginPct: '40.9%',
    demand: 'High',
    priority: 'P1',
    tip: 'India uses B22 — make sure base is B22'
  },
  {
    subCat: 'Lighting',
    name: 'Wi-Fi RGB LED strip kit 5m with adapter',
    whyTrending: 'Room/gaming setups; festive decor',
    targetBuyer: 'Students, gamers',
    buyCost: 600,
    marketPrice: 1199,
    price: 1129,
    netGst: 957,
    grossMargin: 357,
    marginPct: '37.3%',
    demand: 'High',
    priority: 'P1',
    tip: 'Show reels/videos in listing'
  },
  {
    subCat: 'Security',
    name: '3MP Wi-Fi pan-tilt indoor camera',
    whyTrending: 'Home/shop monitoring, huge category',
    targetBuyer: 'Homeowners, shop owners',
    buyCost: 1250,
    marketPrice: 2199,
    price: 2079,
    netGst: 1762,
    grossMargin: 512,
    marginPct: '29.1%',
    demand: 'High',
    priority: 'P2',
    tip: 'Competitive category — compete on bundle + local support'
  },
  {
    subCat: 'Security',
    name: '4G GPS vehicle tracker (wired, with app)',
    whyTrending: 'Fleet, two-wheelers, rental vehicles',
    targetBuyer: 'Fleet owners, parents',
    buyCost: 1150,
    marketPrice: 2199,
    price: 2079,
    netGst: 1762,
    grossMargin: 612,
    marginPct: '34.7%',
    demand: 'High',
    priority: 'P2',
    tip: 'Check AIS 140 rules if selling to commercial fleets'
  },
  {
    subCat: 'Energy',
    name: 'Wi-Fi DIN-rail smart energy meter (1-phase, 63A)',
    whyTrending: 'Rising power tariffs; solar users track consumption',
    targetBuyer: 'Homes with solar, PG/hostel owners',
    buyCost: 1350,
    marketPrice: 2499,
    price: 2369,
    netGst: 2008,
    grossMargin: 658,
    marginPct: '32.8%',
    demand: 'Medium',
    priority: 'P2',
    tip: "Installation by electrician; add 'install service' upsell"
  },
  {
    subCat: 'Water',
    name: 'Wi-Fi water tank level controller (auto motor on/off)',
    whyTrending: 'Very common Indian pain point — overflow & dry run',
    targetBuyer: 'Independent houses, apartments',
    buyCost: 1300,
    marketPrice: 2499,
    price: 2369,
    netGst: 2008,
    grossMargin: 708,
    marginPct: '35.2%',
    demand: 'High',
    priority: 'P1',
    tip: 'Strong fit for MP/Karnataka markets; offer Hindi manual'
  },
  {
    subCat: 'Agri / Garden',
    name: 'Wi-Fi 4-zone drip irrigation controller',
    whyTrending: 'Terrace gardens, polyhouses, farms',
    targetBuyer: 'Gardeners, farmers',
    buyCost: 1800,
    marketPrice: 3299,
    price: 3129,
    netGst: 2652,
    grossMargin: 852,
    marginPct: '32.1%',
    demand: 'Medium',
    priority: 'P3',
    tip: 'Pairs with solenoid valves from Components sheet'
  },
  {
    subCat: 'Air Quality',
    name: 'PM2.5 / AQI monitor with display (Wi-Fi)',
    whyTrending: 'Winter pollution in North India drives seasonal spikes (Oct–Jan)',
    targetBuyer: 'Families in Delhi NCR, offices',
    buyCost: 1700,
    marketPrice: 2999,
    price: 2839,
    netGst: 2406,
    grossMargin: 706,
    marginPct: '29.3%',
    demand: 'High',
    priority: 'P1',
    tip: 'Launch now for winter season; can be NIVASHOP own-brand'
  },
  {
    subCat: 'Dev Boards',
    name: 'Raspberry Pi 5 — 8GB',
    whyTrending: 'Edge AI, home servers, BizBox-style builds',
    targetBuyer: 'Developers, colleges, startups',
    buyCost: 7000,
    marketPrice: 8000,
    price: 7599,
    netGst: 6440,
    grossMargin: 560,
    marginPct: '8.7%',
    demand: 'High',
    priority: 'P1',
    tip: 'Thin margin at market price — list as traffic driver'
  },
  {
    subCat: 'Dev Boards',
    name: 'Raspberry Pi 5 — 4GB',
    whyTrending: 'Most popular Pi 5 variant for students',
    targetBuyer: 'Students, makers',
    buyCost: 5300,
    marketPrice: 6200,
    price: 5889,
    netGst: 4991,
    grossMargin: 309,
    marginPct: '6.2%',
    demand: 'High',
    priority: 'P1',
    tip: 'Push starter bundle instead'
  },
  {
    subCat: 'Dev Boards',
    name: 'Raspberry Pi 5 — 16GB',
    whyTrending: 'Local LLMs / AI at the edge',
    targetBuyer: 'AI developers',
    buyCost: 11500,
    marketPrice: 13499,
    price: 12819,
    netGst: 10864,
    grossMargin: 636,
    marginPct: '5.9%',
    demand: 'Medium',
    priority: 'P2',
    tip: 'AI / edge workstation choice'
  },
  {
    subCat: 'Bundles',
    name: 'Raspberry Pi 5 starter bundle (8GB + 27W PSU + active cooler + case + 64GB card)',
    whyTrending: 'Higher margin than bare board; one-click purchase',
    targetBuyer: 'Students, beginners',
    buyCost: 9200,
    marketPrice: 11499,
    price: 10919,
    netGst: 9253,
    grossMargin: 1719,
    marginPct: '18.6%',
    demand: 'High',
    priority: 'P1',
    tip: 'Market retail = sum of parts; your bundle undercuts buying separately'
  },
  {
    subCat: 'Dev Boards',
    name: 'Raspberry Pi Pico 2 W',
    whyTrending: 'Cheap Wi-Fi MCU, MicroPython classes',
    targetBuyer: 'Students, colleges',
    buyCost: 620,
    marketPrice: 849,
    price: 799,
    netGst: 677,
    grossMargin: 57,
    marginPct: '8.4%',
    demand: 'Medium',
    priority: 'P2',
    tip: 'Low-cost edge IoT educational board'
  },
  {
    subCat: 'Dev Boards',
    name: 'ESP32-S3 DevKitC-1 (N16R8)',
    whyTrending: 'AI-voice, camera and display projects',
    targetBuyer: 'Makers, IoT startups',
    buyCost: 620,
    marketPrice: 899,
    price: 849,
    netGst: 719,
    grossMargin: 99,
    marginPct: '13.8%',
    demand: 'High',
    priority: 'P1',
    tip: 'Versatile AI + Wi-Fi board'
  },
  {
    subCat: 'Dev Boards',
    name: 'ESP32-C6 DevKit (Wi-Fi 6 + Zigbee/Thread/Matter)',
    whyTrending: 'Matter/Thread is the new smart-home standard',
    targetBuyer: 'IoT developers',
    buyCost: 650,
    marketPrice: 999,
    price: 939,
    netGst: 796,
    grossMargin: 146,
    marginPct: '18.3%',
    demand: 'Rising',
    priority: 'P2',
    tip: 'Early mover advantage on Matter products'
  },
  {
    subCat: '3D Printing',
    name: '3D-printed IoT enclosures (ESP32/Pi cases)',
    whyTrending: 'Uses your own 3D printing capability; zero competition on custom',
    targetBuyer: 'Makers, B2B',
    buyCost: 120,
    marketPrice: 299,
    price: 279,
    netGst: 236,
    grossMargin: 116,
    marginPct: '49.2%',
    demand: 'Medium',
    priority: 'P2',
    tip: 'Cross-sell with every dev board; cost = filament + print time'
  }
];

function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function generateSKU(subCatName, productName) {
  const prefix = 'IOT';
  const catCode = (subCatName.slice(0, 3)).toUpperCase();
  const prodCode = (productName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6)).toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-PRD-${catCode}-${prodCode}-${rand}`;
}

async function setupIoTProductsCategory() {
  await db.authenticate();
  console.log('Connected to database.');

  // 1. Create or Find root "IoT Products" category
  let iotProductsRoot = await Category.findOne({
    where: { name: 'IoT Products', parentId: null }
  });

  if (!iotProductsRoot) {
    iotProductsRoot = await Category.create({
      name: 'IoT Products',
      slug: 'iot-products',
      description: 'Trending ready-to-use smart home, security, lighting, and IoT devices',
      status: 'active',
      parentId: null
    });
    console.log(`[Created Root Category]: "IoT Products" (ID: ${iotProductsRoot.id})`);
  } else {
    console.log(`[Found Root Category]: "IoT Products" (ID: ${iotProductsRoot.id})`);
  }

  // 2. Extract and create subcategories under "IoT Products"
  const distinctSubCats = [...new Set(iotTrendingData.map(d => d.subCat))];
  const subCatMap = {};

  for (const subName of distinctSubCats) {
    const slug = generateSlug(subName);
    let subCat = await Category.findOne({
      where: { name: subName, parentId: iotProductsRoot.id }
    });

    if (!subCat) {
      subCat = await Category.create({
        name: subName,
        slug: `iot-prod-${slug}`,
        description: `${subName} devices and accessories under IoT Products`,
        status: 'active',
        parentId: iotProductsRoot.id
      });
      console.log(`[Created Subcategory]: "${subName}" (ID: ${subCat.id})`);
    } else {
      console.log(`[Found Subcategory]: "${subName}" (ID: ${subCat.id})`);
    }
    subCatMap[subName] = subCat.id;
  }

  // 3. Create or update products under "IoT Products"
  const existingProducts = await Product.findAll({
    where: { categoryId: iotProductsRoot.id }
  });

  let createdCount = 0;
  let updatedCount = 0;

  for (const item of iotTrendingData) {
    const targetSubCatId = subCatMap[item.subCat];
    const cleanName = item.name.toLowerCase().trim();

    const match = existingProducts.find(p => p.name.toLowerCase().trim() === cleanName);

    if (match) {
      await match.update({
        subCategoryId: targetSubCatId,
        price: item.marketPrice.toString(),
        discountPrice: item.price.toString(),
        description: `${item.name} — ${item.whyTrending}. Target Buyer: ${item.targetBuyer}.`,
        keyFeatures: [
          item.whyTrending,
          `Target Buyer: ${item.targetBuyer}`,
          `Sourcing Tip: ${item.tip}`
        ],
        specifications: {
          'Why Trending': item.whyTrending,
          'Target Buyer': item.targetBuyer,
          'Est. Buy Cost (ex-GST)': `₹${item.buyCost}`,
          'Market Retail (incl. GST)': `₹${item.marketPrice}`,
          'NIVASHOP Price': `₹${item.price}`,
          'Net of GST': `₹${item.netGst}`,
          'Gross Margin': `₹${item.grossMargin} (${item.marginPct})`,
          'Demand': item.demand,
          'Priority': item.priority,
          'Sourcing / Listing Tip': item.tip
        }
      });
      updatedCount++;
      console.log(`[Updated Product]: "${item.name}"`);
    } else {
      const sku = generateSKU(item.subCat, item.name);
      const slug = `${generateSlug(item.name)}-${Math.floor(1000 + Math.random() * 9000)}`;

      await Product.create({
        categoryId: iotProductsRoot.id,
        subCategoryId: targetSubCatId,
        name: item.name,
        slug: slug,
        sku: sku,
        description: `${item.name} — ${item.whyTrending}. Target Buyer: ${item.targetBuyer}.`,
        price: item.marketPrice.toString(),
        discountPrice: item.price.toString(),
        stock: 50,
        status: 'active',
        isNewArrival: true,
        materialVariants: [],
        colorOptions: [],
        sizeVariants: [],
        careInstructions: [
          'Store in a cool dry place.',
          'Follow wiring instructions carefully.',
          'Operate within rated electrical limits.'
        ],
        keyFeatures: [
          item.whyTrending,
          `Target Buyer: ${item.targetBuyer}`,
          `Sourcing Tip: ${item.tip}`
        ],
        specifications: {
          'Why Trending': item.whyTrending,
          'Target Buyer': item.targetBuyer,
          'Est. Buy Cost (ex-GST)': `₹${item.buyCost}`,
          'Market Retail (incl. GST)': `₹${item.marketPrice}`,
          'NIVASHOP Price': `₹${item.price}`,
          'Net of GST': `₹${item.netGst}`,
          'Gross Margin': `₹${item.grossMargin} (${item.marginPct})`,
          'Demand': item.demand,
          'Priority': item.priority,
          'Sourcing / Listing Tip': item.tip
        },
        sortOrder: 0,
        averageRating: '4.9',
        reviewCount: 0
      });
      createdCount++;
      console.log(`[Created Product]: "${item.name}" (SKU: ${sku})`);
    }
  }

  console.log(`\n=== SETUP FINISHED ===`);
  console.log(`IoT Products Root ID: ${iotProductsRoot.id}`);
  console.log(`Subcategories created/found: ${distinctSubCats.length}`);
  console.log(`Created Products: ${createdCount}`);
  console.log(`Updated Products: ${updatedCount}`);
}

setupIoTProductsCategory()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Failed to setup IoT Products category:', err);
    process.exit(1);
  });
