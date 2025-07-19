import { build } from 'electron-builder';
import pkg from './package.json';

build({
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
      target: ['nsis', 'msi'],
      icon: 'src/assets/icons/icon.png',
    },
    linux: {
      target: ['AppImage', 'deb'],
      icon: 'src/assets/icons/icon.png',
      category: 'Office',
    },
    msi: {
      oneClick: true,
      perMachine: true,
      runAfterFinish: true,
    },
  },
});
