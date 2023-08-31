const sql = require('mssql');
const { password1 } = require('./config');
const fs = require('fs');
const { dateFrame } = require('./dateFrame.js');
const getMetaData = require('./getMetaData');
const getStakedChary = require('./getStakedChary');

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
async function fillTemplate(dateRange, recordset) {
  // Vorlagendatei lesen
  const template = fs.readFileSync('ReportTemplate.md', 'utf8');

  // Recordset nach charyNumber sortieren
    recordset.sort((a, b) => b.charyNumber - a.charyNumber);

  // Platzhalter ersetzen
  let filledTemplate = template;
  for (let i = 0; i < Math.min(recordset.length, 3); i++) {
    const author = recordset[i].charyNumber ? recordset[i].account : `[AUTHOR${i + 1}]`;
    filledTemplate = filledTemplate.replace(`[AUTHOR${i + 1}]`, author);
    const weburl = recordset[i].charyNumber ? recordset[i].weburl : `[URL${i + 1}]`;
    filledTemplate = filledTemplate.replace(`[URL${i + 1}]`, weburl);
    const body = recordset[i].charyNumber ? recordset[i].body : `[REASON${i + 1}]`;
    filledTemplate = filledTemplate.replace(`[REASON${i + 1}]`, body);

    //const url = "/hive-150210/@alifkhan1995/todays-cleanplanet-activity--day-50---date-22082023-#@alifkhan1995/re-achimmertens-rzu2rc";
    const url = recordset[i].charyNumber ? recordset[i].url : `[URL${i + 1}]`;
    const [firstImageUrl, authorReputation] = await getMetaData(url);
    filledTemplate = filledTemplate.replace(`[IMAGE${i + 1}]`, firstImageUrl);
    console.log ("authorReputation = ", authorReputation);
    recordset[i].originAuthorReputation = authorReputation;
  }

  // Datum im filledTemplate reinschreiben
  dateText = dateFrame(dateRange);
  filledTemplate = filledTemplate.replace(`[DATE_FRAME]`, dateText)

  // Aktualisierte Vorlage zurückgeben
  return filledTemplate;
}

// Filtern der Datensätze basierend auf last_update:
function datefilter(dateRange, recordset) {
  const currentDate = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(currentDate.getDate() - dateRange);

  const dateFilteredRecordset = recordset.filter((item) => {
    const lastUpdate = new Date(item.last_update);
    return lastUpdate >= sevenDaysAgo && lastUpdate <= currentDate;
  });
  return dateFilteredRecordset;
}

async function calculateCharyScore(charyNumber, stakedChary, authorReputation){
  charyNumberMax=10
  if (charyNumber > charyNumberMax){charyNumber=charyNumberMax}
  authorReputationMax=100000000000; //100*10^9
  if (authorReputation>authorReputationMax) {authorReputation=authorReputationMax}
  stakedCharyMax=100000
  if (stakedChary > stakedCharyMax){stakedChary=stakedCharyMax}
  charyNumberPart = charyNumber/charyNumberMax;
  stakedCharyPart = stakedChary/stakedCharyMax;
  authorReputationPart = authorReputation/authorReputationMax;
  console.log("charyNumberPart = ",charyNumberPart,", authorReputationPart = ", authorReputationPart,", stakeCharyPart = ",stakedCharyPart);
  charyScore = 7*charyNumberPart+2*authorReputationPart+1*stakedCharyPart;
  console.log("charyScore = ",charyScore)
  return charyScore;
}

// URL, Account und CharyNumber extrahieren und anhängen:
async function dataExtractAndAppend(dateFilteredRecordset) {
  dateFilteredRecordset.forEach(async (item) => {
    item.charyNumber = extractNumberFromChary(item.body);
    item.account = extractAccountFromUrl(item.url);
    item.weburl = modifyUrl(item.url);
    console.log ("dataExtractAndAppend - Author der !CHARY-Meldung:", item.author);
    item.stakedChary = await getStakedChary(item.author)
    const [firstImageUrl, authorReputation] = await getMetaData(item.url);
    item.originAuthorReputation = authorReputation;
    item.firstImageUrl = firstImageUrl
    item.charyScore= await calculateCharyScore(item.charyNumber, item.stakedChary, authorReputation);
  });
}

// Filtern, dass anobel (und später weitere Peronen) nicht ausgewertet werden
function blackList(blackListedAccount, dateFilteredRecordset) {
  const blacklistFilteredRecordset = dateFilteredRecordset.filter((item) => {
    return item.account !== blackListedAccount;
  });
  return blacklistFilteredRecordset;
}

// Hauptfunktion
async function main() {
  const dateRange = 14 // Number of days, that we want to observe in the dataset
  const datasource = 'file'  // 'sql' or 'file'
  let recordset; // Variable initialisieren für die If-Klausel

  try {
    if (datasource == 'sql') {
      // SQL-Skript ausführen
      recordset = await executeScript();
      fs.writeFileSync('exampleRecordSet2.json', JSON.stringify(recordset));
    }
    else {
      // Alternativ: JSON-Datei einlesen
      const data = await fs.promises.readFile('exampleRecordSet2.json', 'utf8');
      recordset = JSON.parse(data);
    }

    // Datensatz auf dateRange Tage begrenzen
    const dateFilteredRecordset = datefilter(dateRange, recordset);

    // URL, Account und CharyNumber extrahieren und anhängen:
    await dataExtractAndAppend(dateFilteredRecordset);

    // Filtern, dass anobel (und später weitere Peronen) nicht ausgewertet werden
    var blacklistFilteredRecordset = blackList('anobel', dateFilteredRecordset);

    // Recordset nach charyNumber sortieren
    blacklistFilteredRecordset.sort((a, b) => b.charyNumber - a.charyNumber);

    // Vorlage mit Recordset füllen
    var filledTemplate = await fillTemplate(dateRange, blacklistFilteredRecordset);

    console.log('Der BlacklistedRecordSet sieht so aus: ', JSON.stringify(blacklistFilteredRecordset));
    console.log('Das FilledTemplate sieht so aus: ', filledTemplate);

    fs.writeFileSync('changedRecordSet.json', JSON.stringify(blacklistFilteredRecordset));
    // Aktualisierte Vorlage in eine neue Datei schreiben
    fs.writeFileSync('FilledReportTemplate.md', filledTemplate);

  } catch (error) {
    console.error(error);
  }
}

// Hauptfunktion aufrufen
main();

// ToDO: URL vom ersten Bild einfügen -> done
// ToDo: Reputation vom Autor einfügen -> done
// TODO: StakedChary vom Autor einfügen
// ToDO: CharyNumber+Reputation+StakedChary sinnvoll addieren <- Danach sortieren