import * as migration_20260610_164932 from './20260610_164932';
import * as migration_20261124_205413_blog_markdown_publishing from './20261124_205413_blog_markdown_publishing';

export const migrations = [
  {
    up: migration_20260610_164932.up,
    down: migration_20260610_164932.down,
    name: '20260610_164932',
  },
  {
    up: migration_20261124_205413_blog_markdown_publishing.up,
    down: migration_20261124_205413_blog_markdown_publishing.down,
    name: '20261124_205413_blog_markdown_publishing'
  },
];
