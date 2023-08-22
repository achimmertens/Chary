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

// Funktion zum Extrahieren der Zahl aus der Zeichenkette
function extractNumberFromChary(value) {
  const match = value.match(/!CHARY:(\d+)/);
  if (match) {
    return parseInt(match[1]);
  }
  return null;
}

// Funktion zum Extrahieren des Accountnamens aus der URL
function extractAccountFromUrl(url) {
  const match = url.match(/@([^/]+)/);
  if (match) {
    return '@'+match[1];
  }
  return null;
}

// Funktion zum Modifizieren der URL
function modifyUrl(url) {
  const regex = /\/hive-.*?\/(@.*?)\//;
  const match = url.match(regex);
  if (match) {
    const modifiedUrl = `https://peakd.com${url.split('#')[0]}`;
    return modifiedUrl;
  }
  return null;
}



// Hauptfunktion
async function main() {
  try {
    // SQL-Skript ausführen
   // const recordset = await executeScript();
   // fs.writeFileSync('exampleRecordSet.json', JSON.stringify(recordset));

    // Alternativ: JSON-Datei einlesen
    const data = await fs.promises.readFile('exampleRecordSet.json', 'utf8');
    const recordset = JSON.parse(data);

    // Zahl aus der Zeichenkette extrahieren und in einer zusätzlichen Variable speichern
    recordset.forEach((item) => {
      item.charyNumber = extractNumberFromChary(item.body);
      item.account = extractAccountFromUrl(item.url);
      item.weburl = modifyUrl(item.url);
    });

    /*
    // Accountnamen aus der URL extrahieren und in einer zusätzlichen Variable speichern
    recordset.forEach((item) => {
      item.account = extractAccountFromUrl(item.url);
    });

    recordset.forEach((item) => {
      item.weburl = modifyUrl(item.url);
    });
    */

    // Vorlage mit Recordset füllen
    const filledTemplate = fillTemplate(recordset);

    fs.writeFileSync('changedRecordSet.json', JSON.stringify(recordset));
    // Aktualisierte Vorlage in eine neue Datei schreiben
    fs.writeFileSync('FilledReportTemplate.md', filledTemplate);

    console.log('Das FilledTemplate sieht so aus: ', filledTemplate);
  } catch (error) {
    console.error(error);
  }
}

// Hauptfunktion aufrufen
main();








