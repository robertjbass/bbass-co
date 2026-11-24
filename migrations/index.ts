import * as migration_20260610_164932 from './20260610_164932';
import * as migration_20261124_205413_blog_markdown_publishing from './20261124_205413_blog_markdown_publishing';
import * as migration_20261124_213951_featured_post from './20261124_213951_featured_post';
import * as migration_20261124_215429_framework_upgrade from './20261124_215429_framework_upgrade';

export const migrations = [
  {
    up: migration_20260610_164932.up,
    down: migration_20260610_164932.down,
    name: '20260610_164932',
  },
  {
    up: migration_20261124_205413_blog_markdown_publishing.up,
    down: migration_20261124_205413_blog_markdown_publishing.down,
    name: '20261124_205413_blog_markdown_publishing',
  },
  {
    up: migration_20261124_213951_featured_post.up,
    down: migration_20261124_213951_featured_post.down,
    name: '20261124_213951_featured_post',
  },
  {
    up: migration_20261124_215429_framework_upgrade.up,
    down: migration_20261124_215429_framework_upgrade.down,
    name: '20261124_215429_framework_upgrade'
  },
];
