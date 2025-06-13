import { createInterface } from 'readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { execSync } from 'node:child_process';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import yaml from 'js-yaml';

const rl = createInterface({ input, output });

async function ask(question, defaultValue = '') {
  const prompt = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `;
  const answer = await rl.question(prompt);
  return answer.trim() || defaultValue;
}

function validateSlug(value) {
  return /^[a-z][a-z0-9-\/]{0,30}[a-z0-9]$/.test(value);
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

function getGithubRepoFromGit() {
  try {
    const url = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();

    let match = url.match(/[:\/]([^\/:]+\/[^\/.]+)(\.git)?$/);
    if (match) {
      return match[1];
    } else {
      console.warn('⚠️  Could not parse repository from git URL:', url);
      return '';
    }
  } catch (e) {
    console.warn('⚠️  Could not get repository URL from git:', e.message);
    return '';
  }
}

function extractEnvVarsFromTemplate(yamlTemplate, { useDevDb }) {
  const doc = yaml.load(yamlTemplate);
  const envSet = new Set();

  const envs = doc.services?.[0]?.envs || [];
  for (const env of envs) {
    if (env.key) envSet.add(env.key);
    const matches = env.value?.match(/\${([A-Z0-9_]+)}/g) || [];
    matches.forEach((m) => envSet.add(m.replace(/\${|}/g, '')));
  }

  envSet.delete('DB_NAME');
  envSet.delete('AUTH_TRUST_HOST');
  if (useDevDb) envSet.delete('DATABASE_URL');

  return Array.from(envSet).sort();
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
    content = content.replaceAll(`\${${key}}`, value);
  }
  return content;
}

async function main() {
  const appName = await askAndValidate('Enter the app name');
  const githubRepo = getGithubRepoFromGit();
  console.log(`Using GitHub repository: ${githubRepo}`);
  const githubBranch = await askAndValidate('Enter the branch to deploy', 'main');

  let useDevDb = false;
  let dbAnswer = await ask('Provision a dev Postgres DB on DO? (y/n)', 'y');
  useDevDb = dbAnswer.toLowerCase().startsWith('y');

  const templatePath = path.resolve('../.do/app.template.yaml');
  let yamlTemplate = '';
  try {
    yamlTemplate = await fs.readFile(templatePath, 'utf8');
  } catch (err) {
    console.error(`❌ Could not read app.template.yaml:`, err.message);
    process.exit(1);
  }

  const envVars = extractEnvVarsFromTemplate(yamlTemplate, { useDevDb });

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

  const replacements = {
    APP_NAME: appName,
    GITHUB_REPO: githubRepo,
    GITHUB_BRANCH: githubBranch,
    DB_NAME: useDevDb ? `${appName}-db` : '',
    CLUSTER_NAME: useDevDb ? `${appName}-cluster` : '',
    ...envValues,
  };

  let finalYaml = getYamlWithReplacements(yamlTemplate, replacements);

  if (!useDevDb) {
    finalYaml = finalYaml
      .replace(/\$\{\.DATABASE_URL\}/g, envValues.DATABASE_URL)
      .replace(/^databases:[\s\S]*$/m, '');
  }

  const outPath = path.resolve('./app.yaml');
  await fs.writeFile(outPath, finalYaml, 'utf8');
  console.log('\n✅ App spec generated as app.yaml!\n');

  const deployNow = await ask('Do you want to proceed with deployment to DigitalOcean? (y/n)', 'n');
  if (deployNow.toLowerCase() === 'y') {
    console.log('🚀 Launching DigitalOcean deployment...');
    await import('./deploy.mjs');
  } else {
    console.log('Setup complete. You can deploy later by running:');
    console.log('  npm run deploy\n');
  }
  rl.close();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
