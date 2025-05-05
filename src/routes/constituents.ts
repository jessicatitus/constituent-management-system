import express, { Request } from 'express';
import { upsertConstituent, getAllConstituents, getConstituentsByDateRange } from "../storage/database";
import { Constituent } from "../models/Constituent";
import { createObjectCsvWriter } from "csv-writer";
import path from "path";
import { generateRandomConstituents } from "../utils/generateConstituents";
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import fs from 'fs';

const router = express.Router();

// Configure multer for file upload
const upload = multer({ dest: 'uploads/' });

// GET /constituents - List all constituents
router.get("/", (req, res) => {
  res.json(getAllConstituents());
});

// POST /constituents - Add or update a constituent
router.post("/", (req, res) => {
  const incoming: Constituent = req.body;
  
  // Validate required fields
  if (!incoming.email || !incoming.firstName || !incoming.lastName || !incoming.city || !incoming.state || !incoming.zipCode) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Add timestamp if not provided
  if (!incoming.signupTime) {
    incoming.signupTime = new Date().toISOString();
  }

  upsertConstituent(incoming);
  res.status(200).json(incoming);
});

// POST /constituents/seed - Seed the database with random constituents
router.post("/seed", (req, res) => {
  try {
    const count = req.body.count || 500;
    const constituents = generateRandomConstituents(count);
    
    for (const constituent of constituents) {
      upsertConstituent(constituent);
    }
    
    res.json({ message: `Successfully seeded database with ${count} constituents` });
  } catch (error) {
    console.error('Error seeding database:', error);
    res.status(500).json({ error: 'Failed to seed database' });
  }
});

// GET /constituents/export - Export CSV filtered by date range
router.get("/export", async (req, res) => {
  const from = new Date(req.query.from as string);
  const to = new Date(req.query.to as string);

  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return res.status(400).json({ error: "Invalid date range" });
  }

  const filtered = getConstituentsByDateRange(from, to);
  const filePath = path.join(__dirname, "../../constituents_export.csv");

  // Sort constituents by signup time
  const sortedConstituents = [...filtered].sort((a, b) => 
    new Date(a.signupTime).getTime() - new Date(b.signupTime).getTime()
  );

  // Transform the data to combine first and last names and format the date
  const transformedConstituents = sortedConstituents.map(constituent => ({
    ...constituent,
    name: `${constituent.firstName} ${constituent.lastName}`,
    signupTime: new Date(constituent.signupTime).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-')
  }));

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: "name", title: "Name" },
      { id: "email", title: "Email" },
      { id: "street", title: "Street Address" },
      { id: "city", title: "City" },
      { id: "state", title: "State" },
      { id: "zipCode", title: "ZIP Code" },
      { id: "signupTime", title: "Signup Time" }
    ],
    fieldDelimiter: ',',
    recordDelimiter: '\n',
    alwaysQuote: false
  });

  try {
    await csvWriter.writeRecords(transformedConstituents);
    res.download(filePath);
  } catch (error) {
    console.error("Error exporting CSV:", error);
    res.status(500).json({ error: "Error exporting CSV" });
  }
});

// POST /constituents/import - Import constituents from CSV
router.post("/import", upload.single('file'), async (req: Request & { file?: Express.Multer.File }, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const fileContent = await fs.promises.readFile(req.file.path, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    const importedConstituents = records.map((record: any) => ({
      firstName: record['First Name'] || record['Name']?.split(' ')[0] || '',
      lastName: record['Last Name'] || record['Name']?.split(' ')[1] || '',
      email: record['Email'],
      street: record['Street Address'],
      city: record['City'],
      state: record['State'],
      zipCode: record['ZIP Code'],
      signupTime: record['Signup Time'] ? new Date(record['Signup Time']).toISOString() : new Date().toISOString()
    }));

    // Validate and import each constituent
    const results = {
      total: importedConstituents.length,
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const constituent of importedConstituents) {
      try {
        // Basic validation
        if (!constituent.email || !constituent.firstName || !constituent.lastName) {
          throw new Error('Missing required fields');
        }

        upsertConstituent(constituent);
        results.successful++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Failed to import ${constituent.email}: ${error.message}`);
      }
    }

    // Clean up the uploaded file
    await fs.promises.unlink(req.file.path);

    res.json({
      message: `Import completed. ${results.successful} records imported successfully, ${results.failed} failed.`,
      details: results
    });
  } catch (error: any) {
    console.error('Error importing CSV:', error);
    res.status(500).json({ error: 'Failed to process CSV file' });
  }
});

export default router;