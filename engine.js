/* Pure hash-table engine: no DOM dependencies, shared by UI and Node tests. */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HashProbingEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const SIZES = Object.freeze([11, 13, 17, 19, 23, 29, 31]);
  const METHODS = Object.freeze(["linear", "quadratic", "double"]);

  function mod(a, m) { return ((a % m) + m) % m; }
  function gcd(a, b) {
    while (b !== 0) { const r = a % b; a = b; b = r; }
    return Math.abs(a);
  }
  function step2(key) { return 7 - mod(key, 7); }
  function validate(keys, size) {
    if (!SIZES.includes(size)) throw new Error("M phải là số nguyên tố trong danh sách cho phép.");
    if (!Array.isArray(keys) || keys.length < 1 || keys.length > 25)
      throw new Error("Nhập từ 1 đến 25 khóa.");
    if (!keys.every(Number.isSafeInteger))
      throw new Error("Các khóa phải là số nguyên an toàn.");
    if (new Set(keys).size !== keys.length)
      throw new Error("Các khóa đầu vào phải phân biệt (mô hình tập hợp khóa).");
  }
  function position(method, key, i, size) {
    if (!METHODS.includes(method)) throw new Error("Phương pháp không hợp lệ.");
    const home = mod(key, size);
    let delta;
    if (method === "linear") delta = i;
    else if (method === "quadratic") delta = i * i;
    else delta = i * step2(key);
    return mod(home + delta, size);
  }
  function sequence(method, key, size) {
    if (!SIZES.includes(size) || !Number.isSafeInteger(key))
      throw new Error("M hoặc khóa không hợp lệ.");
    const visited = new Set();
    const result = [];
    for (let i = 0; i < size; i++) {
      const p = position(method, key, i, size);
      if (visited.has(p)) break;
      visited.add(p);
      result.push(p);
    }
    return result;
  }
  function longestRun(slots) {
    const m = slots.length;
    if (slots.every(x => x === null)) return 0;
    if (slots.every(x => x !== null)) return m;
    // Start after an empty slot so cyclic runs are not double-counted.
    let start = slots.findIndex(x => x === null);
    let count = 0, best = 0;
    for (let step = 1; step <= m; step++) {
      const p = (start + step) % m;
      if (slots[p] !== null) { count++; best = Math.max(best, count); }
      else count = 0;
    }
    return best;
  }
  function simulate(method, keys, size) {
    validate(keys, size);
    if (!METHODS.includes(method)) throw new Error("Phương pháp không hợp lệ.");
    const slots = new Array(size).fill(null);
    const operations = [];
    let probes = 0, collisions = 0, inserted = 0, failed = 0;
    for (const key of keys) {
      const before = slots.slice(), attempts = [], visited = new Set();
      let success = false;
      for (let i = 0; i < size; i++) {
        const p = position(method, key, i, size);
        if (visited.has(p)) break;
        visited.add(p);
        probes++;
        if (slots[p] === null) {
          slots[p] = key;
          inserted++;
          attempts.push({
            key, index: p, probeNumber: i + 1, outcome: "insert",
            slots: slots.slice(), probes, collisions, inserted, failed
          });
          success = true;
          break;
        }
        collisions++;
        attempts.push({
          key, index: p, probeNumber: i + 1, outcome: "collision",
          slots: slots.slice(), probes, collisions, inserted, failed
        });
      }
      if (!success) {
        failed++;
        attempts.push({
          key, index: null, probeNumber: visited.size, outcome: "fail",
          slots: slots.slice(), probes, collisions, inserted, failed
        });
      }
      operations.push({
        key, before, attempts, placed: success,
        path: attempts.filter(a => a.index !== null).map(a => a.index),
        finalSlots: slots.slice()
      });
    }
    return Object.freeze({
      method, size, keys: keys.slice(), slots: slots.slice(), operations,
      probes, collisions, inserted, failed,
      meanProbes: probes / keys.length,
      occupancy: inserted / size,
      longestOccupiedRun: longestRun(slots)
    });
  }
  function compare(keys, size) {
    validate(keys, size);
    const result = {};
    for (const method of METHODS) result[method] = simulate(method, keys, size);
    return result;
  }
  function timeline(runs) {
    const methods = METHODS;
    const count = runs.linear.operations.length;
    const size = runs.linear.size;
    const zero = new Array(size).fill(null);
    const first = {};
    for (const method of methods) first[method] = {
      slots: zero.slice(), index: null, outcome: "idle",
      probes: 0, collisions: 0, inserted: 0, failed: 0, probeNumber: 0
    };
    const frames = [{ type: "initial", key: null, ordinal: 0, round: 0, panels: first }];
    for (let op = 0; op < count; op++) {
      const attempts = methods.map(m => runs[m].operations[op].attempts);
      const maxRounds = Math.max(...attempts.map(a => a.length));
      for (let round = 0; round < maxRounds; round++) {
        const panels = {};
        for (let j = 0; j < methods.length; j++) {
          const a = attempts[j];
          const last = a[Math.min(round, a.length - 1)];
          panels[methods[j]] = Object.assign({}, last, {
            slots: last.slots.slice(),
            settled: round >= a.length
          });
        }
        frames.push({
          type: "probe", key: runs.linear.operations[op].key,
          ordinal: op + 1, round: round + 1, panels
        });
      }
    }
    const finalPanels = {};
    for (const method of methods) {
      const r = runs[method];
      finalPanels[method] = {
        slots: r.slots.slice(), index: null, outcome: "done",
        probes: r.probes, collisions: r.collisions, inserted: r.inserted,
        failed: r.failed, probeNumber: 0
      };
    }
    frames.push({ type: "done", key: null, ordinal: count, round: 0, panels: finalPanels });
    return frames;
  }
  function search(method, slots, key) {
    if (!METHODS.includes(method) || !Number.isSafeInteger(key) ||
        !Array.isArray(slots) || !SIZES.includes(slots.length))
      throw new Error("Dữ liệu tìm kiếm không hợp lệ.");
    const path = [];
    for (const p of sequence(method, key, slots.length)) {
      path.push(p);
      if (slots[p] === key) return { found: true, index: p, path, reason: "found" };
      if (slots[p] === null) return { found: false, index: null, path, reason: "empty" };
    }
    return { found: false, index: null, path, reason: "exhausted" };
  }
  function linearExpectation(alpha) {
    if (typeof alpha !== "number" || alpha < 0 || alpha >= 1)
      throw new Error("Cần 0 ≤ α < 1.");
    const free = 1 - alpha;
    return {
      hit: 0.5 * (1 + 1 / free),
      miss: 0.5 * (1 + 1 / (free * free))
    };
  }
  return Object.freeze({
    SIZES, METHODS, mod, gcd, step2, validate,
    position, sequence, simulate, compare, timeline, search,
    linearExpectation, longestRun
  });
});
