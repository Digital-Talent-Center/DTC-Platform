const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 8000,
  path: '/api/midtrans/create-transaction',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', data);
  });
});

req.on('error', (e) => {
  console.error('Problem with request:', e.message);
});

req.write(JSON.stringify({
  duration: '1-bulan',
  post_title: 'test',
  attachment_path: null
}));
req.end();
