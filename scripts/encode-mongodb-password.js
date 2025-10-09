#!/usr/bin/env node

/**
 * Helper script to encode MongoDB password for connection string
 *
 * Usage:
 *   node scripts/encode-mongodb-password.js "your-password-here"
 *
 * This will output the properly encoded password to use in your connection string.
 */

const password = process.argv[2];

if (!password) {
  console.error('❌ Error: Please provide a password to encode');
  console.log('\nUsage:');
  console.log('  node scripts/encode-mongodb-password.js "your-password"');
  console.log('\nExample:');
  console.log('  node scripts/encode-mongodb-password.js "p@ssw0rd!"');
  process.exit(1);
}

const encoded = encodeURIComponent(password);

console.log('\n✅ Encoded Password:');
console.log('─'.repeat(50));
console.log(encoded);
console.log('─'.repeat(50));

console.log('\n📋 Full Connection String Examples:');
console.log('\nLocal MongoDB:');
console.log(`mongodb://username:${encoded}@localhost:27017/`);

console.log('\nMongoDB Atlas:');
console.log(`mongodb+srv://username:${encoded}@cluster.mongodb.net/`);

console.log('\n💡 Update your .env.local file:');
console.log(`MONGODB_CONNECTION_STRING=mongodb://username:${encoded}@localhost:27017/`);
console.log('\n');

