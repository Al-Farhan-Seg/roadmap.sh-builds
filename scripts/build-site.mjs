import { access, cp, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..');
const distDirectory = path.join(repositoryRoot, 'dist');

const NUMBERED_FOLDER_PATTERN = /^\d+-/;

const VITE_PROJECTS = [
  '14-age-calculator',
  '15-flash-cards',
  '21-quiz-app',
  '22-weather-web-app',
  '23-github-random-repository',
  '26-reddit-client',
  '28-pomodoro-timer',
  '30-24hr-story-feature'
];

const ROOT_STATIC_ENTRIES = [
  'index.html',
  'styles.css',
  'sitemap.xml',
  'pesticide-adv.css',
  'pesticide-ord.css',
  'top_assets',
  'fonts'
];

const EXCLUDED_ENTRY_NAMES = new Set(['node_modules', 'dist', '.git']);

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function run(command, args) {
  const commandLine = [command, ...args].join(' ');
  console.log(`\n> ${commandLine}`);

  const result = spawnSync(commandLine, {
    cwd: repositoryRoot,
    stdio: 'inherit',
    shell: true
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${commandLine}`);
  }
}

async function cleanDist() {
  console.log('Cleaning dist/...');
  await rm(distDirectory, { recursive: true, force: true });
  await mkdir(distDirectory, { recursive: true });
}

function buildProductionTailwindCss() {
  console.log('\nBuilding production Tailwind CSS...');
  run('npm', ['run', 'css:build:prod']);
}

async function copyRootStaticFiles() {
  console.log('\nCopying root static site files...');

  for (const entry of ROOT_STATIC_ENTRIES) {
    const source = path.join(repositoryRoot, entry);

    if (!(await pathExists(source))) {
      continue;
    }

    await cp(source, path.join(distDirectory, entry), { recursive: true });
  }
}

async function copyStaticProjectFolders() {
  console.log('Copying static (non-Vite) project folders...');

  const entries = await readdir(repositoryRoot, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    if (!NUMBERED_FOLDER_PATTERN.test(entry.name)) {
      continue;
    }

    if (VITE_PROJECTS.includes(entry.name)) {
      continue;
    }

    await cp(
      path.join(repositoryRoot, entry.name),
      path.join(distDirectory, entry.name),
      {
        recursive: true,
        filter: (source) => !EXCLUDED_ENTRY_NAMES.has(path.basename(source))
      }
    );
  }
}

function buildViteWorkspaces() {
  console.log('\nBuilding Vite workspaces...');

  for (const project of VITE_PROJECTS) {
    console.log(`\nBuilding ${project}...`);
    run('npm', ['run', 'build', '--workspace', project]);
  }
}

async function main() {
  await cleanDist();
  buildProductionTailwindCss();
  await copyRootStaticFiles();
  await copyStaticProjectFolders();
  buildViteWorkspaces();

  console.log('\nBuild complete: dist/');
}

main().catch((error) => {
  console.error(`\nSite build failed: ${error.message}`);
  process.exitCode = 1;
});
