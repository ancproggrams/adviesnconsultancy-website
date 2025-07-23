// Test the login form submission directly
async function testLogin() {
    try {
        const response = await fetch('http://localhost:3000/api/auth/csrf');
        const { csrfToken } = await response.json();
        
        console.log('CSRF Token:', csrfToken);
        
        const loginResponse = await fetch('http://localhost:3000/api/auth/callback/credentials', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                email: 'admin@adviesnconsultancy.nl',
                password: 'AdminAccount2024!',
                csrfToken: csrfToken,
                callbackUrl: '/admin',
                json: 'true'
            })
        });
        
        console.log('Login Response Status:', loginResponse.status);
        const result = await loginResponse.text();
        console.log('Login Response:', result);
        
    } catch (error) {
        console.error('Test login error:', error);
    }
}

testLogin();
