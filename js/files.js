// ── scholars-space/js/files.js ──
// File metadata + upload request management (JSON via localStorage)

const FILES_KEY   = 'ss_files';
const REQUESTS_KEY = 'ss_requests';

function getFiles() {
  return JSON.parse(localStorage.getItem(FILES_KEY) || '[]');
}
function saveFiles(files) {
  localStorage.setItem(FILES_KEY, JSON.stringify(files));
}

function getRequests() {
  return JSON.parse(localStorage.getItem(REQUESTS_KEY) || '[]');
}
function saveRequests(reqs) {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(reqs));
}

// Submit upload request (senior users)
function submitUploadRequest(user, fileName, fileType, description, dataUrl) {
  const reqs = getRequests();
  reqs.push({
    id: Date.now(),
    uploaderEmail: user.email,
    uploaderName: user.name,
    fileName,
    fileType,
    description,
    dataUrl,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
  saveRequests(reqs);
}

// Admin approves request → moves to files
function approveRequest(id) {
  const reqs = getRequests();
  const req = reqs.find(r => r.id === id);
  if (!req) return;
  req.status = 'approved';
  saveRequests(reqs);

  const files = getFiles();
  files.push({
    id: req.id,
    name: req.fileName,
    type: req.fileType,
    description: req.description,
    dataUrl: req.dataUrl,
    uploaderName: req.uploaderName,
    uploaderEmail: req.uploaderEmail,
    uploadedAt: new Date().toISOString()
  });
  saveFiles(files);
}

// Admin rejects request
function rejectRequest(id) {
  const reqs = getRequests();
  const req = reqs.find(r => r.id === id);
  if (req) { req.status = 'rejected'; saveRequests(reqs); }
}

// File type → emoji icon
function fileIcon(type) {
  if (!type) return '📄';
  if (type.includes('pdf')) return '📕';
  if (type.includes('image')) return '🖼️';
  if (type.includes('word') || type.includes('document')) return '📘';
  if (type.includes('presentation') || type.includes('powerpoint')) return '📊';
  if (type.includes('spreadsheet') || type.includes('excel')) return '📗';
  if (type.includes('text')) return '📝';
  return '📦';
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}
