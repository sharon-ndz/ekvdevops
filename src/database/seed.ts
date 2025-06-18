import 'reflect-metadata';
import { runSeeders } from 'typeorm-extension';
import dataSource from '../config/typeorm.config';

async function runSeeds() {
  try {
    // dataSource is already initialized in typeorm.config.ts
    await dataSource.initialize();
    await runSeeders(dataSource);
    console.log('Seeding completed!');
    process.exit();
  } catch (err) {
    console.error('Error during seeding:', err);
    process.exit(1);
  }
}

runSeeds().then((r) => {
  console.log('Seeding completed!', r);
});
