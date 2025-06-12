import { createInterface } from 'readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

const rl = createInterface({ input, output });

async function ask(question, defaultValue = '') {
  const prompt = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `;
  const answer = await rl.question(prompt);
  return answer.trim() || defaultValue;
}

function validateSlug(value) {
  return /^[a-z][a-z0-9-]{0,30}[a-z0-9]$/.test(value);
}

async function askAndValidate(question, defaultValue = '') {
  let valid = false;
  let answer;
  while (!valid) {
    answer = await ask(question, defaultValue);
    if (validateSlug(answer)) {
      valid = true;
    } else {
      console.warn(
        '❌ Invalid format. Use only lowercase letters, numbers, and dashes. Must start and end with a letter or number. Length 2-32.'
      );
    }
  }
  return answer;
}

function getEnvVars(requiredVars) {
  dotenv.config();
  const env = process.env;
  let missing = [];
  let values = {};

  for (const key of requiredVars) {
    if (!env[key]) missing.push(key);
    else values[key] = env[key];
  }
  return { missing, values };
}

function getYamlWithReplacements(yamlString, replacements) {
  let content = yamlString;
  for (const [key, value] of Object.entries(replacements)) {
    content = content.replaceAll(`{{${key}}}`, value);
  }
  return content;
}

async function main() {
  const appName = await askAndValidate('Enter the app name');
  const githubRepo = await askAndValidate('Enter the GitHub repository (e.g. user/repo)');
  const githubBranch = await askAndValidate('Enter the branch to deploy', 'main');

  let useDevDb = false;
  let dbAnswer = await ask('Provision a dev Postgres DB on DO? (y/n)', 'y');
  useDevDb = dbAnswer.toLowerCase().startsWith('y');

  const templatePath = path.resolve('./setup/app-base.yaml');
  let yamlTemplate = '';
  try {
    yamlTemplate = await fs.readFile(templatePath, 'utf8');
  } catch (err) {
    console.error(`❌ Could not read app-base.yaml:`, err.message);
    process.exit(1);
  }

  let DATABASE_URL = '';
  let databasesBlock = '';
  const envVars = [
    'SPACES_KEY_ID',
    'SPACES_KEY_SECRET',
    'SPACES_BUCKET_NAME',
    'SPACES_REGION',
    'NEXTAUTH_SECRET',
    'APP_URL',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_FREE_PRICE_ID',
    'NEXT_PUBLIC_STRIPE_PRO_PRICE_ID',
    'STRIPE_PRO_GIFT_PRICE_ID',
    'STRIPE_PORTAL_CONFIG_ID',
    'RESEND_API_KEY',
    'RESEND_EMAIL_SENDER',
  ];

  if (useDevDb) {
    DATABASE_URL = '${' + appName + '-db.DATABASE_URL}';
    databasesBlock = `
databases:
  - name: ${appName}-db
    engine: PG
    version: "15"
    production: false
    cluster_name: ${appName}-cluster`;
  } else {
    envVars.unshift('DATABASE_URL');
    databasesBlock = '';
  }

  let validated = false;
  let envValues = {};
  while (!validated) {
    console.log('\nChecking required environment variables from .env...\n');
    const { missing, values } = getEnvVars(envVars);
    if (missing.length) {
      console.warn(`⚠️  Missing variables in .env: ${missing.join(', ')}`);
      const retry = await ask('Retry after fixing .env? (y to retry, n to abort)', 'y');
      if (retry.toLowerCase() === 'y') continue;
      else {
        console.log('Aborted by user. Exiting.');
        process.exit(1);
      }
    }
    envValues = values;
    validated = true;
  }

  if (!useDevDb) {
    DATABASE_URL = envValues.DATABASE_URL;
  }

  const replacements = {
    APP_NAME: appName,
    GITHUB_REPO: githubRepo,
    GITHUB_BRANCH: githubBranch,
    DATABASE_URL,
    SPACES_KEY_ID: envValues.SPACES_KEY_ID,
    SPACES_KEY_SECRET: envValues.SPACES_KEY_SECRET,
    SPACES_BUCKET_NAME: envValues.SPACES_BUCKET_NAME,
    SPACES_REGION: envValues.SPACES_REGION,
    NEXTAUTH_SECRET: envValues.NEXTAUTH_SECRET,
    STRIPE_WEBHOOK_SECRET: envValues.STRIPE_WEBHOOK_SECRET,
    STRIPE_SECRET_KEY: envValues.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_FREE_PRICE_ID: envValues.NEXT_PUBLIC_STRIPE_FREE_PRICE_ID,
    NEXT_PUBLIC_STRIPE_PRO_PRICE_ID: envValues.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
    STRIPE_PRO_GIFT_PRICE_ID: envValues.STRIPE_PRO_GIFT_PRICE_ID,
    STRIPE_PORTAL_CONFIG_ID: envValues.STRIPE_PORTAL_CONFIG_ID,
    RESEND_API_KEY: envValues.RESEND_API_KEY,
    RESEND_EMAIL_SENDER: envValues.RESEND_EMAIL_SENDER,
    DATABASES_BLOCK: databasesBlock,
  };

  let finalYaml = getYamlWithReplacements(yamlTemplate, replacements);

  if (!useDevDb) {
    finalYaml = finalYaml.replace(/databases:.*\n(\s*-.*\n)+/g, '');
  }

  const outPath = path.resolve('./app.yaml');
  await fs.writeFile(outPath, finalYaml, 'utf8');
  console.log('\n✅ App spec generated as app.yaml!\n');

  const deployNow = await ask('Do you want to proceed with deployment to DigitalOcean? (y/n)', 'n');
  if (deployNow.toLowerCase() === 'y') {
    console.log('🚀 Launching DigitalOcean deployment (not implemented in this script)...');
  } else {
    console.log('Setup complete. You can deploy later by running your deploy script.\n');
  }
  rl.close();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
