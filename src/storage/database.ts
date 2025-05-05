import { Constituent } from "../models/Constituent";
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(__dirname, '../../data/constituents.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// Load existing data or initialize empty Map
let constituents: Map<string, Constituent>;
try {
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  const jsonData = JSON.parse(data);
  constituents = new Map(Object.entries(jsonData));
} catch (error) {
  constituents = new Map<string, Constituent>();
}

// Helper function to save data to file
function saveData(): void {
  const jsonData = Object.fromEntries(constituents);
  fs.writeFileSync(DATA_FILE, JSON.stringify(jsonData, null, 2));
}

// Helper function to add or update a constituent
export function upsertConstituent(constituent: Constituent): void {
  const existingConstituent = constituents.get(constituent.email);
  
  if (existingConstituent) {
    // Merge the new data with existing data, preferring newer non-empty values
    const mergedConstituent: Constituent = {
      ...existingConstituent,
      ...constituent,
      // Keep the original ID and signup time
      id: existingConstituent.id,
      signupTime: existingConstituent.signupTime,
      // Only update fields if the new value is not empty
      firstName: constituent.firstName || existingConstituent.firstName,
      lastName: constituent.lastName || existingConstituent.lastName,
      city: constituent.city || existingConstituent.city,
      state: constituent.state || existingConstituent.state,
      zipCode: constituent.zipCode || existingConstituent.zipCode,
      street: constituent.street || existingConstituent.street
    };
    constituents.set(constituent.email, mergedConstituent);
  } else {
    // Generate a unique ID for new constituents
    constituent.id = crypto.randomUUID();
    constituents.set(constituent.email, constituent);
  }
  
  saveData();
}

// Helper function to get all constituents
export function getAllConstituents(): Constituent[] {
  return Array.from(constituents.values());
}

// Helper function to get constituents by date range
export function getConstituentsByDateRange(from: Date, to: Date): Constituent[] {
  return getAllConstituents().filter(c => {
    const signUpDate = new Date(c.signupTime);
    return signUpDate >= from && signUpDate <= to;
  });
}

// Helper function to get constituent by email
export function getConstituentByEmail(email: string): Constituent | undefined {
  return constituents.get(email);
}