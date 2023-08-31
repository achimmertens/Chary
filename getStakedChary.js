const axios = require('axios');

async function getStakedChary(author) {
    const url = 'https://api.hive-engine.com/rpc/contracts';
    const requestBody = {
        jsonrpc: '2.0',
        id: 1,
        method: 'find',
        params: {
            contract: 'tokens',
            table: 'balances',
            query: {
                account: author
            },
            limit: 1000,
            offset: 0,
            indexes: ''
        }
    };

    try {
        const response = await axios.post(url, requestBody);
        const data = response.data;
        // Extrahieren des gewünschten Elements
        const jsonData = data.result;
        const charyElement = jsonData.find(item => item.symbol === 'CHARY');
        const stakeValue = charyElement ? charyElement.stake : null;

        // Loggen des Ergebnisses
        console.log("Staked CHARY = ", stakeValue);
        return stakeValue;

    } catch (error) {
        console.error(error);
        return null;
    }
}

//getStakedChary();

module.exports = getStakedChary;



