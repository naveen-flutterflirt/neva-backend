const http = require('http');

http.get('http://localhost:5050/api/products', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('API SUCCESS:', json.success);
      if (json.data && json.data.length > 0) {
        json.data.forEach((p, idx) => {
          console.log(`\n--- PRODUCT #${idx + 1} ---`);
          console.log('ID:', p.id);
          console.log('Name:', p.name);
          console.log('keyFeatures:', JSON.stringify(p.keyFeatures));
          console.log('careInstructions:', JSON.stringify(p.careInstructions));
          console.log('specifications:', JSON.stringify(p.specifications));
        });
      } else {
        console.log('No products found');
      }
    } catch (e) {
      console.error('JSON Parse Error:', e);
    }
  });
}).on('error', (err) => {
  console.error('HTTP Error:', err.message);
});
