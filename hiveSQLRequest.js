const sql = require('mssql');
const { password1 } = require('./config');
const fs = require('fs');
//const { dateframe } = require('./dateframe');

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
    return match[1];
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

// Funktion zum Ersetzen der Platzhalter in der Vorlagendatei
function fillTemplate(recordset) {
  // Vorlagendatei lesen
  const template = fs.readFileSync('ReportTemplate.md', 'utf8');

  // Recordset nach charyNumber sortieren
  recordset.sort((a, b) => b.charyNumber - a.charyNumber);

  // Platzhalter ersetzen
  let filledTemplate = template;
  for (let i = 0; i < Math.min(recordset.length, 3); i++) {
    const author = recordset[i].charyNumber ? recordset[i].account : `[AUTHOR${i + 1}]`;
    filledTemplate = filledTemplate.replace(`[AUTHOR${i + 1}]`, author);
  }

  // Aktualisierte Vorlage zurückgeben
  return filledTemplate;
}

// Filtern der Datensätze basierend auf last_update:
function datefilter(daterange, recordset) {
    const currentDate = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(currentDate.getDate() - daterange);

    const dateFilteredRecordset = recordset.filter((item) => {
      const lastUpdate = new Date(item.last_update);
      return lastUpdate >= sevenDaysAgo && lastUpdate <= currentDate;
    });
    return dateFilteredRecordset;
  }

// URL, Account und CharyNumber extrahieren und anhängen:
async function dataExtractAndAppend(dateFilteredRecordset) {
  dateFilteredRecordset.forEach((item) => {
    item.charyNumber = extractNumberFromChary(item.body);
    item.account = extractAccountFromUrl(item.url);
    item.weburl = modifyUrl(item.url);
  });
}

    // Filtern, dass anobel (und später weitere Peronen) nicht ausgewertet werden
    function blackList (blackListedAccount, dateFilteredRecordset) {
    const blacklistFilteredRecordset = dateFilteredRecordset.filter((item) => {
      return item.account !== blackListedAccount;
    });
    return blacklistFilteredRecordset;
  }

// Hauptfunktion
async function main() {
  const dateRange = 7 // Number of days, that we want to observe in the dataset
  try {
    // SQL-Skript ausführen
    // const recordset = await executeScript();
    // fs.writeFileSync('exampleRecordSet2.json', JSON.stringify(recordset));

    // Alternativ: JSON-Datei einlesen
    const data = await fs.promises.readFile('exampleRecordSet2.json', 'utf8');
    const recordset = JSON.parse(data);

    // Datensatz auf dateRange Tage begrenzen
    const dateFilteredRecordset = datefilter(dateRange, recordset);

    // URL, Account und CharyNumber extrahieren und anhängen:
    await dataExtractAndAppend(dateFilteredRecordset);

    // Filtern, dass anobel (und später weitere Peronen) nicht ausgewertet werden
    var blacklistFilteredRecordset = blackList ('anobel', dateFilteredRecordset);

    // Recordset nach charyNumber sortieren
    blacklistFilteredRecordset.sort((a, b) => b.charyNumber - a.charyNumber);

    // Vorlage mit Recordset füllen
    var filledTemplate = fillTemplate(blacklistFilteredRecordset);

    // Platzhalter ersetzen
    for (let i = 0; i < Math.min(blacklistFilteredRecordset.length, 3); i++) {
      const author = blacklistFilteredRecordset[i].charyNumber ? blacklistFilteredRecordset[i].account : `[AUTHOR${i + 1}]`;
      filledTemplate = filledTemplate.replace(`[AUTHOR${i + 1}]`, author);
    }






    fs.writeFileSync('changedRecordSet.json', JSON.stringify(blacklistFilteredRecordset));
    // Aktualisierte Vorlage in eine neue Datei schreiben
    fs.writeFileSync('FilledReportTemplate.md', filledTemplate);

    console.log('Der BlacklistedRecordSet sieht so aus: ', JSON.stringify(blacklistFilteredRecordset));
    console.log('Das FilledTemplate sieht so aus: ', filledTemplate);
  } catch (error) {
    console.error(error);
  }
}

// Hauptfunktion aufrufen
main();








