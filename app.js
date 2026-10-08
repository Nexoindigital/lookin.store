// Look-in Store · catálogo, filtros, ficha de playera y pedido por Instagram
(() => {
  const IG = 'https://ig.me/m/lookinstore.oax';
  const $ = (id) => document.getElementById(id);
  const P = window.PRODUCTS || [];
  const CATS = [
    { id: 'todo', label: 'Todo' },
    { id: 'hellstar', label: 'Hellstar', cover: 4 },
    { id: 'essentials', label: 'Essentials', cover: 11 },
  ];
  const LABEL = Object.fromEntries(CATS.map((c) => [c.id, c.label]));
  const pad = (n) => String(n).padStart(2, '0');
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const msgFor = (p) => `Hola, me interesa la #${pad(p.n)} · ${p.name}. Talla${p.tallas ? ' (' + p.tallas.join(' / ') + ')' : ''}: `;
  let cat = 'todo', query = '';
  const dlg = $('modal');

  // cinta superior
  const t = 'NUEVO DROP ✦ PEDIDOS POR INSTAGRAM ✦ ENTREGAS EN OAXACA ✦ ENVÍOS A TODO MÉXICO ✦ ESSENTIALS EN CH Y M ✦ @LOOKINSTORE.OAX ✦ ';
  $('ticker').textContent = t.repeat(6);

  // ojos del logo: siguen el cursor (o el dedo)
  const pupils = document.querySelectorAll('.eye i');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function look(x, y) {
    pupils.forEach((pu) => {
      const r = pu.parentElement.getBoundingClientRect();
      const dx = x - (r.left + r.width / 2), dy = y - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) || 1, m = r.width * 0.2;
      pu.style.transform = `translate(${(dx / d) * Math.min(m, d / 8)}px, ${(dy / d) * Math.min(m, d / 8)}px)`;
    });
  }
  if (!reduce) {
    window.addEventListener('pointermove', (e) => look(e.clientX, e.clientY), { passive: true });
  }

  // aviso
  let toastTimer;
  function toast(text) {
    const el = $('toast'); (dlg.open ? dlg : document.body).appendChild(el); el.textContent = text; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 4200);
  }
  function copy(text) {
    try { return navigator.clipboard.writeText(text).then(() => true, () => false); } catch (e) { return Promise.resolve(false); }
  }
  // «Pedir»: el enlace abre el chat de Instagram; al mismo tiempo copiamos el mensaje para pegarlo
  function wireOrder(a, p) {
    a.href = IG; a.target = '_blank'; a.rel = 'noopener';
    a.addEventListener('click', () => {
      const m = msgFor(p);
      copy(m).then((ok) => toast(ok ? `Copiamos tu mensaje. Pégalo en nuestro chat de Instagram, agrega tu talla y envíalo.` : `Escríbenos en Instagram: «Hola, me interesa la #${pad(p.n)}»`));
    });
  }

  // colecciones
  const count = (id) => P.filter((p) => p.cat === id).length;
  CATS.filter((c) => c.cover).forEach((c) => {
    const b = document.createElement('button'); b.className = 'cat'; b.type = 'button';
    const cover = P.find((p) => p.n === c.cover);
    b.innerHTML = `<img src="${cover.img}" alt="" loading="lazy"><div><b></b><span></span></div><em aria-hidden="true">→</em>`;
    b.querySelector('b').textContent = c.label;
    b.querySelector('span').textContent = c.id === 'essentials' ? 'Negra · Blanca · Gris' : `${count(c.id)} modelos`;
    b.addEventListener('click', () => { setCat(c.id); $('productos').scrollIntoView(); });
    $('cats').appendChild(b);
  });

  // filtros
  CATS.forEach((c) => {
    const b = document.createElement('button'); b.className = 'chip'; b.type = 'button'; b.dataset.cat = c.id;
    b.innerHTML = `${c.label}<small>${c.id === 'todo' ? P.length : count(c.id)}</small>`;
    b.addEventListener('click', () => setCat(c.id));
    $('chips').appendChild(b);
  });
  function setCat(id) {
    cat = id;
    document.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', b.dataset.cat === id ? 'true' : 'false'));
    render();
  }
  $('q').addEventListener('input', (e) => { query = e.target.value; render(); });

  // cuadrícula
  function card(p) {
    const el = document.createElement('article'); el.className = 'card' + (p.agotado ? ' is-sold' : '');
    el.innerHTML = `<button class="card-img" type="button"><img loading="lazy" alt=""><span class="num"></span>${p.agotado ? '<span class="sold">AGOTADO</span>' : ''}</button>
      <div class="card-body"><span class="card-cat"></span><h3 class="card-name"></h3><span class="card-sz"></span>
      <div class="card-actions"><button class="btn btn-ghost" type="button">Detalles</button><a class="btn btn-ink"></a></div></div>`;
    el.querySelector('img').src = p.img; el.querySelector('img').alt = p.name;
    el.querySelector('.num').textContent = '#' + pad(p.n);
    el.querySelector('.card-cat').textContent = LABEL[p.cat];
    el.querySelector('.card-name').textContent = p.name;
    el.querySelector('.card-sz').textContent = p.tallas ? 'Tallas: ' + p.tallas.join(' · ') : 'Talla: pregunta por DM';
    const order = el.querySelector('a.btn'); order.textContent = p.agotado ? 'Preguntar' : 'Pedir'; wireOrder(order, p);
    el.querySelector('.card-img').addEventListener('click', () => open(p));
    el.querySelector('.btn-ghost').addEventListener('click', () => open(p));
    return el;
  }
  function render() {
    const q = norm(query.trim().replace(/^#/, ''));
    const hay = (p) => norm(`${p.name} ${p.desc} ${p.feats.join(' ')} ${LABEL[p.cat]}`);
    const list = P.filter((p) => (cat === 'todo' || p.cat === cat) && (!q || hay(p).includes(q) || pad(p.n) === q.padStart(2, '0')));
    const grid = $('grid'); grid.textContent = '';
    list.forEach((p) => grid.appendChild(card(p)));
    $('empty').hidden = list.length > 0;
    $('count').textContent = `${list.length} ${list.length === 1 ? 'playera' : 'playeras'}${cat !== 'todo' ? ' en ' + LABEL[cat] : ''}`;
  }

  // ficha
  let current = null;
  function open(p, fromHash) {
    current = p;
    $('m-img').src = p.img; $('m-img').alt = p.name;
    $('m-meta').textContent = `#${pad(p.n)} · ${LABEL[p.cat]}${p.agotado ? ' · Agotado' : ''}`;
    $('m-name').textContent = p.name; $('m-desc').textContent = p.desc;
    const ul = $('m-feats'); ul.textContent = '';
    p.feats.forEach((f) => { const li = document.createElement('li'); li.textContent = f; ul.appendChild(li); });
    const sz = $('m-sizes'); sz.textContent = '';
    (p.tallas || []).forEach((k) => { const s = document.createElement('span'); s.textContent = k; sz.appendChild(s); });
    sz.hidden = !p.tallas;
    const old = $('m-order'), a = old.cloneNode(false); old.replaceWith(a);
    a.id = 'm-order'; a.className = 'btn btn-ink btn-block';
    a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.3" cy="6.7" r=".9" class="fill"/></svg>';
    a.append(p.agotado ? 'Preguntar disponibilidad' : 'Pedir por Instagram'); wireOrder(a, p);
    $('m-note').textContent = `Los pedidos se hacen por Instagram. Copiamos «Hola, me interesa la #${pad(p.n)}» para que solo lo pegues en el chat de @lookinstore.oax con tu talla. Te compartimos precio y disponibilidad por DM.`;
    if (!dlg.open) dlg.showModal();
    if (!fromHash) history.replaceState(null, '', '#p' + pad(p.n));
  }
  function close() { dlg.close(); }
  dlg.addEventListener('close', () => { if (location.hash.startsWith('#p')) history.replaceState(null, '', location.pathname + location.search); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
  $('m-close').addEventListener('click', close);
  $('m-share').addEventListener('click', () => {
    const url = location.origin + location.pathname + '#p' + pad(current.n);
    copy(url).then((ok) => toast(ok ? 'Enlace copiado. Compártelo por WhatsApp o Instagram.' : url));
  });
  function fromHash() {
    const m = location.hash.match(/^#p(\d{1,2})$/);
    if (!m) return; const p = P.find((x) => x.n === Number(m[1])); if (p) open(p, true);
  }
  window.addEventListener('hashchange', fromHash);

  setCat('todo');
  fromHash();
})();
