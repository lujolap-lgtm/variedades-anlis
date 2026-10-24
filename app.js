const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby2HKgGlLGajKrLPRsg_Rbr_-WlRjmHpnuMqse8P0BwCD7a1-LT-pV20Taurzi9Co9i/exec';
const WHATSAPP='584124033962';
const safe=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const grid=document.querySelector('#catalogo'),cartRoot=document.querySelector('#cartItems'),cartTotal=document.querySelector('#cartTotal'),form=document.querySelector('#orderForm'),statusEl=document.querySelector('#orderStatus');
const cart=[];let sequence=0;
const money=n=>Number(n).toFixed(2);
function render(filtro='Todos'){
 grid.innerHTML=PRODUCTOS.map((p,i)=>({...p,i})).filter(p=>filtro==='Todos'||p.categoria===filtro).map(p=>`<article class="product"><div class="photo">${p.imagen?`<img src="${safe(p.imagen)}" alt="${safe(p.nombre)}" loading="lazy">`:`<span aria-hidden="true">${safe(p.icono)}</span>`}</div><div class="detail"><small>${safe(p.categoria)}</small><h3>${safe(p.nombre)}</h3><p>${safe(p.descripcion)}</p><div class="buy"><div><small>Desde</small><strong>$${money(p.precio)}</strong></div><button type="button" class="selectProduct" data-id="${p.i}">Agregar +</button></div></div></article>`).join('');
}
function add(index){const p=PRODUCTOS[index];if(!p)return;cart.push({uid:++sequence,index,cantidad:1,personalizacion:''});renderCart();document.querySelector('#ordenar').scrollIntoView({behavior:'smooth'});}
function renderCart(){
 cartRoot.innerHTML=cart.length?cart.map(item=>{const p=PRODUCTOS[item.index];return `<article class="cartline" data-uid="${item.uid}"><div class="carthead"><strong>${safe(p.nombre)} — $${money(p.precio)} c/u</strong><button type="button" class="removeItem" aria-label="Quitar producto">Quitar ×</button></div><div class="cartcontrols"><label>Cantidad <input class="itemQty" type="number" min="1" max="100" step="1" value="${item.cantidad}" required></label><span>Subtotal: $${money(p.precio*item.cantidad)}</span></div><label>Personalización de este artículo *<textarea class="itemPersonal" maxlength="1000" required placeholder="Talla, color, nombre, frase, diseño o imagen a enviar por WhatsApp...">${safe(item.personalizacion)}</textarea></label></article>`}).join(''):'<p>Tu carrito está vacío. Agrega productos desde el catálogo.</p>';
 cartTotal.textContent=`Total referencial: $${money(cart.reduce((sum,i)=>sum+PRODUCTOS[i.index].precio*i.cantidad,0))} USD · ${cart.length} artículo(s) diferente(s)`;
}
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(x=>x.classList.remove('active'));b.classList.add('active');render(b.dataset.filter)}));
grid.addEventListener('click',e=>{const b=e.target.closest('.selectProduct');if(b)add(Number(b.dataset.id));});
cartRoot.addEventListener('input',e=>{const line=e.target.closest('[data-uid]');if(!line)return;const item=cart.find(i=>i.uid===Number(line.dataset.uid));if(!item)return;if(e.target.classList.contains('itemQty')){const n=Number(e.target.value);if(Number.isInteger(n)&&n>=1&&n<=100){item.cantidad=n;cartTotal.textContent=`Total referencial: $${money(cart.reduce((s,i)=>s+PRODUCTOS[i.index].precio*i.cantidad,0))} USD`;line.querySelector('.cartcontrols span').textContent=`Subtotal: $${money(PRODUCTOS[item.index].precio*n)}`;}}if(e.target.classList.contains('itemPersonal'))item.personalizacion=e.target.value;});
cartRoot.addEventListener('click',e=>{const b=e.target.closest('.removeItem');if(!b)return;const uid=Number(b.closest('[data-uid]').dataset.uid);cart.splice(cart.findIndex(i=>i.uid===uid),1);renderCart();});
form.addEventListener('submit',async e=>{
 e.preventDefault();if(!form.reportValidity())return;
 if(!cart.length){statusEl.textContent='Agrega al menos un producto al carrito.';return;}
 if(!/^\+?[0-9()\s-]{7,25}$/.test(form.telefono.value.trim())){statusEl.textContent='Revisa el número de teléfono.';return;}
 if(cart.some(i=>!i.personalizacion.trim()||!Number.isInteger(i.cantidad)||i.cantidad<1||i.cantidad>100)){statusEl.textContent='Completa la personalización y cantidad válida de cada artículo.';return;}
 const pedidoId='ANL-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,8).toUpperCase();
 const items=cart.map(i=>{const p=PRODUCTOS[i.index];return {producto:p.nombre,categoria:p.categoria,cantidad:i.cantidad,precioUnitario:Number(p.precio),personalizacion:i.personalizacion.trim()}});
 const total=items.reduce((s,i)=>s+i.cantidad*i.precioUnitario,0);
 const data={pedidoId,nombre:form.nombre.value.trim(),telefono:form.telefono.value.trim(),entrega:form.entrega.value,direccion:form.direccion.value.trim(),observaciones:form.observaciones.value.trim(),items,total,origen:'Web Variedades Anlis carrito'};
 const mensaje=`Hola, quiero consultar/confirmar este pedido de Variedades Anlis.\nPedido: ${pedidoId}\nCliente: ${data.nombre}\nTeléfono: ${data.telefono}\n\n${items.map((i,k)=>`${k+1}. ${i.producto}\nCantidad: ${i.cantidad} × $${money(i.precioUnitario)} = $${money(i.cantidad*i.precioUnitario)}\nPersonalización: ${i.personalizacion}`).join('\n\n')}\n\nTotal referencial: $${money(total)} USD\nEntrega: ${data.entrega}\nZona: ${data.direccion||'Por coordinar'}\nObservaciones: ${data.observaciones||'Ninguna'}\nQuedo pendiente de confirmación de disponibilidad y precio final.`;
 const wa=window.open('about:blank','_blank');const btn=document.querySelector('#enviarPedido');btn.disabled=true;statusEl.textContent='Enviando solicitud de registro...';
 try{await fetch(SCRIPT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(data)});statusEl.textContent='Solicitud enviada. Verifica que aparezca en Google Sheets; WhatsApp no confirma el registro automáticamente.';}catch(err){statusEl.textContent='No se pudo enviar la solicitud de registro. Registra manualmente el pedido si es necesario.';}
 const link='https://wa.me/'+WHATSAPP+'?text='+encodeURIComponent(mensaje);if(wa)wa.location.href=link;else{const a=document.createElement('a');a.href=link;a.target='_blank';a.rel='noopener';a.textContent='Abrir WhatsApp';statusEl.append(' ',a);}btn.disabled=false;
});
document.querySelector('#year').textContent=new Date().getFullYear();render();renderCart();
