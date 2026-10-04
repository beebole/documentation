import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir, tmpdir } from 'node:os'

const here = dirname(fileURLToPath(import.meta.url))
export const REPO_ROOT = resolve(here, '../../../../..')
export const SCENES_DIR = join(REPO_ROOT, '.claude/skills/illustrate/scenes')
export const HELP_DIR = join(REPO_ROOT, 'help')
export const IMAGES_DIR = join(HELP_DIR, 'images')
export const CACHE_DIR = join(homedir(), '.cache/beebole-docs-screenshots')
export const TMP_DIR = join(tmpdir(), 'beebole-docs-screenshots')
