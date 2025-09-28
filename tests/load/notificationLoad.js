/**
 * k6 load: notification fan-out under 100 simultaneous breaking changes.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '20s',
};

export default function () {
  const res = http.get(`${__ENV.BASE_URL || 'http://localhost:3000'}/api/notifications?userId=test&limit=10`);
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(0.2);
}
