/**
 * k6 load: 500 concurrent usage event recording.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 500,
  duration: '30s',
};

export default function () {
  const payload = JSON.stringify({
    events: [
      {
        sourceApiId: '00000000-0000-0000-0000-000000000001',
        targetUrl: 'http://api.example.com/users',
        method: 'GET',
        statusCode: 200,
        latencyMs: 50,
      },
    ],
  });
  const res = http.post(`${__ENV.BASE_URL || 'http://localhost:3000'}/api/usage/record`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  check(res, { 'status 2xx': (r) => r.status >= 200 && r.status < 300 });
  sleep(0.1);
}
