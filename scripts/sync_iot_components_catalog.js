const db = require('../config/database');
const Category = require('../models/category');
const Product = require('../models/product');

const IOT_ROOT_ID = 'a65fd260-8438-4390-b1e6-30babd0c4e95';

const subcategoriesData = [
  { name: 'Microcontrollers', slug: 'microcontrollers', description: 'Development boards, ESP32, Arduino, Raspberry Pi Pico' },
  { name: 'Sensors', slug: 'sensors', description: 'Temperature, humidity, gas, motion, current, environmental sensors' },
  { name: 'Communication', slug: 'communication', description: 'GPS, GSM, LoRa, RF, wireless communication modules' },
  { name: 'Actuator / Switching', slug: 'actuator-switching', description: 'Relays, SSR, motor drivers, servos, pumps, solenoid valves' },
  { name: 'Display', slug: 'display', description: 'OLED, LCD displays, graphical interfaces' },
  { name: 'Lighting', slug: 'lighting', description: 'Addressable RGB LED strips and lighting modules' },
  { name: 'Modules', slug: 'modules', description: 'RTC, MicroSD, and auxiliary system modules' },
  { name: 'Power', slug: 'power', description: 'Li-ion chargers, batteries, converters, power supplies, adapters' },
  { name: 'Accessories', slug: 'accessories', description: 'Coolers, HATs, storage accessories' },
  { name: 'Prototyping', slug: 'prototyping', description: 'Breadboards, jumper wires, passive kits, perfboards' },
  { name: 'Enclosure', slug: 'enclosure', description: 'Waterproof IP65 junction boxes and project enclosures' },
  { name: 'Wiring', slug: 'wiring', description: 'Tubing, cables, USB and wiring harnesses' },
  { name: 'Tools', slug: 'tools', description: 'Soldering irons, digital multimeters, workshop tools' },
  { name: 'Robotics', slug: 'robotics', description: 'Robot car chassis, motors, robotic hardware' }
];

