// ── scholars-space/js/app.js ──
// SPA router & page mounting

const $ = id => document.getElementById(id);
const main = document.getElementById('main-content');

// ── NAV BLUR ON SCROLL ──
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 10);
});

// ── ROUTER ──
const routes = {
  '#home':     renderHome,
  '#login':    renderLogin,
  '#register': renderRegister,
  '#files':    renderFiles,
  '#upload':   renderUpload,
  '#admin':    renderAdmin,
  '#about':    renderAbout,
  '#feedback': renderFeedback,
};

function navigate(hash) {
  window.location.hash = hash;
}

window.addEventListener('hashchange', route);
window.addEventListener('load', route);

function route() {
  const hash = window.location.hash || '#home';
  const fn = routes[hash] || renderHome;
  updateNav();
  main.innerHTML = '';
  fn();
}

function updateNav() {
  const session = getCurrentSession();
  const navLinks = document.getElementById('nav-links');
  const hash = window.location.hash || '#home';

  let links = `<a href="#home" class="${hash==='#home'?'active':''}">Home</a>
               <a href="#files" class="${hash==='#files'?'active':''}">Files</a>
               <a href="#about" class="${hash==='#about'?'active':''}">About</a>
               <a href="#feedback" class="${hash==='#feedback'?'active':''}">Feedback</a>`;

  if (session) {
    if (session.role === 'senior') links += `<a href="#upload">Upload</a>`;
    if (session.role === 'admin')  links += `<a href="#admin">Admin</a>`;
    links += `<a href="#" class="btn-nav" onclick="handleLogout(event)">Logout</a>`;
  } else {
    links += `<a href="#login" class="btn-nav">Sign In</a>`;
  }
  navLinks.innerHTML = links;
}

function handleLogout(e) {
  e.preventDefault();
  clearSession();
  navigate('#home');
}

// ── HOME ──
function renderHome() {
  const session = getCurrentSession();
  const files = getFiles();
  const cta = session
    ? (session.role === 'senior' ? `<a href="#upload" class="btn btn-primary">Upload a Resource</a>` : `<a href="#files" class="btn btn-primary">Browse Resources</a>`)
    : `<a href="#register" class="btn btn-primary">Join Scholar Space</a> <a href="#login" class="btn btn-secondary">Sign In</a>`;

  const recentCards = files.slice(-3).reverse().map(f => `
    <div class="card file-card" onclick="navigate('#files')">
      <div class="file-icon">${fileIcon(f.type)}</div>
      <h3>${esc(f.name)}</h3>
      <div class="file-meta">${esc(f.uploaderName)} · ${formatDate(f.uploadedAt)}</div>
    </div>`).join('');

  main.innerHTML = `<div class="page">
    <div class="hero">
      <h1>Share Knowledge,<br>Grow Together</h1>
      <p>Scholar Space is a peer resource hub — upload notes, papers, and study materials for your fellow students.</p>
      <div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap">${cta}</div>
    </div>
    ${session ? `<div class="container" style="padding-top:0">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem">
        <h2 style="margin:0">Recent Uploads</h2>
        <a href="#files" style="font-size:0.85rem;color:var(--accent);text-decoration:none">View all →</a>
      </div>
      ${files.length ? `<div class="file-grid">${recentCards}</div>` : `<p style="text-align:center;padding:2rem 0">No files uploaded yet. Be the first!</p>`}
    </div>` : ''}
  </div>`;
}

// ── LOGIN ──
function renderLogin() {
  main.innerHTML = `<div class="page"><div class="container" style="max-width:420px">
    <h2>Sign In</h2>
    <p style="margin-bottom:1.5rem">Welcome back to Scholar Space.</p>
    <div id="login-alert"></div>
    <div class="card">
      <div class="form-group"><label>Email</label><input id="l-email" type="email" placeholder="you@mail.com"></div>
      <div class="form-group"><label>Password</label><input id="l-pass" type="password" placeholder="••••••••"></div>
      <button class="btn btn-primary" style="width:100%" onclick="doLogin()">Sign In</button>
    </div>
    <p style="text-align:center;margin-top:1rem;font-size:0.875rem">No account? <a href="#register" style="color:var(--accent)">Register</a></p>
  </div></div>`;
}

