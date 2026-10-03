const STORAGE_KEY = "ledgerlens-demo-v2";

const seed = {
  budget: 27000,
  previousMonthSpend: 20885.10,
  card: { frozen: false, limit: 5000 },
  transactions: [
    {id:1,icon:"◉",merchant:"AWS",category:"Cloud",date:"Today",amount:1284.20,receipt:true,status:"Auto-approved",cardholder:"Neha Mahesh",policy:"Within cloud policy"},
    {id:2,icon:"F",merchant:"Figma",category:"Software",date:"Yesterday",amount:180.00,receipt:true,status:"Auto-approved",cardholder:"Maya Chen",policy:"Within software policy"},
    {id:3,icon:"U",merchant:"United",category:"Travel",date:"Oct 1",amount:612.44,receipt:false,status:"Needs receipt",cardholder:"Alex Kim",policy:"Receipt required above $500"},
    {id:4,icon:"G",merchant:"GitHub",category:"Software",date:"Sep 30",amount:96.00,receipt:true,status:"Auto-approved",cardholder:"Neha Mahesh",policy:"Within software policy"},
    {id:5,icon:"◌",merchant:"Blue Bottle",category:"Meals",date:"Sep 30",amount:18.72,receipt:false,status:"Needs receipt",cardholder:"Neha Mahesh",policy:"Within meal policy"}
  ],
  approvals: [
    {id:101,merchant:"Figma",purpose:"Team plan upgrade",requester:"Maya Chen",team:"Design",amount:420,policy:"Within software policy",risk:"ok"},
    {id:102,merchant:"United",purpose:"Customer onsite · NYC",requester:"Alex Kim",team:"Sales",amount:812,policy:"Fare is 18% over route median",risk:"warn"},
    {id:103,merchant:"Linear",purpose:"Engineering workspace",requester:"Sam Lee",team:"Engineering",amount:240,policy:"Within software policy",risk:"ok"}
  ]
};

let state = loadState();
let filter = "all";
let search = "";

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const money = n => n.toLocaleString("en-US",{style:"currency",currency:"USD"});
const clone = x => JSON.parse(JSON.stringify(x));

function loadState(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || clone(seed); }
  catch { return clone(seed); }
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function spendTotal(){ return state.transactions.reduce((sum,t)=>sum+Number(t.amount),0); }

function renderAll(){
  const spend=spendTotal();
  $("#totalSpend").textContent=money(spend);
  const pct=Math.min(spend/state.budget,1);
  $("#budgetPct").textContent=Math.round(pct*100)+"%";
  $("#progressBar").style.width=(pct*100)+"%";
  $("#remaining").textContent=money(Math.max(state.budget-spend,0))+" remaining";
  const badge=$('[data-tab="approvals"] b');
  if(badge) badge.textContent=state.approvals.length;
  renderTransactions();
  renderApprovals();
  renderInsights();
  renderCards();
}

function renderTransactions(){
  let rows=state.transactions.filter(t=>{
    const matchSearch=(t.merchant+" "+t.category+" "+t.cardholder).toLowerCase().includes(search.toLowerCase());
    const matchFilter=filter==="all" || (filter==="receipt" && !t.receipt) || t.category.toLowerCase()===filter;
    return matchSearch && matchFilter;
  });
  $("#txCount").textContent=rows.length+" shown";
  $("#txList").innerHTML=rows.length ? rows.map(t=>`
    <button class="tx" data-tx="${t.id}">
      <div class="tx-icon">${t.icon}</div>
      <div><b>${escapeHtml(t.merchant)}</b><span>${escapeHtml(t.category)} · ${escapeHtml(t.date)}</span></div>
      <strong>${money(Number(t.amount))}<small class="${t.receipt ? "goodflag" : ""}">${t.receipt ? "Receipt attached" : "Needs receipt"}</small></strong>
    </button>`).join("") : '<div class="empty-mini">No transactions match this view.</div>';
  $$("[data-tx]").forEach(el=>el.addEventListener("click",()=>openTransaction(Number(el.dataset.tx))));
}

