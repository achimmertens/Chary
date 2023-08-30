const axios = require('axios');

async function getMetaData(url) {
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
    const firstImage = match ? match[0] : null;
    const authorReputation = jsonData.post.author_reputation;

    // Rückgabe des Ergebnisses
    return [firstImage, authorReputation];
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = getMetaData;