function doLogin() {
  const email = $('l-email').value.trim();
  const pass  = $('l-pass').value;
  const res = login(email, pass);
  if (!res.ok) { showAlert('login-alert', res.msg, 'error'); return; }
  navigate('#home');
}

// ── REGISTER ──
function renderRegister() {
  main.innerHTML = `<div class="page"><div class="container" style="max-width:420px">
    <h2>Create Account</h2>
    <p style="margin-bottom:1.5rem">Your email determines your role automatically.</p>
    <div id="reg-alert"></div>
    <div class="card">
      <div class="form-group"><label>Full Name</label><input id="r-name" type="text" placeholder="Your name"></div>
      <div class="form-group"><label>College Email</label><input id="r-email" type="email" placeholder="name.24bca@mail.com"></div>
      <div class="form-group"><label>Password</label><input id="r-pass" type="password" placeholder="Min 6 characters"></div>
      <button class="btn btn-primary" style="width:100%" onclick="doRegister()">Create Account</button>
    </div>
    <div class="card" style="margin-top:1rem;font-size:0.82rem;line-height:1.8;color:var(--muted)">
      <strong style="color:var(--text)">Role assignment:</strong><br>
      1st year → <span class="tag tag-junior">Junior</span> (view only)<br>
      2nd–4th year → <span class="tag tag-senior">Senior</span> (can upload)<br>
      Admin login is separate.
    </div>
    <p style="text-align:center;margin-top:1rem;font-size:0.875rem">Have account? <a href="#login" style="color:var(--accent)">Sign in</a></p>
  </div></div>`;
}

function doRegister() {
  const name  = $('r-name').value.trim();
  const email = $('r-email').value.trim();
  const pass  = $('r-pass').value;
  if (!name || !email || !pass) { showAlert('reg-alert','All fields required.','error'); return; }
  if (pass.length < 6) { showAlert('reg-alert','Password must be at least 6 characters.','error'); return; }
  const res = register(name, email, pass);
  if (!res.ok) { showAlert('reg-alert', res.msg, 'error'); return; }
  navigate('#home');
}

// ── FILES ──
function renderFiles() {
  const session = getCurrentSession();
  const files = getFiles();
  const cards = files.length
    ? files.map(f => `
      <div class="card file-card">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div class="file-icon">${fileIcon(f.type)}</div>
          ${session ? `<a href="${esc(f.dataUrl)}" download="${esc(f.name)}" class="btn btn-secondary" style="padding:0.35rem 0.75rem;font-size:0.78rem">↓ Download</a>` : ''}
        </div>
        <h3>${esc(f.name)}</h3>
        <p style="font-size:0.82rem;margin:0.3rem 0 0.5rem">${esc(f.description || '')}</p>
        <div class="file-meta">By ${esc(f.uploaderName)} · ${formatDate(f.uploadedAt)}</div>
      </div>`).join('')
    : `<p style="text-align:center;padding:3rem 0;grid-column:1/-1">No resources yet. Senior students can upload!</p>`;

  const loginPrompt = !session ? `<div class="alert alert-error" style="margin-bottom:1.5rem">
    <a href="#login" style="color:inherit;font-weight:500">Sign in</a> to download files.
  </div>` : '';

  main.innerHTML = `<div class="page"><div class="container">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem">
      <h2 style="margin:0">Resources</h2>
      ${session?.role==='senior' ? `<a href="#upload" class="btn btn-primary">+ Upload</a>` : ''}
    </div>
    <p style="margin-bottom:1.5rem">Browse study materials shared by your peers.</p>
    ${loginPrompt}
    <div class="file-grid">${cards}</div>
  </div></div>`;
}

