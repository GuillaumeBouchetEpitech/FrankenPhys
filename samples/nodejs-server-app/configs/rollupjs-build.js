import { rollup } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace'
import * as fs from 'fs';

const _getBuildOptions = () => {
  const buildOptionsRegex = /build-options-(debug|release)/;

  // start at 2 (since 0 is "node", and 1 is "rollup")
  for (let ii = 2; ii < process.argv.length; ++ii) {
    const capture = buildOptionsRegex.exec(process.argv[ii]);
    if (!capture) {
      continue;
    }

    return { isRelease: capture[1] === 'release' };
  }

  throw new Error('missing build options argument, stopping now');
};

const buildOptions = _getBuildOptions();

//
//
//

const asyncBuild = async ({
  name,
  tsConfigFilePath,
  inputFilePath,
  outputFilePath,
}) => {

  console.log(` -> BUILDING ${name}`);
  const startTime = Date.now();

  const plugins = [
    typescript({ tsconfig: tsConfigFilePath }),
    commonjs(),
    nodeResolve(),
    replace({
      preventAssignment: true,
      // remove word boundaries
      delimiters: ['', ''],
      // remove what would become 'require(@bulletjs)'
      values: {
        // "import bulletJs from \"bulletJs\";": "",
        "var bulletjs = require('@bulletjs');": "",
      },
    }),
  ];

  if (buildOptions.isRelease) {
    plugins.push(terser({
      format: { comments: false },
      compress: { passes: 3 },
    }));
  }

  const inputOptions = {
    external: [
      '@bulletjs'
    ],
    input: inputFilePath,
    plugins,
  };
  const outputOptions = {
    file: outputFilePath,
    format: 'cjs',
  };

  let bundle;
  let buildFailed = false;
  try {
    bundle = await rollup(inputOptions);
    await bundle.write(outputOptions);
  } catch (error) {
    buildFailed = true;
    console.log('ERROR.result', error);
  } finally {
    if (bundle) {
      await bundle.close();
    }
  }

  if (buildFailed) {
    return;
  }

  const endTime = Date.now();
  const elapsedTime = ((endTime - startTime) / 1000).toFixed(3);

  console.log(`    -> BUILT ${name} (${elapsedTime}sec)`);
  const statData = fs.statSync(outputFilePath);
  console.log(`      -> SIZE ${Math.ceil(statData.size / 1024)}ko`);
}

const asyncRun = async () => {
  await Promise.all([
    asyncBuild({
      name: 'main',
      tsConfigFilePath: `${__dirname}/../tsconfig.json`,
      inputFilePath: `${__dirname}/../src/main.ts`,
      outputFilePath: `${__dirname}/../dist/bundle.js`,
    }),
  ]);
};
asyncRun();



