const axios = require('axios');

async function fetchData() {
  const url = 'https://api.hive-engine.com/rpc/contracts';
  const requestBody = {
    jsonrpc: '2.0',
    id: 1,
    method: 'find',
    params: {
      contract: 'tokens',
      table: 'balances',
      query: {
        account: 'elkezaksek'
      },
      limit: 1000,
      offset: 0,
      indexes: ''
    }
  };

  try {
    const response = await axios.post(url, requestBody);
    const data = response.data;
    console.log(data);
    // Weitere Verarbeitung der Daten...
    console.log("Staked Chary = ", data.result[0])
  } catch (error) {
    console.error(error);
  }
}

fetchData();




