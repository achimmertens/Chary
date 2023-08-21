const sql = require('mssql');
const { password1 } = require('./config');
const fs = require('fs');

// Konfigurationsobjekt für die Verbindung zum SQL Server
const config = {
  user: 'Hive-achimmertens',
  password: password1,
  server: 'vip.hivesql.io',
  port: 1433,
  database: 'DBHive',
  options: {
    trustServerCertificate: true
  }
};

// Funktion zum Ausführen des SQL-Skripts
async function executeScript() {
  try {
    // Verbindung zum SQL Server herstellen
    await sql.connect(config);

    // SQL-Abfrage aus der Datei lesen
    const query = fs.readFileSync('HiveSQLQuery.sql', 'utf8');

    // SQL-Abfrage ausführen
    const result = await sql.query(query);

    // Ergebnis verarbeiten
    console.log(result.recordset);

    // Verbindung schließen
    await sql.close();
    return result.recordset
  } catch (error) {
    console.error(error);
  }
}

function fillTemplate(recordset) {
  // Vorlagendatei lesen
  const template = fs.readFileSync('ReportTemplate.md', 'utf8');

  // Platzhalter ersetzen
  let filledTemplate = template.replace('[AUTHOR1]', recordset[0].author);
  filledTemplate = filledTemplate.replace('[AUTHOR2]', recordset[1].author);
  // Weitere Platzhalter ersetzen...

  // Aktualisierte Vorlage zurückgeben
  return filledTemplate;
}


// Hauptfunktion
async function main() {
  try {
    // SQL-Skript ausführen
    const recordset = await executeScript();

    // Vorlage mit Recordset füllen
    const filledTemplate = fillTemplate(recordset);

    // Aktualisierte Vorlage in eine neue Datei schreiben
    fs.writeFileSync('FilledReportTemplate.md', filledTemplate);

    console.log('Das FilleTemplate sieht so aus: ', filledTemplate);
  } catch (error) {
    console.error(error);
  }
}

// Hauptfunktion aufrufen
main();








