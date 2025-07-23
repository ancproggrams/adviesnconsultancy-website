
#!/bin/bash

BASE_URL="http://localhost:3001"
echo "🧪 Starting NextAuth login flow test..."

# Test 1: Get CSRF token
echo "📋 Step 1: Getting CSRF token..."
CSRF_RESPONSE=$(curl -s "${BASE_URL}/api/auth/csrf")
echo "CSRF Response: $CSRF_RESPONSE"

CSRF_TOKEN=$(echo $CSRF_RESPONSE | grep -o '"csrfToken":"[^"]*"' | cut -d'"' -f4)
echo "Extracted CSRF Token: $CSRF_TOKEN"

# Test 2: Check signin page
echo "📄 Step 2: Testing signin page..."
SIGNIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/auth/signin")
echo "Signin page status: $SIGNIN_STATUS"

# Test 3: Test providers endpoint
echo "🔧 Step 3: Testing providers..."
PROVIDERS_RESPONSE=$(curl -s "${BASE_URL}/api/auth/providers")
echo "Providers response: $PROVIDERS_RESPONSE"

# Test 4: Attempt login with credentials
echo "🔑 Step 4: Attempting login with credentials..."
LOGIN_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=admin@adviesnconsultancy.nl&password=adminpassword123&csrfToken=${CSRF_TOKEN}&callbackUrl=${BASE_URL}/admin" \
  "${BASE_URL}/api/auth/callback/credentials" \
  -w "HTTP_STATUS:%{http_code}")

echo "Login response: $LOGIN_RESPONSE"

# Test 5: Alternative signin approach
echo "🔄 Step 5: Alternative signin approach..."
ALT_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@adviesnconsultancy.nl","password":"adminpassword123","redirect":false}' \
  "${BASE_URL}/api/auth/signin/credentials" \
  -w "HTTP_STATUS:%{http_code}")

echo "Alternative login response: $ALT_RESPONSE"

# Test 6: Check session
echo "👤 Step 6: Testing session..."
SESSION_RESPONSE=$(curl -s "${BASE_URL}/api/auth/session")
echo "Session response: $SESSION_RESPONSE"

echo "🏁 Login flow test completed. Checking logs..."

# Read the log file
echo "📋 Current NextAuth logs:"
cat nextauth-debug.log
