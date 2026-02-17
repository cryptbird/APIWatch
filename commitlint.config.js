/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'chore', 'refactor', 'test', 'perf', 'ci', 'build'],
    ],
    'subject-case': [2, 'never', ['upper']],
    'header-max-length': [2, 'always', 100],
  },
};
