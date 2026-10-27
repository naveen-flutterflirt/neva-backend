const sequelize = require('../config/database');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    await sequelize.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_email_verified" BOOLEAN DEFAULT FALSE;');
    // Set existing accounts to verified so old users don't get locked out
    await sequelize.query('UPDATE "users" SET "is_email_verified" = TRUE WHERE "is_email_verified" IS NULL;');
    console.log('Migration completed successfully: "is_email_verified" column is ready!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
