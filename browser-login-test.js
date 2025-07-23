const { exec } = require('child_process');

async function testBrowserLogin() {
    console.log('Testing browser-style login...');
    
    // First get CSRF token
    const csrfResponse = await fetch('http://localhost:3000/api/auth/csrf');
    const { csrfToken } = await csrfResponse.json();
    console.log('Got CSRF token:', csrfToken);
    
    // Now attempt signin with credentials (this is what the browser form does)
    const signinResponse = await fetch('http://localhost:3000/api/auth/signin/credentials', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            email: 'admin@adviesnconsultancy.nl',
            password: 'AdminAccount2024!',
            csrfToken: csrfToken,
            callbackUrl: '/admin',
            redirect: 'false'
        })
    });
    
    console.log('Signin Response Status:', signinResponse.status);
    console.log('Signin Response Headers:', Object.fromEntries(signinResponse.headers.entries()));
    const result = await signinResponse.text();
    console.log('Signin Response Body:', result);
}

testBrowserLogin().catch(console.error);
