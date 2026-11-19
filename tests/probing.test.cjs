"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const E = require("../engine.js");

test("Ba phương pháp: ví dụ 11,22,33,44 trên M=11", () => {
  const runs = E.compare([11,22,33,44],11);
  assert.deepEqual(runs.linear.slots.slice(0,4),[11,22,33,44]);
  assert.deepEqual([0,1,4,9].map(i => runs.quadratic.slots[i]),[11,22,33,44]);
  assert.equal(runs.double.slots[0],11);
  assert.equal(runs.double.slots[6],22);
  assert.equal(runs.double.slots[2],33);
  assert.equal(runs.double.slots[5],44);
  assert.deepEqual([runs.linear.probes,runs.quadratic.probes,runs.double.probes],[10,10,7]);
});
test("Quadratic i² có thể thất bại dù bảng còn ô trống", () => {
  const keys=[0,11,22,33,44,55,66];
  const r=E.compare(keys,11);
  assert.equal(r.quadratic.failed,1);
  assert.equal(r.quadratic.inserted,6);
  assert.equal(r.quadratic.slots.filter(x => x === null).length,5);
  assert.equal(r.linear.failed,0);
  assert.equal(r.double.failed,0);
  assert.deepEqual(E.sequence("quadratic",0,11),[0,1,4,9,5,3]);
});
test("Double Hashing đi qua toàn bộ bảng trong tất cả kích thước cho phép", () => {
  for(const m of E.SIZES) {
    for(let key=-80;key<=80;key++) {
      assert.equal(E.gcd(E.step2(key),m),1);
      assert.equal(new Set(E.sequence("double",key,m)).size,m);
    }
  }
});
test("Linear bao phủ mọi ô; Quadratic dừng khi quay lại ô cũ", () => {
  for(const m of E.SIZES) {
    assert.equal(E.sequence("linear",12,m).length,m);
    const q=E.sequence("quadratic",12,m);
    assert.equal(q.length,(m+1)/2);
  }
});
test("Khóa âm được băm modulo không âm", () => {
  assert.equal(E.mod(-1,11),10);
  const runs=E.compare([-1,-12,-23],11);
  for (const method of E.METHODS) assert.equal(runs[method].inserted,3);
});
test("Mô phỏng tìm kiếm trúng và trượt", () => {
  const runs=E.compare([11,22,33,44],11);
  for(const method of E.METHODS) {
    const hit=E.search(method,runs[method].slots,33);
    assert.equal(hit.found,true);
    assert.equal(runs[method].slots[hit.index],33);
    const miss=E.search(method,runs[method].slots,77);
    assert.equal(miss.found,false);
    assert.ok(miss.path.length>0);
  }
});
test("Timeline giữ đồng bộ theo khóa giữa ba phương pháp", () => {
  const runs=E.compare([11,22,33,44],11);
  const frames=E.timeline(runs);
  assert.equal(frames[0].type,"initial");
  assert.equal(frames.at(-1).type,"done");
  const ordinals=frames.filter(f=>f.type==="probe").map(f=>f.ordinal);
  assert.deepEqual([...new Set(ordinals)],[1,2,3,4]);
  for(const frame of frames) for(const method of E.METHODS)
    assert.equal(frame.panels[method].slots.length,11);
});
test("Probes và collisions được đo nhất quán",()=>{
  const r=E.simulate("linear",[11,22,33,44],11);
  assert.equal(r.probes,10);
  assert.equal(r.collisions,6);
  assert.equal(r.inserted,4);
  assert.equal(r.meanProbes,2.5);
  assert.equal(r.longestOccupiedRun,4);
});
test("Công thức Princeton tại alpha=1/2",()=>{
  assert.deepEqual(E.linearExpectation(.5),{hit:1.5,miss:2.5});
  assert.throws(()=>E.linearExpectation(1),/α/);
});
test("Từ chối khóa trùng và kích thước không được hỗ trợ",()=>{
  assert.throws(()=>E.compare([1,1],11),/phân biệt/);
  assert.throws(()=>E.compare([1,2],12),/M/);
});
test("Dữ liệu phân tán đều: không phát sinh collision ngoài ý muốn",()=>{
  const r=E.compare([0,1,2,3,4,5],11);
  for(const method of E.METHODS) {
    assert.equal(r[method].probes,6);
    assert.equal(r[method].collisions,0);
  }
});

test("Default eight-key experiment matches the article and lengthens the animation", () => {
  const keys=[17,34,51,68,85,102,119,136], size=17;
  const r=E.compare(keys,size);
  assert.deepEqual([r.linear.probes,r.quadratic.probes,r.double.probes],[36,36,15]);
  for(const method of E.METHODS) {
    assert.equal(r[method].failed,0);
    assert.equal(r[method].inserted,8);
  }
  assert.equal(E.timeline(r).length,38);
  const {readFileSync}=require("node:fs");
  const path=require("node:path");
  const html=readFileSync(path.join(__dirname,"..","index.html"),"utf8");
  const app=readFileSync(path.join(__dirname,"..","app.js"),"utf8");
  assert.match(html,/value="17, 34, 51, 68, 85, 102, 119, 136"/);
  assert.match(html,/<option value="17" selected>/);
  assert.match(app,/collision: \{size:17,keys:\[17,34,51,68,85,102,119,136\]\}/);
});
