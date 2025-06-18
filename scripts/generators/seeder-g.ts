import { exec } from 'child_process';
import * as fs from 'fs';
import { exit } from 'process';

const args: any = process.argv.slice(2);
const mName: string = args[0];
const fileName = `${mName}-seeder.ts`;
const command = `ts-node ./node_modules/typeorm-extension/bin/cli.cjs seed:create --name ./src/database/seeders/${fileName}`;

const directoryPath: string = './src/database/seeders'; // Replace with your directory path
const searchString: string = fileName; // Replace with the part of the filename you're searching for

const checkFileString = async (): Promise<[boolean, string]> => {
  try {
    const files: string[] = await fs.readdirSync(directoryPath);
    const fileExists: boolean = files.some((file) => file.includes(searchString));

    if (fileExists) {
      return [false, `A file containing "${searchString}" found in the seeders directory.`];
    }
    return [true, ''];
  } catch (err: any) {
    return [false, `Unable to scan directory: ${err.message}`];
  }
};

checkFileString().then((value) => {
  const [checkStatus, checkMessage] = value;
  if (!checkStatus) {
    console.warn(checkMessage);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    exit;
  } else {
    // run command
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`${stderr}`);
        return;
      }
      console.info(`${stdout}`);
    });
  }
});
