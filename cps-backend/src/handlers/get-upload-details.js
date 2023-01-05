const AWS = require('aws-sdk'),
    DOMAIN_NAME = "d2tkd2cho3ubjk.cloudfront.net",
    EXPIRES_IN = 24, //in hours
    PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAp33aDBNO2RSAOX1deIBysKHNsLsE3TcJIoKhlOTu9QneehLj
0Yqr07B037DD5BObv0dJGpiRwW5ygYMTkATYpcb9ejp7nlJsxlyql1/NIZlIXUlx
Mllgx9nxUm0JR2BKWMnaDuDS7rToCHYxORpLZNwpzGiC5Ore8gDyf4Iy6cYS8cWi
Rlq5iYFE5+y+7MjDgXnevvhIjQNaFxVJ+25I6yGzxt8QnKYCaP0+KhLP5K8Pez28
y1CyUZ5+agmfe60cdrn4scmsg2WqQkJo2riGMs1H6Vw91CyvdETvwkiA8nwtdnJa
vHyY25HDOVPddGUFeiK9pfIByh6On0MjMe9cWQIDAQABAoIBABekgToBI7kq1qrG
0oHnB8l9HY7b52TelvCDJhHhewWl3fy3W+dBPt4D44uL5Sr1xZ9rjZsufCykzY8Q
lJtYw8gq3a76QGbp1abuf7occNVUUM2yR0NHMI0la5YqBAxKQFRmMdy1ybCeYr6H
CI2583iKR3AuNIPhz5Szo4dyNoOfEql9I9BFOj56ORqyin33Wj1PmigJ9HHCtMTV
JaA8SGXu9MTXjRg4OXomBLwyRSM5JEwKlRlLFi00b6xmhPO+KgxVsUS+RnZL9cgm
x0lYzbBvRolTg+c/VQ3Vdgpk4249/T7L8xC2iSk4bu/5v8dV9Ycxd09kqWbqieky
zcHLrjECgYEA0JHyOkGOksWuX+q4q+4jyfnVpSX2kK9r3SLhIKB0xrvROC+XGy93
xCOgKZpA4x66utJcFWqKZWbCEM3L2ebHlgDXlfnevXHe8BBqr19YvHYATC9o0S5h
fi9LYT3Xg87m0X90p9unfUTO17dUSSS/aM02mMV1kMLWsx51ENGy5jUCgYEAzZR+
Di6N7dKdotqC/c+iAg/2Jp/Ij43q/VcbtsCQR4pZA6KsYnaUnOa1lK4tQ2AHN3zU
czfssnfWH0YCBEfaRKswZ+ipdGEvKzT0RUfmhnx9iSwnlMB9yJtTt8DvkYtC6Kid
2Cmme5eaUduVYN2BHZIUgStQVkDCLOxnfYkf0hUCgYBkKLIaJ8E/2o6SoTVt2z50
j/V5CXIOqS8zUryp3mQ1y5v9T11RQMpS9ojDccAXUXp6nOp7nl43s9EeILX0Pk86
Sc09yHCeqUBWKIwTC8ahOkmKTHoZehx3bF7Wo8wLECDoGjz7HxCfp5ttHCztsyf4
PBQr6Sc8DVTtT4MIQKuYwQKBgAIBI6WBwLKD7jOLS+Grp5m7jBveTPdRW+wycDu8
7uszpyCI8oNXQqWw/i4/8IMKqadZ2TxyXCV1U6okZZqjFLa8sJEizJws4mfacVNH
mzDOf+7Zdl1V7yQIl61f/TX/FJzuH/PenBfyZ3fK208BeePO69JCmNrucLY9a9jm
gF/tAoGAaj77H/AYa9WbsiHm/Vi1MyhiPZHxPrOJqbSIrK0mSjuwZFQ4BZmKTSsV
gkW/LdsmH3xVBWBlI4VLNPyxjdPgw7ab3f3ygaTR2514NEn1JEDA8VDXueGS/nP3
yIPYzkHHrDQE1R+WeIGPJ0tVOCX4RzFKTmG+1ois9hAAGs6rdII=
-----END RSA PRIVATE KEY-----`,
    PUBLIC_KEY = `K3EQSKPQJCT5N`;

var getSignedCookie = function() {
    const cloudFront = new AWS.CloudFront.Signer(PUBLIC_KEY, PRIVATE_KEY);


    const policy = JSON.stringify({
        Statement: [{
            Resource: 'http*://' + DOMAIN_NAME + '/*',
            Condition: {
                DateLessThan: {
                    'AWS:EpochTime': Math.floor(new Date().getTime() / 1000) + 60 * 60 * EXPIRES_IN, // Current Time in UTC + time in seconds, (60 * 60 * 1 = 1 hour)
                },
            },
        }, ],
    });
    const cookie = cloudFront.getSignedCookie({ policy });
    console.log(cookie);
    var headers = {
        'Set-Cookie': []
    }
    Object.keys(cookie).forEach(key => {
        headers['Set-Cookie'].push(key + "=" + cookie[key] + "; Domain=" + DOMAIN_NAME + "; Path=/; Secure=true; HttpOnly=true;");
    });
    return headers;
}

const response = {
    statusCode: 200,
    isBase64Encoded: false,
    headers: {
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key",
        "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE",
        "Access-Control-Allow-Origin": "*"
    },
    body: null
};

exports.handler = async(event, context) => {
    response.multiValueHeaders = getSignedCookie();
    return response;
};


// `CloudFront-Key-Pair-Id=${cookie['CloudFront-Key-Pair-Id']}; Domain=${DOMAIN_NAME}; Path=/; Secure=true; HttpOnly=true;`
//             `CloudFront-Policy=${cookie['CloudFront-Policy']}; Domain=${DOMAIN_NAME}; Path=/; Secure=true; HttpOnly=true;`
//             `CloudFront-Signature=${cookie['CloudFront-Signature']}; Domain=${DOMAIN_NAME}; Path=/; Secure=true; HttpOnly=true;`