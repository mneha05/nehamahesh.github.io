const transactions=[
 {icon:'◉',merchant:'AWS',meta:'Cloud infrastructure · Today',amount:'$1,284.20',flag:'Receipt attached'},
 {icon:'F',merchant:'Figma',meta:'Software · Yesterday',amount:'$180.00',flag:'Auto-approved'},
 {icon:'U',merchant:'United',meta:'Travel · Oct 1',amount:'$612.44',flag:'Needs receipt'},
 {icon:'G',merchant:'GitHub',meta:'Software · Sep 30',amount:'$96.00',flag:'Auto-approved'},
 {icon:'◌',merchant:'Blue Bottle',meta:'Meals · Sep 30',amount:'$18.72',flag:'Needs receipt'}
];
const txList=document.getElementById('txList');
function renderTransactions(){txList.innerHTML=transactions.map((t,i)=>`<div class="tx" data-index="${i}"><div class="tx-icon">${t.icon}</div><div><b>${t.merchant}</b><span>${t.meta}</span></div><strong>${t.amount}<small>${t.flag}</small></strong></div>`).join('')}
renderTransactions();
document.querySelectorAll('[data-tab]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-tab]').forEach(b=>b.classList.remove('active'));document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));btn.classList.add('active');document.getElementById(btn.dataset.tab).classList.add('active');if(btn.dataset.tab==='insights')drawChart()}));
function drawChart(){const values=[34,52,43,67,59,73,65,82,72,88,69,61];const chart=document.getElementById('chart');chart.innerHTML=values.map(v=>`<i class="bar" style="height:${v}%"></i>`).join('')}
document.querySelectorAll('.approve-actions .approve').forEach(btn=>btn.addEventListener('click',e=>{const card=e.target.closest('.approval');card.style.transition='.35s';card.style.transform='translateX(20px)';card.style.opacity='0';setTimeout(()=>card.remove(),320);showToast('Request approved');}));
document.querySelectorAll('.approve-actions .deny').forEach(btn=>btn.addEventListener('click',e=>{const card=e.target.closest('.approval');card.style.transition='.35s';card.style.transform='translateX(-20px)';card.style.opacity='0';setTimeout(()=>card.remove(),320);showToast('Request denied');}));
const sheet=document.getElementById('receiptSheet');document.getElementById('scanBtn').addEventListener('click',()=>{sheet.classList.add('open');sheet.setAttribute('aria-hidden','false')});document.querySelector('.sheet-backdrop').addEventListener('click',closeSheet);document.getElementById('doneScan').addEventListener('click',()=>{const coffee=transactions.find(t=>t.merchant==='Blue Bottle');if(coffee)coffee.flag='Receipt attached';renderTransactions();closeSheet();showToast('Receipt attached');});function closeSheet(){sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true')}
function showToast(text){const t=document.getElementById('toast');t.textContent=text;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
document.querySelector('[data-scroll="product"]').addEventListener('click',()=>document.getElementById('product').scrollIntoView({behavior:'smooth'}));