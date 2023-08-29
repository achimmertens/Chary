const axios = require('axios');

async function getFirstImage(url) {
  // Preparieren der URL
  const preparedUrl = `https://hive.blog${url.split('#')[0]}.json`;

  try {
    // Aufrufen der authorUrl mit einem curl-Befehl
    const response = await axios.get(preparedUrl);

    // Extrahieren des ersten Treffers des Feldes "body"
    const jsonData = response.data;
    const body = jsonData.post.body;
    const regex = /!\[.*?\]\((.*?)\)/;
    const match = body.match(regex);
    const firstImage = match ? match[1] : null;

    // Loggen des ersten Treffers des Feldes "body"
    console.log(firstImage);
  } catch (error) {
    console.error(error);
  }
}

// Beispielaufruf der Funktion
const url = "/hive-150210/@alifkhan1995/todays-cleanplanet-activity--day-50---date-22082023-#@alifkhan1995/re-achimmertens-rzu2rc";
getFirstImage(url);
