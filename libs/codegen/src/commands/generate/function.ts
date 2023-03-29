import { Command, Flags } from '@oclif/core';
import { camelCase, paramCase } from 'change-case';
import { execSync } from 'child_process';
import { watch as watchFiles } from 'chokidar';
import * as glob from 'fast-glob';
import { ensureDir, readJSONSync, writeFileSync } from 'fs-extra';
import * as path from 'path';
import { generateFunction } from '../../generators/generateFunction';
import { IsolateFunctionMetadata } from '../../types';

export default class GenerateFunctionCommand extends Command {
  static description =
    'Generate fal serverless functions from a path containing Python files';

  // static examples = ['$ ksjs generate:functions'];

  static flags = {
    include: Flags.string({
      char: 'i',
      description: 'A path pattern (accepts pattern matching/glob)',
      required: true,
    }),
    out: Flags.string({
      char: 'o',
      description: 'The output directory',
      required: true,
    }),
    python: Flags.string({
      char: 'p',
      description: 'Path to a python environment',
      required: false,
      default: null,
    }),
    watch: Flags.boolean({
      char: 'w',
      description: 'Watch for changes and regenerate code',
      required: false,
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(GenerateFunctionCommand);
    const { include, out, python, watch } = flags;
    const commands: string[] = [];
    if (python !== null) {
      commands.push('source ' + python + '/bin/activate');
    }

    const tmp = 'tmp/.fal/serverless/generated';
    await ensureDir(tmp);
    commands.push(
      `koldstart generate metadata --include="${include}" --out="${tmp}"`
    );

    const executeCommand = () => {
      execSync(commands.join(' && '), {
        shell: 'bash',
      });
    };

    const generateFiles = async () => {
      // NOTE: this can be improved, a lot!
      console.log('Generating files...');
      const metadataFiles = await glob(`${tmp}/**/*.json`);

      for (const metadataFile of metadataFiles) {
        const metadata = readJSONSync(metadataFile) as IsolateFunctionMetadata;
        const sourceCode = generateFunction(metadata);

        const folder = paramCase(
          path.parse(path.relative(tmp, metadataFile)).dir
        );
        const filename = `${camelCase(metadata.name)}.ts`;
        const outputPath = path.join(out, folder);
        await ensureDir(outputPath);
        writeFileSync(path.join(outputPath, filename), sourceCode);
      }
    };

    executeCommand();
    if (watch) {
      const watcher = watchFiles(include);
      watcher.on('all', async () => {
        // TODO update only changed files
        executeCommand();
        await generateFiles();
      });
    } else {
      await generateFiles();
    }

    return;
  }
}
