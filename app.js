const ORDERS = [
  {orderNumber:'TVC-483921',customer:'Mariana López',email:'m***@example.com',phone:'***-***-1182',date:'2026-09-22',items:['Samsung 27-inch monitor','Wireless keyboard'],amount:8499,payment:'Confirmed',paymentTime:'2026-09-22 09:42',mode:'pickup',store:'Monterrey Centro',fulfillment:'Preparing',pickupEta:'Today after 16:00',invoice:'Generated'},
  {orderNumber:'TVC-392187',customer:'Carlos Rivera',email:'c***@example.com',phone:'***-***-5541',date:'2026-09-20',items:['Lenovo ThinkPad dock','HDMI cable x2'],amount:4299,payment:'Confirmed',paymentTime:'2026-09-20 12:18',mode:'delivery',carrier:'Estafeta',tracking:'EST-88210191',shipment:'In transit',lastEvent:'Line-haul transfer completed',eta:'2026-09-29',invoice:'Generated'},
  {orderNumber:'TVC-515204',customer:'Lucía Herrera',email:'l***@example.com',phone:'***-***-7304',date:'2026-09-24',items:['USB-C headset'],amount:1299,payment:'Pending validation',mode:'delivery',carrier:'DHL',tracking:null,shipment:'Not released',eta:null,invoice:'Pending'}
];

const state={verified:false,pendingRecovery:null,tools:[],audit:[]};
const chat=document.getElementById('chat'), tools=document.getElementById('tools'), audit=document.getElementById('audit');
const identityState=document.getElementById('identityState'), disclosureState=document.getElementById('disclosureState');
const otpDialog=document.getElementById('otpDialog'), otpInput=document.getElementById('otpInput'), otpError=document.getElementById('otpError');