function renderApprovals(){
  $("#approvalList").innerHTML=state.approvals.map(a=>`
    <div class="approval" data-approval="${a.id}">
      <div class="approval-top"><div class="merchant-icon">${a.merchant[0]}</div><div><b>${escapeHtml(a.merchant)}</b><span>${escapeHtml(a.purpose)}</span></div><strong>${money(Number(a.amount))}</strong></div>
      <p>Requested by ${escapeHtml(a.requester)} · ${escapeHtml(a.team)}</p>
      <div class="policy ${a.risk}">${a.risk==="ok"?"✓":"!"} ${escapeHtml(a.policy)}</div>
      <div class="approve-actions"><button class="deny" data-decision="deny" data-id="${a.id}">Deny</button><button class="approve" data-decision="approve" data-id="${a.id}">Approve</button></div>
    </div>`).join("");
  $("#approvalEmpty").style.display=state.approvals.length?"none":"flex";
  $$("[data-decision]").forEach(btn=>btn.addEventListener("click",()=>decideApproval(Number(btn.dataset.id),btn.dataset.decision==="approve")));
}

function decideApproval(id,approved){
  const req=state.approvals.find(a=>a.id===id);
  if(!req) return;
  state.approvals=state.approvals.filter(a=>a.id!==id);
  if(approved){
    state.transactions.unshift({
      id:Date.now(),icon:req.merchant[0],merchant:req.merchant,category:req.merchant==="United"?"Travel":"Software",
      date:"Just now",amount:req.amount,receipt:false,status:"Approved request",cardholder:req.requester,policy:req.policy
    });
  }
  saveState(); renderAll();
  showToast(approved?"Request approved and added to activity":"Request denied");
}

function renderInsights(){
  const total=spendTotal();
  const change=(total-state.previousMonthSpend)/state.previousMonthSpend;
  $("#monthChange").textContent=(change<=0?"↓ ":"↑ ")+Math.abs(change*100).toFixed(1)+"%";
  $("#monthChange").style.color=change<=0?"var(--lime)":"#ff8a7f";
  const values=[34,52,43,67,59,73,65,82,72,88,69,Math.max(18,Math.min(96,(total/state.budget)*100))];
  $("#chart").innerHTML=values.map(v=>`<i class="bar" style="height:${v}%"></i>`).join("");
  const totals={};
  state.transactions.forEach(t=>totals[t.category]=(totals[t.category]||0)+Number(t.amount));
  $("#categoryBreakdown").innerHTML=Object.entries(totals).sort((a,b)=>b[1]-a[1]).map(([cat,amt])=>`
    <div class="insight-row"><span><i class="dot ${cat.toLowerCase()}"></i>${cat}</span><b>${money(amt)}</b></div>`).join("");
}

function renderCards(){
  $("#freezeCard").checked=!!state.card.frozen;
  $("#cardLimit").value=state.card.limit;
  $("#cardStatus").textContent=state.card.frozen?"FROZEN":"ACTIVE";
  $("#virtualCard").classList.toggle("frozen",!!state.card.frozen);
}

function openTransaction(id){
  const t=state.transactions.find(x=>x.id===id); if(!t)return;
  $("#detailContent").innerHTML=`
    <div class="detail-icon">${t.icon}</div>
    <h3>${escapeHtml(t.merchant)}</h3><div class="detail-amount">${money(Number(t.amount))}</div>
    <dl><div><dt>Category</dt><dd>${escapeHtml(t.category)}</dd></div><div><dt>Cardholder</dt><dd>${escapeHtml(t.cardholder)}</dd></div><div><dt>Receipt</dt><dd>${t.receipt?"Attached":"Missing"}</dd></div><div><dt>Policy</dt><dd>${escapeHtml(t.policy||"No policy note")}</dd></div></dl>
    ${!t.receipt?'<button class="inline-attach" data-inline-attach="'+t.id+'">Attach receipt</button>':""}`;
  openSheet("detailSheet");
  const attach=$("[data-inline-attach]");
  if(attach) attach.addEventListener("click",()=>{closeSheet("detailSheet");openReceipt(id);});
}

