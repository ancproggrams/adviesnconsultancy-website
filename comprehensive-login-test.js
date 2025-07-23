
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testLoginFlow() {
  console.log('🧪 Starting comprehensive login test...');
  
  try {
    // Step 1: Clear the log file first
    console.log('📝 Clearing log file...');
    const { logToFile, clearLogFile } = require('./lib/logger.ts');
    
    // Step 2: Get CSRF token first
    console.log('🔐 Getting CSRF token...');
    const csrfResponse = await axios.get(`${BASE_URL}/api/auth/csrf`);
    const csrfToken = csrfResponse.data.csrfToken;
    console.log('✅ CSRF token received:', csrfToken);

    // Step 3: Test the signin page
    console.log('📄 Testing signin page...');
    const signinPageResponse = await axios.get(`${BASE_URL}/api/auth/signin`);
    console.log('✅ Signin page status:', signinPageResponse.status);

    // Step 4: Attempt login with admin credentials
    console.log('🔑 Attempting login with admin credentials...');
    
    const loginData = {
      email: 'admin@adviesnconsultancy.nl',
      password: 'adminpassword123',
      csrfToken: csrfToken,
      callbackUrl: `${BASE_URL}/admin`,
      json: true
    };

    console.log('📤 Sending login request...');
    const loginResponse = await axios.post(
      `${BASE_URL}/api/auth/callback/credentials`,
      new URLSearchParams(loginData),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        maxRedirects: 0,
        validateStatus: function (status) {
          return status < 500; // Don't throw error for redirects
        }
      }
    );

    console.log('📥 Login response status:', loginResponse.status);
    console.log('📥 Login response headers:', loginResponse.headers);
    
    if (loginResponse.status === 302) {
      console.log('🔄 Redirect detected to:', loginResponse.headers.location);
    }

    // Step 5: Try alternative signin approach
    console.log('🔄 Trying alternative signin approach...');
    const altLoginResponse = await axios.post(
      `${BASE_URL}/api/auth/signin/credentials`,
      {
        email: 'admin@adviesnconsultancy.nl',
        password: 'adminpassword123',
        redirect: false
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        validateStatus: function (status) {
          return status < 500;
        }
      }
    );

    console.log('📥 Alternative login response status:', altLoginResponse.status);
    console.log('📥 Alternative login response data:', altLoginResponse.data);

    // Step 6: Test session endpoint
    console.log('👤 Testing session endpoint...');
    const sessionResponse = await axios.get(`${BASE_URL}/api/auth/session`);
    console.log('✅ Session response:', sessionResponse.data);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📥 Response status:', error.response.status);
      console.error('📥 Response data:', error.response.data);
    }
  }

  console.log('🏁 Login test completed');
}

// Run the test
testLoginFlow();
