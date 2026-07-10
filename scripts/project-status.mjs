import { access, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..');
const cataloguePath = path.join(scriptDirectory, 'projects-fallback.json');
const markerName = '.project-complete';

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function normalize(value) {
  return value
    .toLowerCase()
    .replace(/^\d+[._ -]*/, '')
    .replace(/[^a-z0-9]/g, '');
}

function expandTargets(targets) {
  const numbers = new Set();

  for (const target of targets) {
    if (/^\d+$/.test(target)) {
      numbers.add(Number(target));
      continue;
    }

    const range = target.match(/^(\d+)-(\d+)$/);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      if (start > end) throw new Error(`Invalid range: ${target}`);
      for (let value = start; value <= end; value += 1) numbers.add(value);
      continue;
    }

    throw new Error(`Invalid project target: ${target}. Use numbers such as 7 or ranges such as 1-7.`);
  }

  return [...numbers].sort((a, b) => a - b);
}

function findFolder(project, directories) {
  const candidates = [
    normalize(project.slug),
    normalize(project.title),
    normalize(project.folderSlug ?? '')
  ].filter(Boolean);

  return directories.find((directory) => {
    const normalizedDirectory = normalize(directory.name);
    return candidates.some((candidate) =>
      normalizedDirectory === candidate ||
      normalizedDirectory.includes(candidate) ||
      candidate.includes(normalizedDirectory)
    );
  });
}

async function main() {
  const [action, ...rawTargets] = process.argv.slice(2);
  const validActions = new Set(['complete', 'in-progress', 'status']);

  if (!validActions.has(action) || rawTargets.length === 0) {
    console.log('Usage:');
    console.log('  node scripts/project-status.mjs complete 1-7');
    console.log('  node scripts/project-status.mjs in-progress 8');
    console.log('  node scripts/project-status.mjs status 1-30');
    process.exitCode = 1;
    return;
  }

  const catalogue = JSON.parse(await readFile(cataloguePath, 'utf8'));
  const targets = expandTargets(rawTargets);
  const directories = (await readdir(repositoryRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'));

  for (const projectNumber of targets) {
    const project = catalogue[projectNumber - 1];
    if (!project) {
      console.warn(`${projectNumber}: no catalogue project exists.`);
      continue;
    }

    const folder = findFolder(project, directories);
    if (!folder) {
      console.warn(`${projectNumber}: ${project.title} folder was not found.`);
      continue;
    }

    const markerPath = path.join(repositoryRoot, folder.name, markerName);

    if (action === 'complete') {
      await writeFile(
        markerPath,
        'This marker intentionally tells the main README tracker that the project is complete.\n',
        'utf8'
      );
      console.log(`✅ ${projectNumber}. ${project.title}`);
    } else if (action === 'in-progress') {
      await rm(markerPath, { force: true });
      console.log(`🚧 ${projectNumber}. ${project.title}`);
    } else {
      const completed = await pathExists(markerPath);
      console.log(`${completed ? '✅' : '🚧'} ${projectNumber}. ${project.title}`);
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