function openReceipt(preselect){
  const missing=state.transactions.filter(t=>!t.receipt);
  if(!missing.length){ showToast("No missing receipts"); return; }
  $("#receiptSelect").innerHTML=missing.map(t=>`<option value="${t.id}">${escapeHtml(t.merchant)} · ${money(Number(t.amount))}</option>`).join("");
  if(preselect) $("#receiptSelect").value=String(preselect);
  updateReceiptPreview();
  openSheet("receiptSheet");
}
function updateReceiptPreview(){
  const t=state.transactions.find(x=>x.id===Number($("#receiptSelect").value));
  if(!t)return;
  $("#receiptMerchant").textContent=t.merchant.toUpperCase();
  $("#receiptAmount").textContent=money(Number(t.amount));
  $("#receiptDate").textContent=t.date;
  $("#receiptTitle").textContent="Receipt matched";
  $("#receiptCopy").textContent="Merchant and amount matched to this transaction. Attach it to clear the outstanding receipt.";
}

function openSheet(id){ const s=$("#"+id); s.classList.add("open"); s.setAttribute("aria-hidden","false"); }
function closeSheet(id){ const s=$("#"+id); s.classList.remove("open"); s.setAttribute("aria-hidden","true"); }

function showTab(id){
  $$(".tab-panel").forEach(p=>p.classList.remove("active"));
  $("#"+id).classList.add("active");
  $$("[data-tab]").forEach(b=>b.classList.toggle("active",b.dataset.tab===id));
}
$$("[data-tab]").forEach(btn=>btn.addEventListener("click",()=>showTab(btn.dataset.tab)));
$$("[data-nav]").forEach(btn=>btn.addEventListener("click",()=>{
  $$(".bottom-nav [data-nav]").forEach(b=>b.classList.remove("active")); btn.classList.add("active");
  if(btn.dataset.nav==="home") showTab("activity"); else showTab(btn.dataset.nav);
}));

$("#searchTx").addEventListener("input",e=>{search=e.target.value;renderTransactions();});
$$("[data-filter]").forEach(btn=>btn.addEventListener("click",()=>{
  filter=btn.dataset.filter; $$("[data-filter]").forEach(b=>b.classList.remove("active"));btn.classList.add("active");renderTransactions();
}));
$("#addExpenseBtn").addEventListener("click",()=>openSheet("expenseSheet"));
$("#expenseForm").addEventListener("submit",e=>{
  e.preventDefault(); const fd=new FormData(e.currentTarget);
  const merchant=String(fd.get("merchant")).trim(); const amount=Number(fd.get("amount")); const category=String(fd.get("category"));
  state.transactions.unshift({id:Date.now(),icon:merchant[0]?.toUpperCase()||"$",merchant,category,date:"Just now",amount,receipt:fd.get("receipt")==="on",status:"Created manually",cardholder:"Neha Mahesh",policy:"Manual expense"});
  saveState();renderAll();e.currentTarget.reset();closeSheet("expenseSheet");showToast("Expense created");
});
$("#scanBtn").addEventListener("click",()=>openReceipt());
$("#receiptSelect").addEventListener("change",updateReceiptPreview);
$("#doneScan").addEventListener("click",()=>{
  const id=Number($("#receiptSelect").value); const t=state.transactions.find(x=>x.id===id);
  if(t){t.receipt=true;t.status="Receipt attached";saveState();renderAll();closeSheet("receiptSheet");showToast("Receipt attached");}
});
$("#saveCard").addEventListener("click",()=>{
  state.card.frozen=$("#freezeCard").checked; state.card.limit=Math.max(100,Number($("#cardLimit").value)||5000);
  saveState();renderCards();showToast(state.card.frozen?"Card frozen":"Card controls saved");
});
$("#exportCsv").addEventListener("click",()=>{
  const rows=[["merchant","category","amount","date","cardholder","receipt"],...state.transactions.map(t=>[t.merchant,t.category,t.amount,t.date,t.cardholder,t.receipt?"attached":"missing"])];
  const csv=rows.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(",")).join("\n");
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="ledgerlens-transactions.csv";a.click();URL.revokeObjectURL(a.href);showToast("CSV exported");
});
$("#resetDemo").addEventListener("click",()=>{state=clone(seed);saveState();filter="all";search="";$("#searchTx").value="";$$("[data-filter]").forEach(b=>b.classList.toggle("active",b.dataset.filter==="all"));renderAll();showToast("Demo reset");});
$$("[data-close]").forEach(el=>el.addEventListener("click",()=>closeSheet(el.dataset.close)));
document.querySelector('[data-scroll="product"]').addEventListener("click",()=>document.getElementById("product").scrollIntoView({behavior:"smooth"}));

function showToast(text){const t=$("#toast");t.textContent=text;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800)}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}

renderAll();