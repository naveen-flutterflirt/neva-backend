const { Product, Category, ProductImage, sequelize } = require('../models');

async function seedHot5Products() {
  const transaction = await sequelize.transaction();
  try {
    const root = await Category.findOne({ where: { slug: 'iot-products' }, transaction });
    if (!root) throw new Error('Root IoT Products category not found');

    const subs = await Category.findAll({ where: { parentId: root.id }, transaction });
    const subMap = {};
    subs.forEach(s => { subMap[s.slug] = s; });

    const smartHomeSub = subMap['smart-home-automation'];
    const securitySub = subMap['security-monitoring'];

    if (!smartHomeSub || !securitySub) {
      throw new Error('Required subcategories not found');
    }

    const hot5Products = [
      {
        name: 'Smart AQI Monitor (PM2.5 / PM10) with OLED Display',
        slug: 'smart-aqi-monitor-pm25-pm10-nv-aq1',
        sku: 'NV-AQ1',
        price: 5059,
        discountPrice: 4799,
        stock: 50,
        status: 'active',
        isIoT: true,
        categoryId: root.id,
        subCategoryId: securitySub.id,
        description: 'Winter smog and air quality protection device. Features high-precision PMS5003 laser sensor, ESP32-S3 DevKitC (N16R8), and crisp 0.96" OLED display. Real-time Indian NAQI index, Wi-Fi MQTT cloud telemetry, 24-h trend analysis, and customizable push threshold alerts for homes and offices.',
        keyFeatures: JSON.stringify([
          { title: 'PMS5003 Laser Sensor', description: 'Accurate PM1.0, PM2.5, PM10 laser particle counting every 1s' },
          { title: 'ESP32-S3 Dual-Core', description: 'Powerful N16R8 module with Wi-Fi + BLE for effortless BLE setup' },
          { title: 'OLED Local Display', description: '0.96" I2C display shows Indian NAQI category & live values offline' },
          { title: 'Rechargeable Battery', description: '3000 mAh LiPo with Type-C TP4056 protection charging' },
          { title: 'MQTT / App Sync', description: 'Live telemetry, 24-hr pollution trends, and mobile push alerts' }
        ]),
        specifications: JSON.stringify({
          'Model': 'NV-AQ1',
          'Brand': 'NIVASHOP (FlutterFlirt Private Limited)',
          'Microcontroller': 'ESP32-S3 DevKitC N16R8 (16MB Flash, 8MB PSRAM)',
          'Particulate Sensor': 'Plantower PMS5003 Laser Dust Sensor',
          'Display': '0.96 inch I2C OLED (128x64)',
          'Battery': '3.7V 3000 mAh LiPo Rechargeable',
          'Ports': 'USB-C Charging & Firmware Update, Slide Power Switch',
          'Wireless': 'Wi-Fi 2.4 GHz + BLE 5.0 Mesh',
          'Country of Origin': 'Assembled in India'
        }),
        images: [
          'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Wi-Fi Water Tank Level Controller (Auto Motor ON/OFF)',
        slug: 'wifi-water-tank-level-controller-nv-wt1',
        sku: 'NV-WT1',
        price: 2799,
        discountPrice: 2499,
        stock: 65,
        status: 'active',
        isIoT: true,
        categoryId: root.id,
        subCategoryId: smartHomeSub.id,
        description: 'End water overflow and dry-run pump damages forever. Equipped with waterproof JSN-SR04T ultrasonic sensor, ESP32 controller, 16x2 I2C LCD, and opto-isolated relay output. Fully autonomous rules: auto turns ON motor when tank is low and turns OFF on high level or pump dry-run. Works 100% offline with cloud MQTT app telemetry.',
        keyFeatures: JSON.stringify([
          { title: 'Autonomous Auto Pump ON/OFF', description: 'Turns ON pump when tank is empty, cuts power automatically when full' },
          { title: 'Dry-Run Protection', description: 'Stops motor automatically if water does not rise in 10 minutes' },
          { title: 'Waterproof Ultrasonic Sensor', description: 'JSN-SR04T industrial probe with 10m heavy-duty 4-core cable' },
          { title: 'Offline 16x2 LCD', description: 'Shows real-time tank % level and motor run status locally' },
          { title: 'Smart App Control', description: 'Schedule fill timings, start/stop pump remotely, and get tank alerts' }
        ]),
        specifications: JSON.stringify({
          'Model': 'NV-WT1',
          'Brand': 'NIVASHOP (FlutterFlirt Private Limited)',
          'Microcontroller': 'ESP32 DevKit V1 (30-pin, 2.4 GHz Wi-Fi)',
          'Sensor Probe': 'JSN-SR04T Waterproof Ultrasonic Sensor (20cm - 450cm range)',
          'Display': '16x2 Character LCD with I2C Backlight Adapter',
          'Relay Contact': 'Dry Contact (NO/COM) for motor contactor/starter coil',
          'Enclosure': 'IP65 Weatherproof Junction Box (100x68x50mm) with glands',
          'Power Input': '230V AC Mains (Built-in HLK-PM01 Isolated 5V 3W + Fuse)',
          'Country of Origin': 'Assembled in India'
        }),
        images: [
          'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Wi-Fi Smart Energy Meter (Single Phase, 100A CT Clamp)',
        slug: 'wifi-smart-energy-meter-1phase-100a-nv-em1',
        sku: 'NV-EM1',
        price: 3379,
        discountPrice: 2999,
        stock: 45,
        status: 'active',
        isIoT: true,
        categoryId: root.id,
        subCategoryId: smartHomeSub.id,
        description: 'Track real-time electricity consumption, peak load, and electricity bills for homes, shops, PGs, and solar setups. Features non-invasive 100A split-core CT clamp and PZEM-004T v3 high-precision chip. Measures Voltage, Current (A), Active Power (W), Frequency (Hz), Power Factor, and Total kWh with local OLED readout and cloud analytics.',
        keyFeatures: JSON.stringify([
          { title: 'Non-Invasive 100A CT Clamp', description: 'Simply clips around incoming phase wire without cutting mains cable' },
          { title: 'PZEM-004T v3 Precision Meter', description: 'Accurate measurement of V, A, W, PF, Hz, and cumulative kWh' },
          { title: 'Local 0.96" OLED', description: 'Displays live Watts, Voltage, and Today’s kWh right at the meter box' },
          { title: 'Electricity Bill Estimator', description: 'Input your tariff (₹/kWh) in app to track real-time money spent' },
          { title: 'Peak Load Overload Alerts', description: 'Get mobile push notifications when household load exceeds set kW' }
        ]),
        specifications: JSON.stringify({
          'Model': 'NV-EM1',
          'Brand': 'NIVASHOP (FlutterFlirt Private Limited)',
          'Microcontroller': 'ESP32 DevKit V1 (30-pin, Dual Core Wi-Fi)',
          'Metering Core': 'PZEM-004T v3 with 100A Split-Core Current Transformer',
          'Measured Parameters': 'Voltage (80-260VAC), Current (0-100A), Active Power (0-23kW), Energy (0-9999kWh)',
          'Display': '0.96 inch I2C OLED (128x64)',
          'Power Supply': 'Internal HLK-PM01 AC-DC 5V with 1A Fused Protection',
          'Housing': 'IP65 Dust & Moisture Resistant Industrial Enclosure',
          'Country of Origin': 'Assembled in India'
        }),
        images: [
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: 'Motion-Triggered Wi-Fi Security Camera (ESP32-CAM + Night Snapshot)',
        slug: 'motion-triggered-wifi-security-camera-nv-cm1',
        sku: 'NV-CM1',
        price: 1669,
        discountPrice: 1499,
        stock: 80,
        status: 'active',
        isIoT: true,
        categoryId: root.id,
        subCategoryId: securitySub.id,
        description: 'Ultra-affordable smart home and shop security camera. Combines ESP32-CAM module, OV2640 2MP lens, and HC-SR501 PIR motion detector in a custom wall-mount enclosure. Instantly wakes on motion detection, captures JPEG snapshots to local 8GB microSD card, and sends instant push notification alerts with photo previews over Wi-Fi.',
        keyFeatures: JSON.stringify([
          { title: 'PIR Motion Triggered', description: 'HC-SR501 PIR sensor wakes camera instantly when human motion is detected' },
          { title: 'OV2640 2MP Camera', description: 'High-clarity JPEG capture with bright onboard flashlight LED' },
          { title: 'Dual Storage Backup', description: 'Saves photos directly to 8GB MicroSD card and uploads to cloud' },
          { title: 'Live MJPEG Streaming', description: 'View real-time video stream directly over local home Wi-Fi' },
          { title: 'Instant Mobile Notification', description: 'Receive motion snapshot preview alert directly on your phone' }
        ]),
        specifications: JSON.stringify({
          'Model': 'NV-CM1',
          'Brand': 'NIVASHOP (FlutterFlirt Private Limited)',
          'Processor & Camera': 'ESP32-CAM + OV2640 2MP Camera Sensor + MB Programmer',
          'Motion Sensor': 'HC-SR501 Infrared PIR Motion Detector (up to 7 meters)',
          'Included Storage': '8GB High-Speed MicroSD Card Pre-formatted',
          'Power Supply': '5V 2A Micro-USB Power Adapter included',
          'Enclosure': 'Custom 3D-Printed Wall-Mount Pivot Enclosure',
          'Connectivity': '2.4 GHz Wi-Fi 802.11 b/g/n',
          'Country of Origin': 'Assembled in India'
        }),
        images: [
          'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=800&q=80'
        ]
      },
      {
        name: '4-Channel Voice + App Smart Home Automation Switch Module',
        slug: '4-channel-voice-app-home-automation-switch-nv-vh1',
        sku: 'NV-VH1',
        price: 2739,
        discountPrice: 2499,
        stock: 55,
        status: 'active',
        isIoT: true,
        categoryId: root.id,
        subCategoryId: smartHomeSub.id,
        description: 'Upgrade your existing switchboard to voice and smartphone app control. Powered by ESP32-S3 (N16R8) with onboard INMP441 I2S digital microphone for local offline voice recognition. Controls 4 separate appliances (lights, fans, decorative festive lights) via app, schedule timers, or offline voice commands without needing active internet connection.',
        keyFeatures: JSON.stringify([
          { title: 'Offline Voice Command Control', description: 'Integrated INMP441 I2S mic executes voice commands locally without internet' },
          { title: '4 Independent 10A Relays', description: 'Independently control 4 lights, fans, or festive Diwali lighting channels' },
          { title: 'Fits Inside Switchboard', description: 'Compact enclosure fits behind standard Indian modular switchboards' },
          { title: 'Power-Cut State Memory', description: 'Restores previous switch states automatically when electricity returns' },
          { title: 'Smart App, Schedules & Timers', description: 'Set morning schedules, auto turn-off timers, and scene automations' }
        ]),
        specifications: JSON.stringify({
          'Model': 'NV-VH1',
          'Brand': 'NIVASHOP (FlutterFlirt Private Limited)',
          'Microcontroller': 'ESP32-S3 DevKitC N16R8 (Dual-Core AI acceleration)',
          'Audio Input': 'INMP441 Omnidirectional I2S Digital MEMS Microphone',
          'Switching Outputs': '4-Channel 10A 250V AC Opto-Isolated Relays (Max 5A/channel load)',
          'Surge Protection': 'MOV Metal Oxide Varistor + 2A Fuse Protection',
          'Power Input': '230V AC Mains (Built-in Isolated HLK-PM01 AC-DC)',
          'Connectivity': 'Wi-Fi 2.4 GHz + Bluetooth LE 5.0',
          'Country of Origin': 'Assembled in India'
        }),
        images: [
          'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80'
        ]
      }
    ];

    for (const item of hot5Products) {
      const { images, ...productData } = item;
      const [product, created] = await Product.findOrCreate({
        where: { sku: productData.sku },
        defaults: productData,
        transaction
      });

      if (created) {
        console.log(`Created product: ${product.name} (${product.sku})`);
        for (let i = 0; i < images.length; i++) {
          await ProductImage.create({
            productId: product.id,
            imageUrl: images[i],
            isPrimary: i === 0,
            mediaType: 'image',
          }, { transaction });
        }
      } else {
        console.log(`Product already exists: ${product.sku}, updating...`);
        await product.update(productData, { transaction });
      }
    }

    await transaction.commit();
    console.log('Successfully seeded all Hot 5 Products under IoT Products!');
  } catch (err) {
    await transaction.rollback();
    console.error('Error seeding Hot 5 products:', err);
  } finally {
    process.exit();
  }
}

seedHot5Products();
