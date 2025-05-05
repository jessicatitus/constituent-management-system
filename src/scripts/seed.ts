import { generateRandomConstituents } from '../utils/generateConstituents';
import { upsertConstituent } from '../storage/database';

async function seedDatabase() {
  try {
    const constituents = generateRandomConstituents(500);
    
    for (const constituent of constituents) {
      await upsertConstituent(constituent);
    }
    
    console.log('Successfully seeded database with 500 random constituents');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase(); 