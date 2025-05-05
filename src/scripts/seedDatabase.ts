import { generateRandomConstituents } from '../utils/generateConstituents';
import { upsertConstituent } from '../storage/database';

async function seedDatabase() {
  try {
    const constituents = generateRandomConstituents(500);
    console.log('Generated 500 random constituents');
    
    for (const constituent of constituents) {
      upsertConstituent(constituent);
    }
    
    console.log('Successfully seeded database with 500 constituents');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase(); 