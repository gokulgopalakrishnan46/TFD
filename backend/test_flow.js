const axios = require('axios');

async function test() {
    try {
        console.log("1. Logging in as guest...");
        const loginRes = await axios.post('http://localhost:5000/api/auth/guest');
        const token = loginRes.data.token;
        console.log("   Success! Token received.");

        console.log("\n2. Creating Transaction (Fraud Scenario: High Amount Transfer)...");
        const txData = {
            type: "NEFT", // Maps to TRANSFER
            amount: 900000, // Very High Amount
            accountBalance: 50000,
            transactionDuration: 60,
            loginAttempts: 1
        };

        const txRes = await axios.post('http://localhost:5000/api/transactions', txData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("   Success! Transaction Created.");
        console.log("   Result:", txRes.data);

        if (txRes.data.isFraud === true) {
            console.log("\nVERIFICATION PASSED: FRAUD DETECTED!");
        } else {
            console.log("\nVERIFICATION FAILED: Not flagged as fraud.");
            console.log("Full Response:", JSON.stringify(txRes.data, null, 2));
        }

    } catch (error) {
        console.error("\nTEST FAILED:", error.response ? error.response.data : error.message);
    }
}

test();
