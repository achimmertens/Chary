const sql = require('mssql');
const { password1 } = require('./config');

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

    // SQL-Skript ausführen
    const result = await sql.query(`
      SELECT 
        author, root_title, last_update, url, body, total_vote_weight
      FROM 
        Comments 
      WHERE CONTAINS(body, '"!CHARY"')
        AND body LIKE '%!CHARY%' COLLATE Latin1_General_CS_AS
      ORDER BY last_update DESC;
    `);

    // Ergebnis verarbeiten
    console.log(result.recordset);

    // Verbindung schließen
    await sql.close();
  } catch (error) {
    console.error(error);
  }
}

// SQL-Skript ausführen
executeScript();
