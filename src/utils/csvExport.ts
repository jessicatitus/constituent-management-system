import { createObjectCsvWriter } from "csv-writer";
import { Constituent } from "../models/Constituent";
import path from "path";

export async function exportCSV(data: Constituent[]) {
  const filePath = path.join(__dirname, "../../constituents_export.csv");
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: "name", title: "Name" },
      { id: "email", title: "Email" },
      { id: "address", title: "Address" },
      { id: "signupTime", title: "SignupTime" }
    ]
  });
  await csvWriter.writeRecords(data);
  return filePath;
}