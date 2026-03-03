const fs = require('fs');
fs.writeFileSync('body.json', JSON.stringify({email:'curltest@example.com',password:'password'}));
console.log('wrote', fs.readFileSync('body.json','utf8'));