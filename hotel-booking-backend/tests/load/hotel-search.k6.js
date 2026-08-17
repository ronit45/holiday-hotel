import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 50 },   // ramp up
    { duration: "1m", target: 50 },     // sustain
    { duration: "10s", target: 0 },     // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],    // 95th percentile < 500ms
    http_req_failed: ["rate<0.01"],      // <1% error rate
  },
};

export default function () {
  const res = http.get("http://localhost:5001/api/hotels/search?destination=London");
  check(res, { "status 200": (r) => r.status === 200 });
  sleep(1);
}