function now(){return new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'});}
function addMsg(role,text,meta=''){const d=document.createElement('div');d.className=`msg ${role}`;const b=document.createElement('div');b.className='bubble';b.textContent=text;if(meta){const m=document.createElement('div');m.className='meta';m.textContent=meta;b.appendChild(m)}d.appendChild(b);chat.appendChild(d);chat.scrollTop=chat.scrollHeight;}
function log(event,resource,result){state.audit.unshift({time:now(),event,resource,result});renderAudit();}
function tool(name,detail){state.tools.unshift({name,detail});tools.innerHTML=state.tools.map(x=>`<div class="trace-item"><strong>${escapeHtml(x.name)}</strong><small>${escapeHtml(x.detail)}</small></div>`).join('');log('TOOL_CALL',name,detail);}
function renderAudit(){audit.innerHTML=state.audit.map(x=>`<tr><td>${escapeHtml(x.time)}</td><td>${escapeHtml(x.event)}</td><td>${escapeHtml(x.resource)}</td><td>${escapeHtml(x.result)}</td></tr>`).join('');}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function getOrder(q){return ORDERS.find(o=>q.toUpperCase().includes(o.orderNumber));}
function verifiedUi(){identityState.textContent='Verified';identityState.className='tag ok';disclosureState.textContent='Authorized';disclosureState.className='tag ok';}

function answer(q){
  const t=q.toLowerCase(); log('USER_REQUEST','workspace','Received');
  if((t.includes("don't know")||t.includes('dont know')||t.includes('lost')||t.includes('what is my order number')||t.includes('recover')) && (t.includes('order')||t.includes('monitor')||t.includes('keyboard'))){
    tool('order.searchCandidates','Synthetic ERP search by purchase context');
    const candidates=ORDERS.filter(o=>o.items.some(i=>/monitor|keyboard/.test(i.toLowerCase())));
    if(candidates.length===1){state.pendingRecovery=candidates[0];log('POLICY_CHECK','order disclosure','Verification required');addMsg('agent',`I found one order that matches the purchase context, but I cannot disclose the order number yet. For security, I need to verify the customer using the registered contact channel (${candidates[0].phone} / ${candidates[0].email}). I’ve initiated a simulated OTP challenge.`,'Identity policy: step-up verification required');tool('identity.requestOtp','OTP sent to masked registered contact');otpInput.value='';otpError.textContent='';otpDialog.showModal();return;}
    addMsg('agent','I found multiple possible orders. I will not expose candidate records. Please provide the registered email/phone and approximate purchase date, or escalate to an authorized representative.','Fail-safe disclosure');log('ESCALATION','order recovery','Ambiguous match');return;
  }
  const o=getOrder(q);
  if(!o){tool('intent.classify','No exact order reference detected');addMsg('agent','I can help with order recovery, payment status, store pickup, delivery ETA, or invoice availability. For this demo, try one of the suggested scenarios above.','Synthetic-data demo');return;}
  tool('order.get',`Retrieved ${o.orderNumber} from mock ERP`);
  if(t.includes('payment')||t.includes('paid')||t.includes('registered')){tool('payment.getStatus',`${o.payment}${o.paymentTime?` at ${o.paymentTime}`:''}`);addMsg('agent',`Payment status for ${o.orderNumber}: ${o.payment}.${o.paymentTime?` The payment record was registered at ${o.paymentTime}.`:''}`,'Source: simulated payment system');return;}
  if(t.includes('pick')||t.includes('store')){tool('fulfillment.getPickupStatus',o.mode==='pickup'?o.fulfillment:'Not a pickup order');if(o.mode!=='pickup'){addMsg('agent',`${o.orderNumber} is configured for delivery, not store pickup.`,'Source: simulated fulfillment system');return;}addMsg('agent',`${o.orderNumber} is currently “${o.fulfillment}” at ${o.store}. It is not yet marked “Ready for Pickup.” Current estimate: ${o.pickupEta}.`,'Transactional status; no inferred readiness');return;}
  if(t.includes('where')||t.includes('arrive')||t.includes('delivery')||t.includes('eta')||t.includes('shipment')){tool('shipment.getTracking',o.mode==='delivery'?`${o.carrier} · ${o.shipment}`:'Pickup order');if(o.mode!=='delivery'){addMsg('agent',`${o.orderNumber} is a store-pickup order, so there is no carrier tracking record.`);return;}addMsg('agent',`${o.orderNumber} is handled by ${o.carrier}. Status: ${o.shipment}.${o.tracking?` Tracking: ${o.tracking}.`:''}${o.lastEvent?` Last event: ${o.lastEvent}.`:''}${o.eta?` Estimated arrival: ${o.eta}.`:' No delivery ETA is available yet.'}`,'Source: simulated carrier API');return;}
  if(t.includes('invoice')||t.includes('factura')||t.includes('send')){tool('invoice.getStatus',o.invoice);if(o.invoice!=='Generated'){addMsg('agent',`The invoice for ${o.orderNumber} is ${o.invoice.toLowerCase()}. I cannot send a document that has not been generated.`,'Guardrail: deterministic invoice status');return;}tool('notification.sendInvoice','Simulated approved email channel');addMsg('agent',`The invoice for ${o.orderNumber} is generated. Demo action completed: invoice queued to the approved registered communication channel.`,'No real email was sent');return;}
  const shipping=o.mode==='delivery'?`${o.carrier} · ${o.shipment}${o.eta?` · ETA ${o.eta}`:''}`:`Pickup · ${o.fulfillment} · ${o.store}`;
  addMsg('agent',`${o.orderNumber}: Payment ${o.payment}. Fulfillment: ${shipping}. Invoice: ${o.invoice}.`,'Consolidated from simulated systems');
}

function submit(q){if(!q.trim())return;addMsg('user',q.trim());setTimeout(()=>answer(q.trim()),180);}
document.getElementById('chatForm').addEventListener('submit',e=>{e.preventDefault();const i=document.getElementById('query');const q=i.value;i.value='';submit(q);});
document.querySelectorAll('[data-q]').forEach(b=>b.addEventListener('click',()=>submit(b.dataset.q)));
document.getElementById('resetBtn').addEventListener('click',()=>{state.verified=false;state.pendingRecovery=null;state.tools=[];state.audit=[];chat.innerHTML='';tools.innerHTML='<div class="empty">No tools invoked yet.</div>';renderAudit();identityState.textContent='Not verified';identityState.className='tag warn';disclosureState.textContent='Restricted';disclosureState.className='tag';welcome();});
document.getElementById('otpForm').addEventListener('submit',e=>{e.preventDefault();if(otpInput.value.trim()!=='246810'){otpError.textContent='Incorrect demo code. Use 246810.';log('VERIFY_FAIL','OTP','Incorrect code');return;}state.verified=true;verifiedUi();tool('identity.verifyOtp','Verification successful');log('DISCLOSURE_AUTH','order recovery','Authorized');const o=state.pendingRecovery;otpDialog.close();addMsg('agent',`Verification successful. The matching order number is ${o.orderNumber}. It contains ${o.items.join(' and ')}. Payment status: ${o.payment}. ${o.mode==='pickup'?`The order is ${o.fulfillment.toLowerCase()} for pickup at ${o.store}.`:`Shipment status: ${o.shipment}.`}`,'Protected data released after verification');});
function welcome(){addMsg('agent','Welcome to the governed Order-to-Delivery Agent demo. I can help a customer-service executive recover an order number, verify payment, check pickup readiness, track a DHL/Estafeta-style shipment, estimate delivery, or send an invoice.','Synthetic portfolio environment');}
welcome();
