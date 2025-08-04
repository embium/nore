import { build } from 'electron-builder';
import pkg from './package.json';

build({
  linux: ['AppImage', 'deb'],
  win: ['nsis', 'msi'],

  config: {
    appId: `com.${pkg.name}.app`,
    productName: pkg.name,
    artifactName: '${productName}-${version}_${platform}_${arch}.${ext}',
    buildDependenciesFromSource: true,
    files: ['out/**/*'],
    extraResources: [
      {
        from: 'runtimes',
        to: 'runtimes',
        filter: ['**/*'],
      },
    ],
    directories: {
      output: 'release/${version}',
    },
    win: {
      icon: 'src/assets/icons/icon.png',
    },
    linux: {
      icon: 'src/assets/icons/icon.png',
      category: 'Office',
    },
    msi: {
      oneClick: true,
      perMachine: true,
      runAfterFinish: true,
    },
    snap: {
      publish: 'never',
    },
  },
});
