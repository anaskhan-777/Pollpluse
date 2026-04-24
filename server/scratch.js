const axios = require('axios');
const API_KEY = 'zNOCTqSejpWkIKPwnZ51hbJ4ymx8EGMvV7uH2rclfYB9QRs3dXSItzMowaABdU3TJ0P7FRWGjVQ2Cvlq';

async function testFast2SMS() {
  try {
    const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', 
      {
        variables_values: '123456',
        route: 'otp',
        numbers: '9826324339'
      },
      {
        headers: {
          authorization: API_KEY
        }
      }
    );
    console.log("SUCCESS:", response.data);
  } catch (err) {
    console.log("ERROR:", err.response ? err.response.data : err.message);
  }
}

testFast2SMS();
