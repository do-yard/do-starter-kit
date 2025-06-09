import path from 'path';

async function runModule(name) {
  const modulePath = path.resolve(`./setup/${name}.mjs`);
  try {
    const mod = await import(modulePath);
    if (typeof mod.default === 'function') {
      await mod.default();
    } else {
      console.warn(`⚠️ Module ${name} has no default export function.`);
    }
  } catch (err) {
    console.error(`❌ Failed to run module: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

async function main() {
  console.log('🔧 Starting SaaS project setup...\n');

  await runModule('billing');

  // 🧩 Add more modules here in the future, e.g.:
  // await runModule('database');
  // await runModule('email');

  console.log('\n✅ All setup modules completed.');
}

main();
