/* Interactive report controller: shared per-key timeline for three strategies. */
(function () {
  "use strict";
  const E = window.HashProbingEngine;
  const $ = id => document.getElementById(id);
  const names = {linear:"Linear Probing",quadratic:"Quadratic Probing",double:"Double Hashing"};
  const short = {linear:"Linear",quadratic:"Quadratic",double:"Double"};
  const samples = {
    collision: {size:17,keys:[17,34,51,68,85,102,119,136]},
    mixed: {size:11,keys:[17,3,14,25,39,5,22,46]},
    quadratic: {size:11,keys:[0,11,22,33,44,55,66]},
    dense: {size:11,keys:[0,11,22,33,44,55,66,77,88,99]},
    spread: {size:11,keys:[0,1,2,3,4,5]}
  };
  const state = {runs:null, frames:[], tick:0, playing:false, timer:null, speed:1};
  const boardNodes = {};

  function fmt(n,digits=0) {
    return n.toLocaleString("vi-VN",{minimumFractionDigits:digits,maximumFractionDigits:digits});
  }
  function el(tag,cls,text) {
    const e=document.createElement(tag);
    if(cls)e.className=cls;
    if(text!==undefined)e.textContent=String(text);
    return e;
  }
  function parseKeys(raw) {
    const parts=raw.trim().split(/[\s,;]+/).filter(Boolean);
    if(parts.length<1||parts.length>25)
      throw new Error("Vui lòng nhập từ 1 đến 25 khóa.");
    if(!parts.every(x=>/^[+-]?\d+$/.test(x)))
      throw new Error("Mỗi khóa phải là số nguyên, cách nhau bằng dấu phẩy hoặc khoảng trắng.");
    const keys=parts.map(Number);
    if(!keys.every(Number.isSafeInteger))
      throw new Error("Có khóa vượt phạm vi số nguyên an toàn.");
    return keys;
  }
  function makeBoard(method) {
    const root=el("div","board");
    root.setAttribute("aria-label",names[method]);
    const header=el("div","board-heading");
    const heading=el("strong","",names[method]);
    const counter=el("span","board-counter");
    header.append(heading,counter);
    const desc=el("p","board-description");
    const scroll=el("div","table-scroll");
    const grid=el("div","table-grid");
    grid.setAttribute("role","group");
    grid.setAttribute("aria-label","Các ô của bảng "+names[method]);
    scroll.append(grid);
    const foot=el("div","board-foot");
    const detail=el("span","board-detail");
    const metrics=el("span","board-metrics");
    foot.append(detail,metrics);
    root.append(header,desc,scroll,foot);
    $("boards").append(root);
    boardNodes[method]={root,counter,desc,grid,detail,metrics};
  }
  function explain(frame,method,p) {
    if(frame.type==="initial")return "Bắt đầu từ bảng rỗng. Khóa đầu tiên sẽ được chèn ở vị trí băm chính.";
    if(frame.type==="done")return "Đã chèn xong dãy khóa. Các ô đang hiển thị trạng thái cuối cùng.";
    if(p.settled)return "Khóa "+frame.key+" đã hoàn tất; giữ trạng thái này cho đến lượt khóa tiếp theo.";
    if(p.outcome==="collision")
      return "Khóa "+frame.key+" gặp "+p.slots[p.index]+" tại ô "+p.index+". Thuật toán tiếp tục tới ô kế tiếp trong dãy.";
    if(p.outcome==="insert")
      return "Tìm được ô "+p.index+" còn trống và đặt khóa "+frame.key+" vào đó.";
    if(p.outcome==="fail")
      return "Dãy vị trí của khóa "+frame.key+" đã quay vòng. Lượt chèn kết thúc với kết quả thất bại.";
    return "Đang xử lý khóa "+frame.key+".";
  }
  function renderBoard(method,frame) {
    const n=boardNodes[method], p=frame.panels[method], size=p.slots.length;
    const maxChars=Math.max(1,...p.slots.filter(v=>v!==null).map(v=>String(v).length));
    const minCell=Math.max(29,12+maxChars*8);
    n.grid.style.gridTemplateColumns="repeat("+size+", minmax("+minCell+"px, 1fr))";
    const fragment=document.createDocumentFragment();
    p.slots.forEach((value,index)=>{
      const occupied=value!==null;
      let css="slot"+(occupied?" occupied":"");
      if(p.index===index&&frame.type==="probe") {
        css+=" current";
        if(p.outcome==="collision")css+=" collision";
        if(p.outcome==="insert")css+=" inserted";
      }
      const cell=el("div",css);
      cell.setAttribute("aria-label","Ô "+index+": "+(occupied?"khóa "+value:"trống"));
      const label=el("div","slot-value",occupied?value:"·");
      const number=el("div","slot-index",index);
      cell.append(label,number);
      fragment.append(cell);
    });
    n.grid.replaceChildren(fragment);
    n.counter.textContent="N = "+p.inserted+" / M = "+size;
    n.desc.textContent=explain(frame,method,p);
    const outcome=frame.type==="probe"&&!p.settled?p.outcome:"";
    if(outcome==="collision")n.detail.textContent="Probe "+p.probeNumber+" · va chạm";
    else if(outcome==="insert")n.detail.textContent="Probe "+p.probeNumber+" · chèn";
    else if(outcome==="fail")n.detail.textContent="Kết thúc dãy · thất bại";
    else n.detail.textContent=frame.type==="done"?"Hoàn tất":frame.type==="initial"?"Chưa thăm dò":"Đang chờ";
    n.metrics.textContent=p.probes+" probe · "+p.collisions+" collision";
  }
  function render() {
    if(!state.frames.length)return;
    const frame=state.frames[state.tick];
    $("animation-counter").textContent="Bước "+(state.tick+1)+" / "+state.frames.length;
    $("progress-label").textContent="Bước "+(state.tick+1)+" / "+state.frames.length;
    $("progress").max=String(Math.max(1,state.frames.length-1));
    $("progress").value=String(state.tick);
    $("prev").disabled=state.tick===0;
    $("next").disabled=state.tick===state.frames.length-1;
    if(frame.type==="initial")$("animation-stage").textContent="Chưa chèn khóa nào";
    else if(frame.type==="done")$("animation-stage").textContent="Hoàn tất tất cả khóa";
    else $("animation-stage").textContent="Khóa "+frame.key+" · vòng thăm dò "+frame.round;
    $("run-status").textContent=state.playing?"Đang chạy":
      state.tick===0?"Sẵn sàng":
      frame.type==="done"?"Hoàn tất":"Tạm dừng";
    for(const method of E.METHODS)renderBoard(method,frame);
  }
  function clearTimer(){
    if(state.timer!==null){clearTimeout(state.timer);state.timer=null;}
  }
  function pause(){
    state.playing=false;
    clearTimer();
    $("play").textContent="▶ Phát";
    $("play").setAttribute("aria-pressed","false");
  }
  function seek(tick){
    state.tick=Math.max(0,Math.min(state.frames.length-1,tick));
    render();
  }
  function schedule(){
    clearTimer();
    if(!state.playing)return;
    state.timer=setTimeout(()=>{
      state.timer=null;
      if(!state.playing)return;
      if(state.tick<state.frames.length-1)state.tick++;
      if(state.tick>=state.frames.length-1)pause();
      render();
      if(state.playing)schedule();
    },Math.round(530/state.speed));
  }
  function togglePlay(){
    if(!state.frames.length)return;
    if(state.playing){pause();render();return;}
    if(state.tick===state.frames.length-1)state.tick=0;
    state.playing=true;
    $("play").textContent="Ⅱ Tạm dừng";
    $("play").setAttribute("aria-pressed","true");
    render();
    schedule();
  }
  function renderMetrics(){
    for(const method of E.METHODS){
      const r=state.runs[method];
      $(method+"-probes").textContent=fmt(r.probes);
      $(method+"-collisions").textContent=fmt(r.collisions);
      $(method+"-average").textContent=fmt(r.meanProbes,2);
      $(method+"-inserted").textContent=fmt(r.inserted);
      $(method+"-failed").textContent=fmt(r.failed);
    }
    const fails=E.METHODS.filter(m=>state.runs[m].failed>0);
    $("metrics-note").textContent=fails.length?
      "Lưu ý: "+fails.map(m=>short[m]).join(", ")+" không chèn được tất cả khóa. Probe count bao gồm cả lượt kiểm tra trước thất bại; không dùng riêng tổng probe để kết luận phương pháp thất bại là nhanh hơn.":
      "Tất cả phương pháp đều chèn hết dãy. Một probe là một ô được kiểm tra; một collision là một ô đang chứa khóa khác. Ít probe hơn không đồng nghĩa chắc chắn chạy nhanh hơn trên CPU.";
  }
  function renderSearch(){
    const raw=$("search-key").value.trim(),key=Number(raw);
    const out=$("search-results");
    out.replaceChildren();
    if(raw===""||!Number.isSafeInteger(key)){
      out.append(el("p","error","Khóa tìm kiếm phải là số nguyên an toàn."));
      return;
    }
    for(const method of E.METHODS){
      const result=E.search(method,state.runs[method].slots,key);
      const row=el("div","search-result");
      const title=el("strong","",short[method]);
      const status=result.found?"Tìm thấy ở ô "+result.index:
        result.reason==="empty"?"Không thấy (gặp ô trống)":"Không thấy (hết dãy thăm dò)";
      const detail=el("p","",status+" · "+result.path.length+
        " probe · Dãy: "+result.path.join(" → "));
      row.append(title,detail);
      out.append(row);
    }
  }
  function apply(){
    const error=$("error");
    try {
      const keys=parseKeys($("keys").value);
      const size=Number($("size").value);
      const runs=E.compare(keys,size);
      const frames=E.timeline(runs);
      pause();
      state.runs=runs;
      state.frames=frames;
      state.tick=0;
      error.hidden=true;
      render();
      renderMetrics();
      renderSearch();
    } catch(e) {
      error.textContent=e.message||"Không thể xử lý dữ liệu.";
      error.hidden=false;
    }
  }
  function loadSample(name){
    if(!samples[name])return;
    const p=samples[name];
    $("keys").value=p.keys.join(", ");
    $("size").value=String(p.size);
    apply();
  }
  function showExpectation(){
    const alpha=Number($("alpha").value)/100;
    const exp=E.linearExpectation(alpha);
    $("alpha-label").textContent=fmt(alpha,2);
    $("expected-hit").textContent=fmt(exp.hit,2);
    $("expected-miss").textContent=fmt(exp.miss,2);
    $("bar-hit").style.width=(100*exp.hit/exp.miss).toFixed(2)+"%";
    $("bar-miss").style.width="100%";
  }
  function highlightCode(){
    const root=$("java-code");
    const source=root.textContent;
    const pat=/\/\/[^\n]*|"(?:\\.|[^"\\])*"|\b(?:public|static|return|switch|case|break|default|throw|new|enum)\b|\b(?:int|long|void)\b|\b(?:Method|Math|AssertionError)\b|\b\d+\b|\b[A-Za-z_]\w*(?=\()/g;
    const frag=document.createDocumentFragment();
    let prev=0,match;
    while((match=pat.exec(source))!==null){
      if(match.index>prev)frag.append(document.createTextNode(source.slice(prev,match.index)));
      const token=match[0];
      const cls=token.startsWith("//")?"comment":token.startsWith('"')?"string":
        /^(public|static|return|switch|case|break|default|throw|new|enum)$/.test(token)?"keyword":
        /^(int|long|void)$/.test(token)?"primitive":
        /^(Method|Math|AssertionError)$/.test(token)?"type":
        /^\d+$/.test(token)?"number":"function";
      frag.append(el("span",cls,token));
      prev=pat.lastIndex;
    }
    if(prev<source.length)frag.append(document.createTextNode(source.slice(prev)));
    root.replaceChildren(frag);
  }
  function copyCode(){
    const source=$("java-code").textContent;
    const btn=$("copy-code");
    if(!navigator.clipboard||!navigator.clipboard.writeText){
      const range=document.createRange();
      range.selectNodeContents($("java-code"));
      const selection=window.getSelection();
      selection.removeAllRanges();selection.addRange(range);
      btn.textContent="Đã chọn mã";
      return;
    }
    navigator.clipboard.writeText(source).then(()=>{
      btn.textContent="Đã sao chép ✓";
      setTimeout(()=>{btn.textContent="Sao chép";},1700);
    }).catch(()=>{
      btn.textContent="Không thể sao chép";
      setTimeout(()=>{btn.textContent="Sao chép";},1700);
    });
  }
  function bind(){
    for(const method of E.METHODS)makeBoard(method);
    $("run").addEventListener("click",apply);
    $("keys").addEventListener("keydown",e=>{if(e.key==="Enter")apply();});
    $("keys").addEventListener("input",()=>{$("preset").value="custom";});
    $("size").addEventListener("change",()=>{$("preset").value="custom";});
    $("preset").addEventListener("change",e=>loadSample(e.target.value));
    $("play").addEventListener("click",togglePlay);
    $("prev").addEventListener("click",()=>{pause();seek(state.tick-1);});
    $("next").addEventListener("click",()=>{pause();seek(state.tick+1);});
    $("reset").addEventListener("click",()=>{pause();seek(0);});
    $("speed").addEventListener("change",e=>{
      state.speed=Number(e.target.value)||1;
      if(state.playing)schedule();
    });
    $("progress").addEventListener("input",e=>{pause();seek(Number(e.target.value));});
    $("search-run").addEventListener("click",renderSearch);
    $("search-key").addEventListener("keydown",e=>{if(e.key==="Enter")renderSearch();});
    $("alpha").addEventListener("input",showExpectation);
    $("copy-code").addEventListener("click",copyCode);
    window.addEventListener("pagehide",pause);
    document.addEventListener("visibilitychange",()=>{
      if(document.hidden&&state.playing){pause();render();}
    });
    highlightCode();
    showExpectation();
    apply();
  }
  bind();
})();
