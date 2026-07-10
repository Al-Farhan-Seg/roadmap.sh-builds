import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..');
const cataloguePath = path.join(scriptDirectory, 'projects-fallback.json');

function normalize(value) {
  return value
    .toLowerCase()
    .replace(/^\d+[._ -]*/, '')
    .replace(/[^a-z0-9]/g, '');
}

function parseNumberOption(name, fallback) {
  const argument = process.argv.find((item) => item.startsWith(`${name}=`));
  if (!argument) return fallback;

  const value = Number(argument.split('=')[1]);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive whole number.`);
  }
  return value;
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function createIndexHtml(project) {
  const scriptTag = project.needsJavaScript
    ? '    <script src="script.js" defer></script>\n'
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeHtml(project.description || project.title)}">
    <title>${escapeHtml(project.title)}</title>
    <link rel="stylesheet" href="styles.css">
${scriptTag}</head>
<body>
    <main>
        <h1>${escapeHtml(project.title)}</h1>
        <p>Project scaffold ready. Replace this content with the finished interface.</p>
    </main>
</body>
</html>
`;
}

function createStylesCss(project) {
  return `/* ${project.title} */

*,
*::before,
*::after {
    box-sizing: border-box;
}

html {
    color-scheme: light dark;
}

body {
    min-height: 100vh;
    margin: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

/* Add project styles below. */
`;
}

function createScriptJs(project) {
  return `'use strict';

// ${project.title}
// Add project behaviour below.
`;
}

function createProjectReadme(project, projectNumber) {
  const files = [
    '- `index.html` — page structure',
    '- `styles.css` — project styling'
  ];

  if (project.needsJavaScript) {
    files.push('- `script.js` — project behaviour');
  }

  return `# ${project.title}

[View the official project requirements](https://roadmap.sh/projects/${project.slug})

In this project, we will ${project.description
    ? project.description.charAt(0).toLowerCase() + project.description.slice(1)
    : `build the ${project.title} interface`}.

## Status

🚧 In progress

This folder has been scaffolded but is **not counted as complete** until the project is finished and a \`.project-complete\` marker is added.

## Project Information

- **Project number:** ${projectNumber}
- **Difficulty:** ${project.difficulty ?? 'Unclassified'}
- **Focus:** ${project.category ?? 'Frontend'}

## Files

${files.join('\n')}
`;
}

async function writeIfMissing(filePath, content, dryRun) {
  if (dryRun) {
    console.log(`  would create ${path.relative(repositoryRoot, filePath)}`);
    return 'planned';
  }

  try {
    await writeFile(filePath, content, { encoding: 'utf8', flag: 'wx' });
    console.log(`  created ${path.relative(repositoryRoot, filePath)}`);
    return 'created';
  } catch (error) {
    if (error.code === 'EEXIST') {
      console.log(`  kept existing ${path.relative(repositoryRoot, filePath)}`);
      return 'existing';
    }
    throw error;
  }
}

function findExistingFolder(project, directories) {
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
  const dryRun = process.argv.includes('--dry-run');
  const from = parseNumberOption('--from', 1);

  const catalogue = JSON.parse(await readFile(cataloguePath, 'utf8'));
  const to = parseNumberOption('--to', catalogue.length);

  if (from > to) {
    throw new Error('--from cannot be greater than --to.');
  }

  const directories = (await readdir(repositoryRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'));

  let createdFolders = 0;
  let reusedFolders = 0;

  for (const [index, project] of catalogue.entries()) {
    const projectNumber = index + 1;
    if (projectNumber < from || projectNumber > to) continue;

    const existingFolder = findExistingFolder(project, directories);
    const folderName = existingFolder?.name ?? `${projectNumber}-${project.folderSlug ?? project.slug}`;
    const folderPath = path.join(repositoryRoot, folderName);

    console.log(`\n${projectNumber}. ${project.title} -> ${folderName}`);

    if (existingFolder) {
      reusedFolders += 1;
    } else {
      createdFolders += 1;
      if (dryRun) {
        console.log(`  would create folder ${folderName}`);
      } else {
        await mkdir(folderPath, { recursive: true });
        directories.push({ name: folderName, isDirectory: () => true });
        console.log(`  created folder ${folderName}`);
      }
    }

    await writeIfMissing(path.join(folderPath, 'index.html'), createIndexHtml(project), dryRun);
    await writeIfMissing(path.join(folderPath, 'styles.css'), createStylesCss(project), dryRun);

    if (project.needsJavaScript) {
      await writeIfMissing(path.join(folderPath, 'script.js'), createScriptJs(project), dryRun);
    }

    await writeIfMissing(
      path.join(folderPath, 'README.md'),
      createProjectReadme(project, projectNumber),
      dryRun
    );
  }

  console.log('\nScaffolding finished.');
  console.log(`New folders: ${createdFolders}`);
  console.log(`Existing folders reused: ${reusedFolders}`);
  console.log('No .project-complete markers were created, so new scaffolds remain 🚧 in progress.');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
