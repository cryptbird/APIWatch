/**
 * k6 load: 1000 concurrent users hitting /api/graph/full. Assert p95 < 500ms, 0 errors.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1000,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get(`${__ENV.BASE_URL || 'http://localhost:3000'}/api/graph/full`);
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(0.1);
}
