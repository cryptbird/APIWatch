const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const repoRoot = path.join(__dirname, '..');
const json = JSON.parse(fs.readFileSync(path.join(repoRoot, 'git_commits.json'), 'utf-8'));
const byDate = json.additional_commits?.by_date || {};
const dates = Object.keys(byDate).sort();

let count = 0;
for (const d of dates) {
  for (const c of byDate[d]) {
    const dt = c.commit_datetime;
    const msg = c.commit_message;
    process.env.GIT_AUTHOR_DATE = dt;
    process.env.GIT_COMMITTER_DATE = dt;
    try {
      execSync('git add -A', { cwd: repoRoot, stdio: 'inherit' });
      execSync(`git commit --no-verify --allow-empty -m ${JSON.stringify(msg)}`, { cwd: repoRoot, stdio: 'inherit', env: { ...process.env, GIT_AUTHOR_DATE: dt, GIT_COMMITTER_DATE: dt } });
      count++;
    } catch (e) {
      if (e.status !== 0) throw e;
    }
  }
}
console.log('Done. Commits:', count);
