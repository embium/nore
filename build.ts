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
      icon: 'src/assets/icons',
      category: 'Social',
      executableName: pkg.name,
      desktop: {
        Name: pkg.name,
        Comment: pkg.description,
        Icon: pkg.name,
      },
      // Fix for AppImage and Snap sandbox issues
      asarUnpack: ['**/*.node'],
    },
    msi: {
      oneClick: true,
      perMachine: true,
      runAfterFinish: true,
    },
    snap: {
      confinement: 'classic',
      plugs: [
        'default',
        'desktop',
        'desktop-legacy',
        'home',
        'x11',
        'wayland',
        'unity7',
        'browser-support',
        'network',
        'gsettings',
        'audio-playback',
        'pulseaudio',
        'opengl',
      ],
    },
  },
});
