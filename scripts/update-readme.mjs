import { access, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..');

const readmePath = path.join(repositoryRoot, 'README.md');
const cataloguePath = path.join(scriptDirectory, 'projects-fallback.json');

const PROJECT_BASE_URL = 'https://roadmap.sh/projects';
const START_MARKER = '<!-- PROJECTS:START -->';
const END_MARKER = '<!-- PROJECTS:END -->';
const COMPLETE_MARKER = '.project-complete';
const NUMBERED_FOLDER_PATTERN = /^(\d+)-(.+)$/;

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function normalize(value = '') {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function validateCatalogue(projects) {
  if (!Array.isArray(projects) || projects.length === 0) {
    throw new Error(
      'scripts/projects-fallback.json must contain a non-empty JSON array.'
    );
  }

  const seenSlugs = new Set();

  projects.forEach((project, index) => {
    const projectNumber = index + 1;

    if (!project || typeof project !== 'object' || Array.isArray(project)) {
      throw new Error(`Catalogue entry ${projectNumber} must be an object.`);
    }

    if (typeof project.slug !== 'string' || project.slug.trim() === '') {
      throw new Error(
        `Catalogue entry ${projectNumber} must have a valid "slug".`
      );
    }

    if (typeof project.title !== 'string' || project.title.trim() === '') {
      throw new Error(
        `Catalogue entry ${projectNumber} must have a valid "title".`
      );
    }

    if (seenSlugs.has(project.slug)) {
      throw new Error(
        `Duplicate project slug in catalogue: ${project.slug}`
      );
    }

    seenSlugs.add(project.slug);
  });
}

async function scanLocalProjects() {
  const entries = await readdir(repositoryRoot, {
    withFileTypes: true
  });

  const projectsByNumber = new Map();

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const match = entry.name.match(NUMBERED_FOLDER_PATTERN);

    if (!match) {
      continue;
    }

    const number = Number(match[1]);
    const folderSlug = match[2];

    if (projectsByNumber.has(number)) {
      const existingProject = projectsByNumber.get(number);

      throw new Error(
        `Duplicate project number ${number}: ` +
          `${existingProject.folder} and ${entry.name}.`
      );
    }

    const directoryPath = path.join(repositoryRoot, entry.name);

    projectsByNumber.set(number, {
      number,
      folder: entry.name,
      folderSlug,
      normalizedFolderSlug: normalize(folderSlug),
      folderPath: `./${encodeURI(entry.name)}/`,
      completed: await pathExists(
        path.join(directoryPath, COMPLETE_MARKER)
      )
    });
  }

  return projectsByNumber;
}

function matchLocalProject(
  project,
  projectNumber,
  localProjectsByNumber
) {
  const localProject = localProjectsByNumber.get(projectNumber);

  if (!localProject) {
    return null;
  }

  const expectedSlugs = new Set(
    [project.folderSlug, project.slug]
      .filter(
        (value) =>
          typeof value === 'string' &&
          value.trim() !== ''
      )
      .map(normalize)
  );

  if (!expectedSlugs.has(localProject.normalizedFolderSlug)) {
    const expectedFolderSlug =
      project.folderSlug ?? project.slug;

    throw new Error(
      `Project ${projectNumber} (${project.title}) is expected in ` +
        `"${projectNumber}-${expectedFolderSlug}", but found ` +
        `"${localProject.folder}". No files were changed.`
    );
  }

  return localProject;
}

function buildTracker(projects, localProjectsByNumber) {
  let completedCount = 0;
  let inProgressCount = 0;

  const rows = projects.map((project, index) => {
    const projectNumber = index + 1;

    const localProject = matchLocalProject(
      project,
      projectNumber,
      localProjectsByNumber
    );

    const completed = Boolean(localProject?.completed);

    if (completed) {
      completedCount += 1;
    } else if (localProject) {
      inProgressCount += 1;
    }

    const status = completed
      ? '✅'
      : localProject
        ? '🚧'
        : '⬜';

    const officialUrl =
      project.url ??
      `${PROJECT_BASE_URL}/${project.slug}`;

    const officialLink =
      `[${project.title}](${officialUrl})`;

    const localLink = localProject
      ? `[${completed ? 'View project' : 'Open folder'}](${localProject.folderPath})`
      : 'Not added yet';

    const difficulty =
      project.difficulty ?? '—';

    const focus =
      project.focus ??
      project.category ??
      '—';

    return (
      `| ${projectNumber} | ${status} | ` +
      `${difficulty} | ${focus} | ` +
      `${officialLink} | ${localLink} |`
    );
  });

  const total = projects.length;

  const notStartedCount =
    total - completedCount - inProgressCount;

  const percentage =
    total === 0
      ? 0
      : Math.round(
          (completedCount / total) * 100
        );

  const badgeColour =
    completedCount === total
      ? '22c55e'
      : '0ea5e9';

  const progressBadge =
    `https://img.shields.io/badge/Progress-` +
    `${completedCount}%2F${total}-` +
    `${badgeColour}?style=flat-square`;

  const content = [
    `![Progress](${progressBadge}) ` +
      `**${completedCount}/${total} complete (${percentage}%)** · ` +
      `**${inProgressCount} in progress** · ` +
      `**${notStartedCount} not started**`,
    '',
    '| # | Status | Level | Focus | Official Project | Local Solution |',
    '|---:|:------:|---|---|---|---|',
    ...rows,
    '',
    '_Legend: ✅ complete (`.project-complete` present) · ' +
      '🚧 scaffolded/in progress · ⬜ not added_'
  ].join('\n');

  return {
    completedCount,
    inProgressCount,
    notStartedCount,
    content
  };
}

async function updateReadme() {
  const [
    readme,
    catalogueContent,
    localProjectsByNumber
  ] = await Promise.all([
    readFile(readmePath, 'utf8'),
    readFile(cataloguePath, 'utf8'),
    scanLocalProjects()
  ]);

  let projects;

  try {
    projects = JSON.parse(catalogueContent);
  } catch (error) {
    throw new Error(
      `Could not parse projects-fallback.json: ${error.message}`
    );
  }

  validateCatalogue(projects);

  const localNumbers = [
    ...localProjectsByNumber.keys()
  ];

  const highestLocalNumber =
    localNumbers.length > 0
      ? Math.max(...localNumbers)
      : 0;

  /*
   * Safety protection:
   * Never generate a shortened tracker when higher-numbered
   * local project folders still exist.
   */
  if (highestLocalNumber > projects.length) {
    throw new Error(
      `The catalogue contains ${projects.length} projects, ` +
        `but local folder ${highestLocalNumber}-... exists. ` +
        'Refusing to generate a shortened tracker.'
    );
  }

  const startIndex =
    readme.indexOf(START_MARKER);

  const endIndex =
    readme.indexOf(END_MARKER);

  if (
    startIndex === -1 ||
    endIndex === -1 ||
    endIndex < startIndex
  ) {
    throw new Error(
      `README.md must contain ${START_MARKER} and ${END_MARKER}.`
    );
  }

  const tracker = buildTracker(
    projects,
    localProjectsByNumber
  );

  const updatedReadme =
    `${readme.slice(
      0,
      startIndex + START_MARKER.length
    )}\n\n` +
    `${tracker.content}\n\n` +
    readme.slice(endIndex);

  console.log(
    `Loaded ${projects.length} trusted catalogue projects.`
  );

  console.log(
    `Found ${localProjectsByNumber.size} numbered project folders.`
  );

  console.log(
    `Status: ${tracker.completedCount} complete, ` +
      `${tracker.inProgressCount} in progress, ` +
      `${tracker.notStartedCount} not created.`
  );

  if (updatedReadme === readme) {
    console.log(
      'README project tracker is already current.'
    );
    return;
  }

  await writeFile(
    readmePath,
    updatedReadme,
    'utf8'
  );

  console.log(
    'Updated only the generated project tracker in README.md.'
  );

  console.log(
    'scripts/projects-fallback.json was not modified.'
  );
}

updateReadme().catch((error) => {
  console.error(
    `README update failed: ${error.message}`
  );

  process.exitCode = 1;
});