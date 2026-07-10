# Setup Guide

See the assistant response for the recommended installation order. The essential commands are:

```bash
node scripts/project-status.mjs complete 1-7
node scripts/scaffold-projects.mjs --from=8
node scripts/update-readme.mjs
git add .
git commit -m "chore: add project scaffolds and README automation"
git push origin main
```
