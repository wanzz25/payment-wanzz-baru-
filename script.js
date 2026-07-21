// ============ WAZZ PAYMENT — shared behavior ============

// Reveal on scroll
document.addEventListener('DOMContentLoaded', () => {
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.15 });
  els.forEach(el => io.observe(el));

  // Method card mouse glow
  document.querySelectorAll('.method-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // Nav shrink / smooth anchor (progressive enhancement only)
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
      }
    });
  });
});

// Build the QR grid pattern once (deterministic-looking "scan")
function buildQR(container) {
  if (!container) return;
  const pattern = [
    1,1,1,0,1,1,1,
    1,0,1,0,1,0,1,
    1,0,1,1,1,0,1,
    0,0,0,1,0,0,0,
    1,0,1,1,1,0,1,
    1,0,1,0,1,0,1,
    1,1,1,0,1,1,1,
  ];
  const corners = [0,1,7,8,42,43,48,49].map(n => n); // approx corners in 7x7 index terms not needed
  pattern.forEach((v, i) => {
    const cell = document.createElement('i');
    if (v) cell.classList.add('on');
    // mark the 3 finder corners bold cyan
    if ([0,6,42].includes(i)) cell.classList.add('corner');
    container.appendChild(cell);
  });
}
document.querySelectorAll('.qr-grid').forEach(buildQR);

// ============ LOGIN FLOW ============
function initLoginFlow() {
  const btn = document.getElementById('enterBtn');
  const overlay = document.getElementById('loaderOverlay');
  if (!btn || !overlay) return;

  const bar = overlay.querySelector('.loader-bar i');
  const text = overlay.querySelector('.loader-text');
  const steps = [
    'Memeriksa koneksi aman…',
    'Menyiapkan enkripsi 256-bit…',
    'Menghubungkan ke gateway…',
    'Menyusun dashboard…',
  ];

  btn.addEventListener('click', () => {
    overlay.classList.add('show');
    let progress = 0;
    let stepIndex = 0;
    text.innerHTML = `<b>${steps[0]}</b>`;

    const interval = setInterval(() => {
      progress += Math.random() * 18 + 6;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        text.innerHTML = `<b>Berhasil masuk. Mengalihkan…</b>`;
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 650);
      } else {
        const newStep = Math.min(steps.length - 1, Math.floor(progress / (100 / steps.length)));
        if (newStep !== stepIndex) {
          stepIndex = newStep;
          text.innerHTML = `<b>${steps[stepIndex]}</b>`;
        }
      }
      bar.style.width = progress + '%';
    }, 260);
  });
}
initLoginFlow();

// ============ TOAST (dashboard demo interactions) ============
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span class="dot-pulse"></span> ${msg}`;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}
document.querySelectorAll('[data-toast]').forEach(el => {
  el.addEventListener('click', () => showToast(el.getAttribute('data-toast')));
});

// ============ QRIS DEMO MODAL (client-side only, no backend) ============
function initQrisModal() {
  const modal = document.getElementById('qrisModal');
  if (!modal) return;
  const openers = [document.getElementById('openQrisDemo'), document.getElementById('openQrisDemo2')].filter(Boolean);
  const closeBtn = document.getElementById('closeQrisModal');
  const payBtn = document.getElementById('simulatePay');
  const statusEl = document.getElementById('qrisModalStatus');

  const open = () => { modal.classList.add('show'); if (statusEl) statusEl.textContent = ''; };
  const close = () => modal.classList.remove('show');

  openers.forEach(btn => btn.addEventListener('click', open));
  if (closeBtn) closeBtn.addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  if (payBtn) payBtn.addEventListener('click', () => {
    statusEl.textContent = 'Memeriksa pembayaran (demo)…';
    payBtn.disabled = true;
    setTimeout(() => {
      statusEl.textContent = '✓ Pembayaran demo berhasil dicatat.';
      payBtn.disabled = false;
      showToast('Demo QRIS ditandai lunas.');
      const body = document.getElementById('txBody');
      if (body) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td class="mono">WZ-${Math.random().toString(16).slice(2,8).toUpperCase()}</td><td>QRIS (Demo)</td><td class="mono">Rp 50.000</td><td><span class="badge success">Berhasil</span></td><td>baru saja</td>`;
        body.prepend(tr);
      }
      setTimeout(close, 900);
    }, 1400);
  });
}
initQrisModal();