// ── UPLOAD ──
function renderUpload() {
  const session = getCurrentSession();
  if (!session || session.role === 'junior') {
    main.innerHTML = `<div class="page"><div class="container"><div class="alert alert-error">Access denied. Only 2nd–4th year students can upload files.</div></div></div>`;
    return;
  }
  if (session.role === 'admin') { navigate('#admin'); return; }

  main.innerHTML = `<div class="page"><div class="container" style="max-width:560px">
    <h2>Upload Resource</h2>
    <p style="margin-bottom:1.5rem">Your file will be reviewed by an admin before going live.</p>
    <div id="upload-alert"></div>
    <div class="card">
      <div class="form-group">
        <label>File</label>
        <div class="upload-zone" id="upload-zone" onclick="$('file-input').click()">
          <div style="font-size:2rem;margin-bottom:0.5rem">📂</div>
          <p style="margin:0;color:var(--muted);font-size:0.875rem">Click to browse or drag & drop</p>
          <p id="file-name" style="margin-top:0.5rem;font-size:0.82rem;color:var(--accent)"></p>
        </div>
        <input id="file-input" type="file" class="hidden" accept="*/*" onchange="handleFileSelect(this)">
      </div>
      <div id="file-preview" class="hidden" style="border:1px solid var(--border);border-radius:8px;padding:0.75rem 1rem;margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between;background:var(--bg)">
        <div style="display:flex;align-items:center;gap:0.75rem">
          <span id="preview-icon" style="font-size:1.5rem"></span>
          <div>
            <div id="preview-name" style="font-size:0.875rem;font-weight:500"></div>
            <div id="preview-size" style="font-size:0.75rem;color:var(--muted)"></div>
          </div>
        </div>
        <button class="btn btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.78rem" onclick="clearFile()">✕</button>
      </div>
      <div class="form-group"><label>Description</label><textarea id="u-desc" placeholder="Briefly describe what this resource covers..."></textarea></div>
      <button class="btn btn-primary" style="width:100%" onclick="doUpload()">Submit for Review</button>
    </div>
  </div></div>`;

  const zone = document.getElementById('upload-zone');
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('drag');
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  });
}

