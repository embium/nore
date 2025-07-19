import { join } from 'node:path';
import { app } from 'electron';

export function convertCommand(command: string) {
  // Don't return from switch statement, instead use a variable to store the result
  let os_specific_command = '';
  switch (command) {
    case 'python':
      os_specific_command = process.platform === 'win32' ? 'python' : 'python';
      break;
    case 'uvx':
      os_specific_command =
        process.platform === 'win32' ? 'windows/uvx.exe' : 'uvx';
      break;
    case 'node':
      os_specific_command =
        process.platform === 'win32' ? 'windows/node.cmd' : 'node';
      break;
    case 'npx':
      os_specific_command =
        process.platform === 'win32' ? 'windows/npx.cmd' : 'npx';
      break;
    case 'bunx':
      os_specific_command =
        process.platform === 'win32' ? 'windows/bunx.cmd' : 'bunx';
      break;
    default:
      os_specific_command = command;
      break;
  }

  if (os_specific_command === '') {
    throw new Error('Invalid command');
  }

  // Get the correct path for both dev and production
  const getResourcePath = () => {
    if (app.isPackaged) {
      // In production, files are in extraResources
      return process.resourcesPath;
    } else {
      // In development, use the project root
      return join(__dirname, '../..');
    }
  };

  const resourcePath = getResourcePath();
  return join(resourcePath, 'runtimes', os_specific_command);
}
