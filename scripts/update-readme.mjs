import { access, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..');
const readmePath = path.join(repositoryRoot, 'README.md');
const fallbackPath = path.join(scriptDirectory, 'projects-fallback.json');

const ROADMAP_LIST_URL = 'https://roadmap.sh/frontend/projects';
const ROADMAP_PROJECT_BASE = 'https://roadmap.sh/projects';
const START_MARKER = '<!-- PROJECTS:START -->';
const END_MARKER = '<!-- PROJECTS:END -->';
const COMPLETE_MARKER = '.project-complete';

const ignoredDirectories = new Set([
  '.git',
  '.github',
  '.vscode',
  'assets',
  'dist',
  'docs',
  'node_modules',
  'public',
  'scripts',
  'src',
  'top_assets'
]);

function decodeHtml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function stripTags(value) {
  return decodeHtml(value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
}

function titleFromSlug(slug) {
  const acronyms = new Map([
    ['api', 'API'],
    ['css', 'CSS'],
    ['cv', 'CV'],
    ['github', 'GitHub'],
    ['html', 'HTML'],
    ['js', 'JavaScript'],
    ['ui', 'UI']
  ]);

  return slug
    .split('-')
    .filter((part) => part !== 'js')
    .map((part) => acronyms.get(part) ?? `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join(' ');
}

function unique(values) {
  return [...new Set(values)];
}

function normalize(value) {
  return value
    .toLowerCase()
    .replace(/^\d+[._ -]*/, '')
    .replace(/[^a-z0-9]/g, '');
}

function inferNeedsJavaScript(category, cardText, previousValue = false) {
  if (typeof previousValue === 'boolean') {
    return previousValue;
  }

  const evidence = `${category} ${cardText}`;
  return /javascript|framework|api|frontend/i.test(evidence);
}

function mergeLiveMetadata({ slug, title, cardText }, fallbackProject = {}) {
  const cleanedCardText = stripTags(cardText ?? '');
  const titlePosition = cleanedCardText.toLowerCase().indexOf(title.toLowerCase());
  const prefix = titlePosition >= 0
    ? cleanedCardText.slice(0, titlePosition).trim()
    : '';

  const difficultyMatch = prefix.match(/^(beginner|intermediate|advanced)\b/i);
  const inferredDifficulty = difficultyMatch
    ? difficultyMatch[1][0].toUpperCase() + difficultyMatch[1].slice(1).toLowerCase()
    : undefined;
  const inferredCategory = difficultyMatch
    ? prefix.slice(difficultyMatch[0].length).trim()
    : undefined;

  return {
    slug,
    title,
    folderSlug: fallbackProject.folderSlug ?? slug,
    difficulty: fallbackProject.difficulty ?? inferredDifficulty ?? 'Unclassified',
    category: fallbackProject.category ?? inferredCategory ?? 'Frontend',
    description: fallbackProject.description ?? '',
    needsJavaScript: inferNeedsJavaScript(
      fallbackProject.category ?? inferredCategory ?? '',
      cleanedCardText,
      fallbackProject.needsJavaScript
    )
  };
}

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      accept: 'text/html,application/xhtml+xml',
      'user-agent': 'roadmap-sh-builds-readme-updater/2.0'
    },
    signal: AbortSignal.timeout(20_000)
  });

  if (!response.ok) {
    throw new Error(`Request failed with HTTP ${response.status}: ${url}`);
  }

  return response.text();
}

async function fetchProjectTitle(slug, fallbackProjectsBySlug) {
  const fallbackProject = fallbackProjectsBySlug.get(slug);
  if (fallbackProject?.title) {
    return fallbackProject.title;
  }

  try {
    const html = await fetchText(`${ROADMAP_PROJECT_BASE}/${slug}`);
    const match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
    return match ? stripTags(match[1]) : titleFromSlug(slug);
  } catch {
    return titleFromSlug(slug);
  }
}

async function loadProjectCatalogue() {
  const fallbackContent = await readFile(fallbackPath, 'utf8');
  const fallbackProjects = JSON.parse(fallbackContent);
  const fallbackProjectsBySlug = new Map(
    fallbackProjects.map((project) => [project.slug, project])
  );

  try {
    const html = await fetchText(ROADMAP_LIST_URL);
    const cardTextBySlug = new Map();
    const slugs = [];

    const anchorPattern = /<a\b[^>]*href=["'](?:https:\/\/roadmap\.sh)?\/projects\/([^"'?#/]+)[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi;
    for (const match of html.matchAll(anchorPattern)) {
      const slug = match[1].toLowerCase();
      slugs.push(slug);
      if (!cardTextBySlug.has(slug)) {
        cardTextBySlug.set(slug, match[2]);
      }
    }

    // Some page builds do not expose the entire anchor body in the returned HTML.
    if (slugs.length < 10) {
      const linkPattern = /<a\b[^>]*href=["'](?:https:\/\/roadmap\.sh)?\/projects\/([^"'?#/]+)[^"']*["'][^>]*>/gi;
      for (const match of html.matchAll(linkPattern)) {
        slugs.push(match[1].toLowerCase());
      }
    }

    const orderedSlugs = unique(slugs);
    if (orderedSlugs.length < 10) {
      throw new Error('The live roadmap page returned too few project links.');
    }

    const projects = [];
    for (const slug of orderedSlugs) {
      const title = await fetchProjectTitle(slug, fallbackProjectsBySlug);
      projects.push(
        mergeLiveMetadata(
          { slug, title, cardText: cardTextBySlug.get(slug) ?? '' },
          fallbackProjectsBySlug.get(slug)
        )
      );
    }

    const updatedFallback = `${JSON.stringify(projects, null, 2)}\n`;
    if (updatedFallback !== fallbackContent) {
      await writeFile(fallbackPath, updatedFallback, 'utf8');
      console.log('Updated the fallback project catalogue from roadmap.sh.');
    }

    return projects;
  } catch (error) {
    console.warn(`Using the fallback project catalogue: ${error.message}`);
    return fallbackProjects;
  }
}

async function findReadme(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const readme = entries.find(
    (entry) => entry.isFile() && entry.name.toLowerCase() === 'readme.md'
  );
  return readme ? path.join(directoryPath, readme.name) : null;
}

async function containsProjectFiles(directoryPath, depth = 0) {
  if (depth > 3) return false;

  const entries = await readdir(directoryPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      if (await containsProjectFiles(entryPath, depth + 1)) return true;
      continue;
    }

    if (/\.(html?|css|[cm]?js|jsx|ts|tsx|vue|svelte)$/i.test(entry.name)) {
      return true;
    }

    if (entry.name === 'package.json') return true;
  }

  return false;
}

async function scanLocalProjects() {
  const entries = await readdir(repositoryRoot, { withFileTypes: true });
  const projects = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.') || ignoredDirectories.has(entry.name)) continue;

    const directoryPath = path.join(repositoryRoot, entry.name);
    const [readme, hasProjectFiles, completed] = await Promise.all([
      findReadme(directoryPath),
      containsProjectFiles(directoryPath),
      pathExists(path.join(directoryPath, COMPLETE_MARKER))
    ]);

    if (!readme && !hasProjectFiles && !completed) continue;

    let readmeContent = '';
    if (readme) {
      readmeContent = await readFile(readme, 'utf8');
    }

    const roadmapLinks = [
      ...readmeContent.matchAll(/https?:\/\/(?:www\.)?roadmap\.sh\/projects\/([a-z0-9-]+)/gi)
    ].map((match) => match[1].toLowerCase());

    projects.push({
      folder: entry.name,
      folderPath: `./${encodeURI(entry.name)}/`,
      normalizedFolder: normalize(entry.name),
      roadmapSlugs: new Set(roadmapLinks),
      completed
    });
  }

  return projects;
}

function matchLocalProject(project, localProjects) {
  const candidates = [
    normalize(project.slug),
    normalize(project.title),
    normalize(project.folderSlug ?? '')
  ].filter(Boolean);

  return localProjects.find((localProject) => {
    if (localProject.roadmapSlugs.has(project.slug)) return true;

    return candidates.some((candidate) =>
      localProject.normalizedFolder === candidate ||
      localProject.normalizedFolder.includes(candidate) ||
      candidate.includes(localProject.normalizedFolder)
    );
  });
}

function buildTracker(projects, localProjects) {
  let completedCount = 0;
  let inProgressCount = 0;

  const rows = projects.map((project, index) => {
    const localProject = matchLocalProject(project, localProjects);
    const completed = Boolean(localProject?.completed);

    if (completed) completedCount += 1;
    else if (localProject) inProgressCount += 1;

    const status = completed ? '✅' : localProject ? '🚧' : '⬜';
    const officialLink = `[${project.title}](${ROADMAP_PROJECT_BASE}/${project.slug})`;
    const solution = localProject
      ? `[${completed ? 'View project' : 'Open folder'}](${localProject.folderPath})`
      : 'Not added yet';

    return `| ${index + 1} | ${status} | ${project.difficulty ?? '—'} | ${project.category ?? '—'} | ${officialLink} | ${solution} |`;
  });

  const total = projects.length;
  const notStartedCount = Math.max(total - completedCount - inProgressCount, 0);
  const percentage = total === 0 ? 0 : Math.round((completedCount / total) * 100);
  const badgeColour = completedCount === total ? '22c55e' : '0ea5e9';
  const progressBadge = `https://img.shields.io/badge/Progress-${completedCount}%2F${total}-${badgeColour}?style=flat-square`;

  return [
    '',
    `![Progress](${progressBadge}) **${completedCount}/${total} complete (${percentage}%)** · **${inProgressCount} in progress** · **${notStartedCount} not started**`,
    '',
    '| # | Status | Level | Focus | Official Project | Local Solution |',
    '|---:|:------:|---|---|---|---|',
    ...rows,
    '',
    '_Legend: ✅ complete (`.project-complete` present) · 🚧 scaffolded/in progress · ⬜ not added_',
    ''
  ].join('\n');
}

async function updateReadme() {
  const [readme, projects, localProjects] = await Promise.all([
    readFile(readmePath, 'utf8'),
    loadProjectCatalogue(),
    scanLocalProjects()
  ]);

  const startIndex = readme.indexOf(START_MARKER);
  const endIndex = readme.indexOf(END_MARKER);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error(`README.md must contain ${START_MARKER} and ${END_MARKER}.`);
  }

  const generated = buildTracker(projects, localProjects);
  const updatedReadme = [
    readme.slice(0, startIndex + START_MARKER.length),
    generated,
    readme.slice(endIndex)
  ].join('\n');

  if (updatedReadme === readme) {
    console.log('README project tracker is already current.');
    return;
  }

  await writeFile(readmePath, updatedReadme, 'utf8');
  console.log(`Updated README with ${projects.length} roadmap projects.`);
}

updateReadme().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