let selectedFile = null;
function handleFileSelect(input) {
  if (input.files[0]) loadFile(input.files[0]);
}
function loadFile(file) {
  selectedFile = file;
  document.getElementById('file-name').textContent = '';
  // Show preview card
  const preview = document.getElementById('file-preview');
  document.getElementById('preview-icon').textContent = fileIcon(file.type);
  document.getElementById('preview-name').textContent = file.name;
  document.getElementById('preview-size').textContent = formatSize(file.size) + ' · ' + (file.type || 'unknown type');
  preview.classList.remove('hidden');
  preview.style.display = 'flex';
}
function clearFile() {
  selectedFile = null;
  $('file-input').value = '';
  document.getElementById('file-preview').classList.add('hidden');
}
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
function doUpload() {
  const session = getCurrentSession();
  const desc = $('u-desc').value.trim();
  if (!selectedFile) { showAlert('upload-alert','Please select a file.','error'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    submitUploadRequest(session, selectedFile.name, selectedFile.type, desc, e.target.result);
    showAlert('upload-alert','File submitted for admin review!','success');
    selectedFile = null;
    $('file-name').textContent = '';
    $('u-desc').value = '';
  };
  reader.readAsDataURL(selectedFile);
}

// ── ADMIN ──
function renderAdmin() {
  const session = getCurrentSession();
  if (!session || session.role !== 'admin') {
    main.innerHTML = `<div class="page"><div class="container"><div class="alert alert-error">Admin access only.</div></div></div>`;
    return;
  }
  const reqs = getRequests().filter(r => r.status === 'pending');
  const rows = reqs.length
    ? reqs.map(r => `
      <div class="request-row">
        <div class="request-info">
          <strong>${esc(r.fileName)}</strong><br>
          <span style="color:var(--muted);font-size:0.78rem">by ${esc(r.uploaderName)} (${esc(r.uploaderEmail)}) · ${formatDate(r.createdAt)}</span><br>
          <span style="font-size:0.82rem">${esc(r.description || '')}</span>
        </div>
        <div class="request-actions">
          <button class="btn btn-primary" style="padding:0.35rem 0.75rem;font-size:0.8rem" onclick="doApprove(${r.id})">✓ Approve</button>
          <button class="btn btn-danger" style="padding:0.35rem 0.75rem;font-size:0.8rem" onclick="doReject(${r.id})">✕ Reject</button>
        </div>
      </div>`).join('')
    : `<p style="text-align:center;padding:2rem;color:var(--muted)">No pending requests.</p>`;

  const approvedCount = getFiles().length;
  main.innerHTML = `<div class="page"><div class="container">
    <h2>Admin Panel</h2>
    <p style="margin-bottom:1.5rem">Manage upload requests and platform resources.</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1rem;margin-bottom:2rem">
      <div class="card" style="text-align:center"><div style="font-size:1.8rem;font-weight:700">${reqs.length}</div><div style="color:var(--muted);font-size:0.85rem">Pending</div></div>
      <div class="card" style="text-align:center"><div style="font-size:1.8rem;font-weight:700">${approvedCount}</div><div style="color:var(--muted);font-size:0.85rem">Approved Files</div></div>
      <div class="card" style="text-align:center"><div style="font-size:1.8rem;font-weight:700">${getUsers().length}</div><div style="color:var(--muted);font-size:0.85rem">Users</div></div>
    </div>
    <h3 style="margin-bottom:1rem">Pending Upload Requests</h3>
    ${rows}

    <hr class="divider">
    <h3 style="margin-bottom:1rem">Feedback Submissions</h3>
    ${renderFeedbackList()}
  </div></div>`;
}

function doApprove(id) { approveRequest(id); renderAdmin(); }
function doReject(id)  { rejectRequest(id);  renderAdmin(); }

// ── ABOUT ──
function renderAbout() {
  const teamCards = TEAM.map(m => `
    <div class="card" style="text-align:center">
      <div style="font-size:2.5rem;margin-bottom:0.75rem">${m.avatar}</div>
      <h3 style="margin-bottom:0.2rem">${esc(m.name)}</h3>
      <div style="font-size:0.78rem;color:var(--accent);font-weight:500;margin-bottom:0.5rem;letter-spacing:0.04em;text-transform:uppercase">${esc(m.role)}</div>
      <p style="font-size:0.83rem;margin-bottom:0.5rem">${esc(m.bio)}</p>
      <a href="mailto:${esc(m.email)}" style="font-size:0.78rem;color:var(--muted);text-decoration:none">${esc(m.email)}</a>
    </div>`).join('');

  main.innerHTML = `<div class="page"><div class="container" style="max-width:720px">
    <h2>About Scholar Space</h2>
    <p style="margin-bottom:2rem">A peer-to-peer academic resource sharing platform built for students, by students.</p>

    <div class="card" style="margin-bottom:1rem">
      <h3>Our Mission</h3>
      <p>Scholar Space bridges the gap between seniors and juniors — making it easy to share notes, past papers, and study materials across years, so no student has to start from scratch.</p>
    </div>
    <div class="card" style="margin-bottom:1rem">
      <h3>How It Works</h3>
      <p>Register with your college email. Your batch year is automatically detected to assign your role. Seniors upload; juniors discover and download. Admins keep quality in check.</p>
    </div>
    <div class="card" style="margin-bottom:2rem">
      <h3>Role System</h3>
      <div style="margin-top:0.75rem;display:flex;flex-direction:column;gap:0.6rem;font-size:0.875rem">
        <div><span class="tag tag-junior">Junior</span> &nbsp;1st year — can browse &amp; download resources.</div>
        <div><span class="tag tag-senior">Senior</span> &nbsp;2nd–4th year — can also upload and share.</div>
        <div><span class="tag tag-admin">Admin</span> &nbsp;Reviews and approves all uploaded content.</div>
      </div>
    </div>

    <h2 style="margin-bottom:1.25rem">Meet the Team</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem">
      ${teamCards}
    </div>
  </div></div>`;
}

// ── FEEDBACK ──
function renderFeedback() {
  main.innerHTML = `<div class="page"><div class="container" style="max-width:520px">
    <h2>Feedback</h2>
    <p style="margin-bottom:1.5rem">We'd love to hear your thoughts — suggestions, bug reports, or anything else.</p>
    <div id="fb-alert"></div>
    <div class="card" style="margin-bottom:1rem">
      <div class="form-group"><label>Name</label><input id="fb-name" type="text" placeholder="Your name"></div>
      <div class="form-group"><label>Email</label><input id="fb-email" type="email" placeholder="you@mail.com"></div>
      <div class="form-group">
        <label>Category</label>
        <select id="fb-cat">
          <option value="general">General Feedback</option>
          <option value="bug">Bug Report</option>
          <option value="suggestion">Feature Suggestion</option>
          <option value="content">Content Issue</option>
        </select>
      </div>
      <div class="form-group"><label>Message</label><textarea id="fb-msg" placeholder="Share your thoughts..."></textarea></div>
      <div style="display:flex;gap:0.6rem">
        <button class="btn btn-primary" style="flex:1" onclick="doFeedback('save')">💾 Save Feedback</button>
        <button class="btn btn-secondary" style="flex:1" onclick="doFeedback('email')">✉️ Send via Email</button>
      </div>
    </div>
    <p style="font-size:0.78rem;color:var(--muted);text-align:center">
      "Save Feedback" stores your response locally. "Send via Email" opens your mail client.
    </p>
  </div></div>`;

  const s = getCurrentSession();
  if (s) { $('fb-name').value = s.name; $('fb-email').value = s.email; }
}

function doFeedback(mode) {
  const name  = $('fb-name').value.trim();
  const email = $('fb-email').value.trim();
  const cat   = $('fb-cat').value;
  const msg   = $('fb-msg').value.trim();
  if (!name || !msg) { showAlert('fb-alert', 'Please fill in name and message.', 'error'); return; }

  // Always save to JSON store
  const all = JSON.parse(localStorage.getItem('ss_feedback') || '[]');
  all.push({ name, email, cat, msg, at: new Date().toISOString() });
  localStorage.setItem('ss_feedback', JSON.stringify(all));

  if (mode === 'email') {
    const subject = encodeURIComponent(`[Scholar Space Feedback] ${cat}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nCategory: ${cat}\n\n${msg}`);
    window.location.href = `mailto:admin@mail?subject=${subject}&body=${body}`;
  }

  showAlert('fb-alert', 'Feedback saved! Thank you.', 'success');
  $('fb-msg').value = '';
}

function renderFeedbackList() {
  const all = JSON.parse(localStorage.getItem('ss_feedback') || '[]').reverse();
  if (!all.length) return `<p style="color:var(--muted);font-size:0.875rem;padding:1rem 0">No feedback submitted yet.</p>`;
  return all.map(f => `
    <div style="border:1px solid var(--border);border-radius:8px;padding:0.85rem 1rem;margin-bottom:0.6rem;background:var(--surface)">
      <div style="display:flex;justify-content:space-between;margin-bottom:0.3rem">
        <strong style="font-size:0.875rem">${esc(f.name)} <span style="color:var(--muted);font-weight:400">&lt;${esc(f.email || '—')}&gt;</span></strong>
        <span style="font-size:0.75rem;color:var(--muted)">${formatDate(f.at)}</span>
      </div>
      <div style="font-size:0.75rem;color:var(--accent);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.4rem">${esc(f.cat || 'general')}</div>
      <p style="font-size:0.875rem;margin:0">${esc(f.msg)}</p>
    </div>`).join('');
}

// ── UTILS ──
function showAlert(id, msg, type) {
  $(id).innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
  setTimeout(() => { if ($(id)) $(id).innerHTML = ''; }, 4000);
}
function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
