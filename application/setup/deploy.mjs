import { createInterface } from 'readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { exec } from 'child_process';
import util from 'util';
const rl = createInterface({ input, output });
const execPromise = util.promisify(exec);

async function checkDoctlInstalled() {
  try {
    await execPromise('doctl version');
    return true;
  } catch {
    return false;
  }
}

async function checkDoctlAuthenticated() {
  try {
    await execPromise('doctl account get');
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log(`
--- DigitalOcean App Platform Deployment ---
  
To deploy, you need:
  1. DigitalOcean CLI (doctl) installed globally
     https://docs.digitalocean.com/reference/doctl/how-to/install/
  2. Authenticated via 'doctl auth init'
  
This script will guide you if anything is missing.
  `);

  const hasDoctl = await checkDoctlInstalled();
  if (!hasDoctl) {
    console.log('\n❌ DigitalOcean CLI (doctl) is NOT installed.');
    console.log('Install with:');
    console.log('  brew install doctl   # Mac');
    console.log('  choco install doctl  # Windows');
    console.log('  snap install doctl   # Linux\n');
    process.exit(1);
  }

  const isAuthenticated = await checkDoctlAuthenticated();
  if (!isAuthenticated) {
    console.log('\n❌ doctl is not authenticated.');
    console.log('To authenticate, run:\n  doctl auth init\n');
    console.log('Follow the prompts to paste your DigitalOcean API token.');
    process.exit(1);
  }

  const confirm = await rl.question('doctl is ready! Proceed with app deployment? (y/n): ');
  if (!confirm.trim().toLowerCase().startsWith('y')) {
    console.log('Deployment cancelled by user.');
    process.exit(0);
  }

  try {
    console.log('\n🚀 Deploying app using app.yaml ...\n');
    const { stdout, stderr } = await execPromise('doctl apps create --spec app.yaml');
    console.log(stdout);
    if (stderr) console.error(stderr);
    console.log('\n✅ Deployment command finished.');
  } catch (err) {
    console.error('\n❌ Deployment failed:', err.stderr || err.message);
  }
  rl.close();
}

main();