const productsData = [
  // 1. Microcontrollers
  {
    subCat: 'Microcontrollers',
    name: 'ESP32 DevKit V1 (30-pin)',
    keySpec: 'Wi-Fi + Bluetooth, 4MB flash',
    typicalUse: 'General IoT',
    buyCost: 280,
    marketPrice: 399,
    price: 369,
    margin: '₹33 (10.5%)',
    moq: 10
  },
  {
    subCat: 'Microcontrollers',
    name: 'ESP32-S3 DevKitC N16R8',
    keySpec: '16MB flash, 8MB PSRAM',
    typicalUse: 'AI voice, displays',
    buyCost: 620,
    marketPrice: 899,
    price: 849,
    margin: '₹99 (13.8%)',
    moq: 5
  },
  {
    subCat: 'Microcontrollers',
    name: 'ESP32-C3 Super Mini',
    keySpec: 'RISC-V, compact',
    typicalUse: 'Wearables, sensors',
    buyCost: 150,
    marketPrice: 249,
    price: 229,
    margin: '₹44 (22.7%)',
    moq: 10
  },
  {
    subCat: 'Microcontrollers',
    name: 'ESP32-CAM + MB programmer',
    keySpec: 'OV2640, 2MP camera',
    typicalUse: 'Security cameras',
    buyCost: 420,
    marketPrice: 649,
    price: 609,
    margin: '₹96 (18.6%)',
    moq: 5
  },
  {
    subCat: 'Microcontrollers',
    name: 'NodeMCU ESP8266 (CP2102)',
    keySpec: 'Wi-Fi',
    typicalUse: 'Low-cost IoT',
    buyCost: 180,
    marketPrice: 279,
    price: 259,
    margin: '₹39 (18.0%)',
    moq: 10
  },
  {
    subCat: 'Microcontrollers',
    name: 'Arduino Uno R3 compatible (CH340)',
    keySpec: 'ATmega328P',
    typicalUse: 'Learning, labs',
    buyCost: 320,
    marketPrice: 499,
    price: 469,
    margin: '₹77 (19.5%)',
    moq: 10
  },
  {
    subCat: 'Microcontrollers',
    name: 'Raspberry Pi Pico W',
    keySpec: 'RP2040 + Wi-Fi',
    typicalUse: 'MicroPython',
    buyCost: 500,
    marketPrice: 699,
    price: 659,
    margin: '₹58 (10.5%)',
    moq: 5
  },

  // 2. Sensors
  {
    subCat: 'Sensors',
    name: 'DHT22 temperature & humidity',
    keySpec: '±0.5°C',
    typicalUse: 'Weather, HVAC',
    buyCost: 220,
    marketPrice: 349,
    price: 329,
    margin: '₹59 (21.1%)',
    moq: 10
  },
  {
    subCat: 'Sensors',
    name: 'DHT11 temperature & humidity',
    keySpec: 'Basic',
    typicalUse: 'Education',
    buyCost: 65,
    marketPrice: 119,
    price: 109,
    margin: '₹27 (29.6%)',
    moq: 20
  },
  {
    subCat: 'Sensors',
    name: 'BME280 temp/humidity/pressure (I2C)',
    keySpec: 'High accuracy',
    typicalUse: 'Weather stations',
    buyCost: 250,
    marketPrice: 399,
    price: 369,
    margin: '₹63 (20.1%)',
    moq: 10
  },
  {
    subCat: 'Sensors',
    name: 'HC-SR501 PIR motion sensor',
    keySpec: 'Up to 7 m',
    typicalUse: 'Security, lighting',
    buyCost: 55,
    marketPrice: 99,
    price: 89,
    margin: '₹20 (27.1%)',
    moq: 20
  },
  {
    subCat: 'Sensors',
    name: 'HC-SR04 ultrasonic distance',
    keySpec: '2–400 cm',
    typicalUse: 'Tank level, robots',
    buyCost: 55,
    marketPrice: 99,
    price: 89,
    margin: '₹20 (27.1%)',
    moq: 20
  },
  {
    subCat: 'Sensors',
    name: 'Capacitive soil moisture sensor v1.2',
    keySpec: 'Corrosion resistant',
    typicalUse: 'Irrigation',
    buyCost: 65,
    marketPrice: 119,
    price: 109,
    margin: '₹27 (29.6%)',
    moq: 20
  },
  {
    subCat: 'Sensors',
    name: 'MQ-2 gas/smoke sensor',
    keySpec: 'LPG, smoke',
    typicalUse: 'Kitchen safety',
    buyCost: 75,
    marketPrice: 129,
    price: 119,
    margin: '₹26 (25.6%)',
    moq: 20
  },
  {
    subCat: 'Sensors',
    name: 'MQ-135 air quality sensor',
    keySpec: 'NH3, CO₂-equivalent',
    typicalUse: 'Air quality',
    buyCost: 100,
    marketPrice: 169,
    price: 159,
    margin: '₹35 (25.8%)',
    moq: 20
  },
  {
    subCat: 'Sensors',
    name: 'PMS5003 PM2.5 laser dust sensor',
    keySpec: 'Plantower',
    typicalUse: 'AQI monitors',
    buyCost: 1300,
    marketPrice: 1799,
    price: 1699,
    margin: '₹140 (9.7%)',
    moq: 5
  },
  {
    subCat: 'Sensors',
    name: 'DS18B20 waterproof probe 1m',
    keySpec: '-55 to 125°C',
    typicalUse: 'Liquids, cold chain',
    buyCost: 85,
    marketPrice: 149,
    price: 139,
    margin: '₹33 (27.8%)',
    moq: 20
  },
  {
    subCat: 'Sensors',
    name: 'SCT-013-030 current transformer 30A',
    keySpec: 'Non-invasive',
    typicalUse: 'Energy meters',
    buyCost: 430,
    marketPrice: 649,
    price: 609,
    margin: '₹86 (16.7%)',
    moq: 5
  },
  {
    subCat: 'Sensors',
    name: 'PZEM-004T v3 energy meter module 100A',
    keySpec: 'V/I/kWh over UART',
    typicalUse: 'Energy monitoring',
    buyCost: 850,
    marketPrice: 1299,
    price: 1229,
    margin: '₹192 (18.4%)',
    moq: 5
  },
  {
    subCat: 'Sensors',
    name: 'ACS712 20A current sensor',
    keySpec: 'Hall effect',
    typicalUse: 'DC current',
    buyCost: 100,
    marketPrice: 169,
    price: 159,
    margin: '₹35 (25.8%)',
    moq: 10
  },
  {
    subCat: 'Sensors',
    name: 'INMP441 I2S microphone',
    keySpec: 'MEMS',
    typicalUse: 'Voice control',
    buyCost: 160,
    marketPrice: 249,
    price: 229,
    margin: '₹34 (17.6%)',
    moq: 10
  },
  {
    subCat: 'Sensors',
    name: 'MAX6675 + K-type thermocouple',
    keySpec: '0–1024°C',
    typicalUse: 'Industrial temperature',
    buyCost: 260,
    marketPrice: 399,
    price: 369,
    margin: '₹53 (16.9%)',
    moq: 10
  },
  {
    subCat: 'Sensors',
    name: 'MLX90614 IR thermometer',
    keySpec: 'Non-contact',
    typicalUse: 'Body/surface temperature',
    buyCost: 650,
    marketPrice: 999,
    price: 939,
    margin: '₹146 (18.3%)',
    moq: 5
  },
  {
    subCat: 'Sensors',
    name: 'Reed switch door sensor (magnetic)',
    keySpec: 'NO/NC',
    typicalUse: 'Doors, windows',
    buyCost: 25,
    marketPrice: 49,
    price: 39,
    margin: '₹8 (24.4%)',
    moq: 50
  },

  // 3. Communication
  {
    subCat: 'Communication',
    name: 'NEO-6M GPS module with antenna',
    keySpec: 'u-blox',
    typicalUse: 'Trackers',
    buyCost: 250,
    marketPrice: 399,
    price: 369,
    margin: '₹63 (20.1%)',
    moq: 10
  },
  {
    subCat: 'Communication',
    name: 'SIM800L GSM/GPRS module',
    keySpec: '2G; check network support',
    typicalUse: 'SMS alerts',
    buyCost: 270,
    marketPrice: 399,
    price: 369,
    margin: '₹43 (13.7%)',
    moq: 10
  },
  {
    subCat: 'Communication',
    name: 'SX1278 LoRa Ra-02 433 MHz',
    keySpec: 'Long range',
    typicalUse: 'Farms, campuses',
    buyCost: 290,
    marketPrice: 449,
    price: 419,
    margin: '₹65 (18.3%)',
    moq: 10
  },

  // 4. Actuator / Switching
  {
    subCat: 'Actuator / Switching',
    name: '1-channel 5V relay module (opto)',
    keySpec: '10A, 250VAC',
    typicalUse: 'Switching loads',
    buyCost: 40,
    marketPrice: 79,
    price: 69,
    margin: '₹18 (31.6%)',
    moq: 50
  },
  {
    subCat: 'Actuator / Switching',
    name: '2-channel 5V relay module',
    keySpec: '10A, 250VAC',
    typicalUse: 'Pumps, lights',
    buyCost: 85,
    marketPrice: 149,
    price: 139,
    margin: '₹33 (27.8%)',
    moq: 20
  },
  {
    subCat: 'Actuator / Switching',
    name: '4-channel 5V relay module',
    keySpec: '10A, 250VAC',
    typicalUse: 'Home automation',
    buyCost: 150,
    marketPrice: 249,
    price: 229,
    margin: '₹44 (22.7%)',
    moq: 20
  },
  {
    subCat: 'Actuator / Switching',
    name: 'SSR-40DA solid-state relay',
    keySpec: '40A',
    typicalUse: 'Heaters, motors',
    buyCost: 420,
    marketPrice: 699,
    price: 659,
    margin: '₹138 (24.8%)',
    moq: 5
  },
  {
    subCat: 'Actuator / Switching',
    name: 'L298N motor driver',
    keySpec: '2A dual H-bridge',
    typicalUse: 'Robots',
    buyCost: 110,
    marketPrice: 199,
    price: 179,
    margin: '₹42 (27.5%)',
    moq: 20
  },
  {
    subCat: 'Actuator / Switching',
    name: '12V mini DC water pump',
    keySpec: 'Diaphragm',
    typicalUse: 'Irrigation',
    buyCost: 140,
    marketPrice: 229,
    price: 209,
    margin: '₹37 (21.0%)',
    moq: 10
  },
  {
    subCat: 'Actuator / Switching',
    name: '12V solenoid valve 1/2"',
    keySpec: 'Normally closed',
    typicalUse: 'Water control',
    buyCost: 260,
    marketPrice: 449,
    price: 419,
    margin: '₹95 (26.8%)',
    moq: 10
  },
  {
    subCat: 'Actuator / Switching',
    name: 'SG90 micro servo',
    keySpec: '9g',
    typicalUse: 'Robotics',
    buyCost: 75,
    marketPrice: 129,
    price: 119,
    margin: '₹26 (25.6%)',
    moq: 20
  },

  // 5. Display
  {
    subCat: 'Display',
    name: '0.96" OLED I2C 128×64',
    keySpec: 'SSD1306',
    typicalUse: 'Status screens',
    buyCost: 130,
    marketPrice: 219,
    price: 199,
    margin: '₹39 (22.9%)',
    moq: 20
  },
  {
    subCat: 'Display',
    name: '16×2 LCD with I2C adapter',
    keySpec: 'HD44780',
    typicalUse: 'Panels',
    buyCost: 160,
    marketPrice: 249,
    price: 229,
    margin: '₹34 (17.6%)',
    moq: 10
  },

  // 6. Lighting
  {
    subCat: 'Lighting',
    name: 'WS2812B LED strip 1m, 60 LEDs',
    keySpec: 'Addressable RGB',
    typicalUse: 'Decor, signage',
    buyCost: 250,
    marketPrice: 399,
    price: 369,
    margin: '₹63 (20.1%)',
    moq: 10
  },

  // 7. Modules
  {
    subCat: 'Modules',
    name: 'DS3231 RTC module',
    keySpec: '±2 ppm',
    typicalUse: 'Loggers, timers',
    buyCost: 120,
    marketPrice: 199,
    price: 179,
    margin: '₹32 (20.9%)',
    moq: 10
  },
  {
    subCat: 'Modules',
    name: 'MicroSD card module',
    keySpec: 'SPI',
    typicalUse: 'Data logging',
    buyCost: 35,
    marketPrice: 69,
    price: 59,
    margin: '₹15 (30.0%)',
    moq: 20
  },

  // 8. Power
  {
    subCat: 'Power',
    name: 'TP4056 Li-ion charger (Type-C, protection)',
    keySpec: '1A',
    typicalUse: 'Battery projects',
    buyCost: 18,
    marketPrice: 39,
    price: 29,
    margin: '₹7 (26.8%)',
    moq: 50
  },
  {
    subCat: 'Power',
    name: '18650 Li-ion cell 2600mAh',
    keySpec: 'Branded/grade A',
    typicalUse: 'Portable devices',
    buyCost: 140,
    marketPrice: 229,
    price: 209,
    margin: '₹37 (21.0%)',
    moq: 20
  },
  {
    subCat: 'Power',
    name: '18650 single-cell holder',
    keySpec: 'PCB/wire',
    typicalUse: 'Battery projects',
    buyCost: 15,
    marketPrice: 35,
    price: 29,
    margin: '₹10 (39.0%)',
    moq: 50
  },
  {
    subCat: 'Power',
    name: '3.7V LiPo 3000mAh',
    keySpec: 'With JST',
    typicalUse: 'Trackers, monitors',
    buyCost: 330,
    marketPrice: 499,
    price: 469,
    margin: '₹67 (17.0%)',
    moq: 10
  },
  {
    subCat: 'Power',
    name: 'HLK-PM01 AC-DC 5V 3W',
    keySpec: 'Mains-to-5V module',
    typicalUse: 'Built-in PSU',
    buyCost: 160,
    marketPrice: 249,
    price: 229,
    margin: '₹34 (17.6%)',
    moq: 10
  },
  {
    subCat: 'Power',
    name: 'LM2596 buck converter',
    keySpec: '3A adjustable',
    typicalUse: '12V to 5V',
    buyCost: 65,
    marketPrice: 119,
    price: 109,
    margin: '₹27 (29.6%)',
    moq: 20
  },
  {
    subCat: 'Power',
    name: 'MT3608 boost converter',
    keySpec: '2A',
    typicalUse: '3.7V to 5V',
    buyCost: 30,
    marketPrice: 59,
    price: 49,
    margin: '₹12 (27.8%)',
    moq: 50
  },
  {
    subCat: 'Power',
    name: '5V 2A adapter (USB)',
    keySpec: 'BIS-certified',
    typicalUse: 'Development boards',
    buyCost: 110,
    marketPrice: 199,
    price: 179,
    margin: '₹42 (27.5%)',
    moq: 20
  },
  {
    subCat: 'Power',
    name: '12V 2A adapter (DC jack)',
    keySpec: 'BIS-certified',
    typicalUse: 'Pumps, LED strips',
    buyCost: 170,
    marketPrice: 279,
    price: 259,
    margin: '₹49 (22.5%)',
    moq: 20
  },
  {
    subCat: 'Power',
    name: 'Raspberry Pi 27W USB-C PSU (official)',
    keySpec: '5.1V, 5A',
    typicalUse: 'Raspberry Pi 5',
    buyCost: 900,
    marketPrice: 1100,
    price: 1039,
    margin: '-₹19 (-2.2%)',
    moq: 5
  },

  // 9. Accessories
  {
    subCat: 'Accessories',
    name: 'Raspberry Pi 5 active cooler (official)',
    keySpec: 'Fan + heatsink',
    typicalUse: 'Raspberry Pi 5',
    buyCost: 600,
    marketPrice: 800,
    price: 759,
    margin: '₹43 (6.7%)',
    moq: 5
  },
  {
    subCat: 'Accessories',
    name: 'Raspberry Pi 5 M.2 HAT+ (official)',
    keySpec: 'NVMe PCIe',
    typicalUse: 'Raspberry Pi 5 SSD',
    buyCost: 1200,
    marketPrice: 1500,
    price: 1419,
    margin: '₹3 (0.2%)',
    moq: 5
  },
  {
    subCat: 'Accessories',
    name: 'MicroSD card 8GB',
    keySpec: 'Class 10',
    typicalUse: 'ESP32-CAM, loggers',
    buyCost: 120,
    marketPrice: 199,
    price: 179,
    margin: '₹32 (20.9%)',
    moq: 20
  },

  // 10. Prototyping
  {
    subCat: 'Prototyping',
    name: 'Breadboard 830 points',
    keySpec: 'MB-102',
    typicalUse: 'Prototyping',
    buyCost: 65,
    marketPrice: 119,
    price: 109,
    margin: '₹27 (29.6%)',
    moq: 20
  },
  {
    subCat: 'Prototyping',
    name: 'Jumper wires 120 pcs (M-M/M-F/F-F)',
    keySpec: '20cm',
    typicalUse: 'Prototyping',
    buyCost: 100,
    marketPrice: 169,
    price: 159,
    margin: '₹35 (25.8%)',
    moq: 20
  },
  {
    subCat: 'Prototyping',
    name: 'Resistor kit 600 pcs (30 values)',
    keySpec: '1/4W',
    typicalUse: 'Labs',
    buyCost: 170,
    marketPrice: 279,
    price: 259,
    margin: '₹49 (22.5%)',
    moq: 10
  },
  {
    subCat: 'Prototyping',
    name: 'Electrolytic capacitor kit 120 pcs',
    keySpec: 'Assorted',
    typicalUse: 'Labs',
    buyCost: 180,
    marketPrice: 299,
    price: 279,
    margin: '₹56 (23.9%)',
    moq: 10
  },
  {
    subCat: 'Prototyping',
    name: 'Perfboard 7×9cm (pack of 5)',
    keySpec: 'Double-sided',
    typicalUse: 'Soldering',
    buyCost: 75,
    marketPrice: 129,
    price: 119,
    margin: '₹26 (25.6%)',
    moq: 20
  },
  {
    subCat: 'Prototyping',
    name: '2-pin screw terminal (pack of 10)',
    keySpec: '5.08mm',
    typicalUse: 'Wiring',
    buyCost: 45,
    marketPrice: 89,
    price: 79,
    margin: '₹22 (32.8%)',
    moq: 20
  },

  // 11. Enclosure
  {
    subCat: 'Enclosure',
    name: 'IP65 junction box 100×68×50',
    keySpec: 'ABS',
    typicalUse: 'Outdoor nodes',
    buyCost: 110,
    marketPrice: 199,
    price: 179,
    margin: '₹42 (27.5%)',
    moq: 20
  },

  // 12. Wiring
  {
    subCat: 'Wiring',
    name: 'Silicone tubing 2m (6mm)',
    keySpec: 'Food grade',
    typicalUse: 'Irrigation',
    buyCost: 40,
    marketPrice: 79,
    price: 69,
    margin: '₹18 (31.6%)',
    moq: 20
  },
  {
    subCat: 'Wiring',
    name: 'USB cable micro/Type-C 1m',
    keySpec: 'Data',
    typicalUse: 'Programming',
    buyCost: 45,
    marketPrice: 99,
    price: 89,
    margin: '₹30 (40.3%)',
    moq: 50
  },

  // 13. Tools
  {
    subCat: 'Tools',
    name: 'Soldering iron 60W adjustable temperature',
    keySpec: 'With stand',
    typicalUse: 'Workshop',
    buyCost: 360,
    marketPrice: 599,
    price: 559,
    margin: '₹114 (24.0%)',
    moq: 5
  },
  {
    subCat: 'Tools',
    name: 'Digital multimeter DT830D',
    keySpec: 'Basic',
    typicalUse: 'Workshop',
    buyCost: 220,
    marketPrice: 349,
    price: 329,
    margin: '₹59 (21.1%)',
    moq: 10
  },

  // 14. Robotics
  {
    subCat: 'Robotics',
    name: '2WD robot car chassis with motors',
    keySpec: 'Acrylic',
    typicalUse: 'Robot car kits',
    buyCost: 280,
    marketPrice: 449,
    price: 419,
    margin: '₹65 (18.3%)',
    moq: 10
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
  return `${prefix}-${catCode}-${prodCode}-${rand}`;
}

async function syncIoTComponents() {
  await db.authenticate();
  console.log('Connected to Database successfully.');

  // 1. Sync Subcategories
  const subCategoryMap = {};
  const existingCategories = await Category.findAll();

  for (const sub of subcategoriesData) {
    let match = existingCategories.find(c => 
      c.parentId === IOT_ROOT_ID && 
      (c.name.toLowerCase() === sub.name.toLowerCase() || c.slug === sub.slug)
    );

    // Also match existing 'Controller Boards' if it aligns with Microcontrollers or existing names
    if (!match && sub.name === 'Actuator / Switching') {
      match = existingCategories.find(c => c.parentId === IOT_ROOT_ID && c.name.toLowerCase().includes('actuator'));
    }

    if (match) {
      console.log(`[Category Exists]: "${match.name}" (ID: ${match.id})`);
      subCategoryMap[sub.name] = match.id;
    } else {
      const created = await Category.create({
        name: sub.name,
        slug: sub.slug,
        description: sub.description,
        status: 'active',
        parentId: IOT_ROOT_ID
      });
      console.log(`[Category Created]: "${created.name}" (ID: ${created.id})`);
      subCategoryMap[sub.name] = created.id;
    }
  }

  // 2. Sync Products
  const existingProducts = await Product.findAll();
  console.log(`Checking ${productsData.length} target products against ${existingProducts.length} existing products...`);

  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const item of productsData) {
    const targetSubCatId = subCategoryMap[item.subCat] || null;
    const cleanItemName = item.name.toLowerCase().trim();

    // Look for duplicate / match
    const match = existingProducts.find(p => {
      const pName = p.name.toLowerCase().trim();
      return pName === cleanItemName ||
        (cleanItemName.length > 5 && (pName.includes(cleanItemName) || cleanItemName.includes(pName)));
    });

    if (match) {
      // Product exists - update subCategoryId, price, discountPrice, specifications if needed
      console.log(`[Product Exists]: Updating "${match.name}" with subCat: ${item.subCat}`);
      await match.update({
        subCategoryId: targetSubCatId,
        price: item.marketPrice.toString(),
        discountPrice: item.price.toString(),
        specifications: {
          ...(match.specifications || {}),
          'Key Specification': item.keySpec,
          'Typical Use': item.typicalUse,
          'Buy Cost (ex-GST)': `₹${item.buyCost}`,
          'Est. Margin': item.margin,
          'MOQ': item.moq
        },
        keyFeatures: [
          item.keySpec,
          `Typical Use: ${item.typicalUse}`,
          `Minimum Order Qty: ${item.moq}`
        ]
      });
      updatedCount++;
    } else {
      // Create new product
      const newSku = generateSKU(item.subCat, item.name);
      const newSlug = generateSlug(item.name);

      await Product.create({
        categoryId: IOT_ROOT_ID,
        subCategoryId: targetSubCatId,
        name: item.name,
        slug: `${newSlug}-${Math.floor(1000 + Math.random() * 9000)}`,
        sku: newSku,
        description: `${item.name} - ${item.keySpec}. Ideal for ${item.typicalUse}. MOQ: ${item.moq}.`,
        price: item.marketPrice.toString(),
        discountPrice: item.price.toString(),
        stock: 50,
        status: 'active',
        isNewArrival: true,
        materialVariants: [],
        colorOptions: [],
        sizeVariants: [],
        careInstructions: [
          'Handle with ESD precautions.',
          'Store in dry anti-static packaging.',
          'Operate within rated voltage & current limits.'
        ],
        keyFeatures: [
          item.keySpec,
          `Typical Use: ${item.typicalUse}`,
          `Minimum Order Quantity (MOQ): ${item.moq}`
        ],
        specifications: {
          'Key Specification': item.keySpec,
          'Typical Use': item.typicalUse,
          'Buy Cost (ex-GST)': `₹${item.buyCost}`,
          'Est. Margin': item.margin,
          'MOQ': item.moq
        },
        sortOrder: 0,
        averageRating: '4.9',
        reviewCount: 0
      });
      console.log(`[Product Created]: "${item.name}" (SKU: ${newSku})`);
      createdCount++;
    }
  }

  console.log(`\n=== SYNC COMPLETE ===`);
  console.log(`Created: ${createdCount}`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Total Handled: ${createdCount + updatedCount}`);
}

syncIoTComponents()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Sync failed:', err);
    process.exit(1);
  });
