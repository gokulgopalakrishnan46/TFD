import axios from 'axios';

const backendUrl = 'http://127.0.0.1:5000/api/auth';

async function testAuth() {
    console.log('--- Testing Registration ---');
    try {
        const regRes = await axios.post(`${backendUrl}/register`, {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        });
        console.log('Registration Success:', regRes.data);
    } catch (err) {
        console.error('Registration Failed:', err.response?.status, err.response?.data || err.message);
    }

    console.log('\n--- Testing Login ---');
    try {
        const loginRes = await axios.post(`${backendUrl}/login`, {
            email: 'test@example.com',
            password: 'password123'
        });
        console.log('Login Success:', loginRes.data);
    } catch (err) {
        console.error('Login Failed:', err.response?.status, err.response?.data || err.message);
    }
}

testAuth();
