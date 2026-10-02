const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_92dFteILXQqH@ep-polished-leaf-axxvocjx-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

async function testConnection() {
  console.log('Testing connection to Neon database...');
  try {
    await client.connect();
    console.log('Successfully connected to the database!');
    const res = await client.query('SELECT NOW()');
    console.log('Current time from DB:', res.rows[0].now);
  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    await client.end();
  }
}

testConnection();
