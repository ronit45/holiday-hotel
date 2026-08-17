import http from 'k6/http';
import { check, sleep } from 'k6';

// Test configuration
export const options = {
  stages: [
    { duration: '10s', target: 20 }, // Ramp-up to 20 users over 10 seconds
    { duration: '20s', target: 20 }, // Stay at 20 users for 20 seconds
    { duration: '10s', target: 0 },  // Ramp-down to 0 users over 10 seconds
  ],
  thresholds: {
    // 95% of requests must complete below 500ms
    http_req_duration: ['p(95)<500'],
    // Less than 1% of requests should fail
    http_req_failed: ['rate<0.01'],
  },
};

// Assuming the API is running locally on port 5001
const BASE_URL = 'http://localhost:5001/api';

export default function () {
  // 1. Test GET /api/hotels (fetch all hotels)
  const resHotels = http.get(`${BASE_URL}/hotels`);
  check(resHotels, {
    'GET /hotels status is 200': (r) => r.status === 200,
  });

  sleep(1);

  // 2. Test GET /api/hotels/search (search hotels)
  const resSearch = http.get(`${BASE_URL}/hotels/search?destination=London&adultCount=2&childCount=0&page=1`);
  check(resSearch, {
    'GET /hotels/search status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
