// Comprehensive API test script
const http = require('http');

const BASE_URL = 'http://localhost:3000';
let testsPassed = 0;
let testsFailed = 0;
const results = [];

function logTest(name, passed, message = '') {
    if (passed) {
        testsPassed++;
        console.log(`✓ ${name} - PASSED`);
        if (message) console.log(`  ${message}`);
    } else {
        testsFailed++;
        console.log(`✗ ${name} - FAILED`);
        if (message) console.log(`  ${message}`);
    }
    results.push({ name, passed, message });
}

function makeRequest(options, expectedStatus, testName) {
    return new Promise((resolve) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                const passed = res.statusCode === expectedStatus;
                logTest(testName, passed, `Status: ${res.statusCode} (expected: ${expectedStatus})`);
                resolve({ status: res.statusCode, data, passed });
            });
        });
        
        req.on('error', (err) => {
            logTest(testName, false, `Error: ${err.message}`);
            resolve({ status: 0, data: '', passed: false });
        });
        
        if (options.body) {
            req.write(options.body);
        }
        req.end();
    });
}

async function runAllTests() {
    console.log('='.repeat(60));
    console.log('Starting Comprehensive API Tests');
    console.log('='.repeat(60));
    console.log('');

    // Test 1: Root endpoint (no auth required)
    console.log('1. Testing Root Endpoint');
    console.log('-'.repeat(60));
    await makeRequest(
        { hostname: 'localhost', port: 3000, path: '/', method: 'GET' },
        200,
        'Root endpoint (/)'
    );
    console.log('');

    // Test 2: Protected endpoints without auth
    console.log('2. Testing Protected Endpoints (No Authentication)');
    console.log('-'.repeat(60));
    const protectedEndpoints = [
        { path: '/users', name: 'GET /users' },
        { path: '/parcels', name: 'GET /parcels' },
        { path: '/riders', name: 'GET /riders' },
        { path: '/payments', name: 'GET /payments' },
        { path: '/parcels/delivery-status/stats', name: 'GET /parcels/delivery-status/stats' },
        { path: '/riders/delivery-per-day', name: 'GET /riders/delivery-per-day' },
    ];

    for (const endpoint of protectedEndpoints) {
        await makeRequest(
            { hostname: 'localhost', port: 3000, path: endpoint.path, method: 'GET' },
            401,
            endpoint.name + ' (no auth)'
        );
    }
    console.log('');

    // Test 3: Protected endpoints with invalid token
    console.log('3. Testing Protected Endpoints (Invalid Token)');
    console.log('-'.repeat(60));
    for (const endpoint of protectedEndpoints) {
        await makeRequest(
            {
                hostname: 'localhost',
                port: 3000,
                path: endpoint.path,
                method: 'GET',
                headers: { 'Authorization': 'Bearer invalid_token_12345' }
            },
            401,
            endpoint.name + ' (invalid token)'
        );
    }
    console.log('');

    // Test 4: User-specific endpoints
    console.log('4. Testing User-Specific Endpoints');
    console.log('-'.repeat(60));
    await makeRequest(
        { hostname: 'localhost', port: 3000, path: '/users/507f1f77bcf86cd799439011', method: 'GET' },
        401,
        'GET /users/:id (no auth)'
    );
    await makeRequest(
        { hostname: 'localhost', port: 3000, path: '/users/test@example.com/role', method: 'GET' },
        401,
        'GET /users/:email/role (no auth)'
    );
    console.log('');

    // Test 5: Parcel-specific endpoints
    console.log('5. Testing Parcel-Specific Endpoints');
    console.log('-'.repeat(60));
    await makeRequest(
        { hostname: 'localhost', port: 3000, path: '/parcels/507f1f77bcf86cd799439011', method: 'GET' },
        401,
        'GET /parcels/:id (no auth)'
    );
    await makeRequest(
        { hostname: 'localhost', port: 3000, path: '/parcels/rider', method: 'GET' },
        401,
        'GET /parcels/rider (no auth)'
    );
    await makeRequest(
        {
            hostname: 'localhost',
            port: 3000,
            path: '/parcels',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ test: 'data' })
        },
        401,
        'POST /parcels (no auth)'
    );
    console.log('');

    // Test 6: Tracking endpoints
    console.log('6. Testing Tracking Endpoints');
    console.log('-'.repeat(60));
    await makeRequest(
        { hostname: 'localhost', port: 3000, path: '/trackings/PRCL-20250101-ABC123/logs', method: 'GET' },
        401,
        'GET /trackings/:trackingId/logs (no auth)'
    );
    console.log('');

    // Test 7: Payment endpoints
    console.log('7. Testing Payment Endpoints');
    console.log('-'.repeat(60));
    await makeRequest(
        {
            hostname: 'localhost',
            port: 3000,
            path: '/payment-checkout-session',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cost: 100, parcelName: 'Test Parcel' })
        },
        200, // Payment endpoint doesn't require auth
        'POST /payment-checkout-session'
    );
    console.log('');

    // Test 8: Route ordering test (specific route before generic)
    console.log('8. Testing Route Ordering');
    console.log('-'.repeat(60));
    await makeRequest(
        { hostname: 'localhost', port: 3000, path: '/parcels/123/status', method: 'PATCH' },
        401,
        'PATCH /parcels/:id/status (should match specific route, not generic)'
    );
    console.log('');

    // Summary
    console.log('='.repeat(60));
    console.log('Test Summary');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${testsPassed + testsFailed}`);
    console.log(`Passed: ${testsPassed}`);
    console.log(`Failed: ${testsFailed}`);
    console.log(`Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
    console.log('');

    if (testsFailed === 0) {
        console.log('🎉 All tests passed! Server is working correctly.');
        process.exit(0);
    } else {
        console.log('⚠️  Some tests failed. Please review the output above.');
        process.exit(1);
    }
}

// Wait a moment for server to be ready, then run tests
setTimeout(() => {
    runAllTests().catch(err => {
        console.error('Test execution error:', err);
        process.exit(1);
    });
}, 2000);

