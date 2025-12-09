const http = require('http');
const querystring = require('querystring');

// 1. Login to get session cookie
const postData = querystring.stringify({
    username: 'verifyUser',
    password: 'verifyPass123'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
    }
};

console.log("Logging in...");
const req = http.request(options, (res) => {
    console.log(`Login Status: ${res.statusCode}`);
    const cookies = res.headers['set-cookie'];

    if (!cookies) {
        console.error("No cookies received! Login failed or verifyUser doesn't exist.");
        process.exit(1);
    }

    console.log("Cookies:", cookies);
    const sessionCookie = cookies[0].split(';')[0]; // Just the session ID

    // 2. Access Protected Dashboard
    const dashboardOptions = {
        hostname: 'localhost',
        port: 3000,
        path: '/dashboard',
        method: 'GET',
        headers: {
            'Cookie': sessionCookie
        }
    };

    console.log("Accessing /dashboard...");
    const dashReq = http.request(dashboardOptions, (dashRes) => {
        console.log(`Dashboard Status: ${dashRes.statusCode}`);
        console.log("Cache-Control:", dashRes.headers['cache-control']);
        console.log("Pragma:", dashRes.headers['pragma']);

        if (dashRes.headers['cache-control'] && dashRes.headers['cache-control'].includes('no-store')) {
            console.log("✅ Cache-Control header present.");
        } else {
            console.log("❌ Cache-Control header MISSING.");
        }

        if (dashRes.statusCode === 200) {
            console.log("✅ Dashboard is accessible with login.");
        } else {
            console.log("❌ Dashboard access failed (expected 200).");
        }

        // 3. Access Dashboard WITHOUT Cookie (Simulating Logout + Re-request)
        // If back button is pressed, browser re-requests because of no-store.
        // It shoud NOT send the old cookie if it was deleted, OR if we just simulate a fresh request.
        // But verifying protection is key.

        const noAuthOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '/dashboard',
            method: 'GET'
        };

        console.log("Accessing /dashboard without auth...");
        const failReq = http.request(noAuthOptions, (failRes) => {
            console.log(`No Auth Dashboard Status: ${failRes.statusCode}`);
            if (failRes.statusCode === 302 || failRes.statusCode === 401) {
                console.log("✅ Dashboard is protected (redirects/401 without auth).");
            } else {
                console.log(`❌ Dashboard is NOT protected (Status: ${failRes.statusCode}).`);
            }
        });
        failReq.end();

    });
    dashReq.end();
});

req.write(postData);
req.end();
