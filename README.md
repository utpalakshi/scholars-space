# Scholar Space — Peer Academic Resource Sharer

**Scholar Space** is a peer-to-peer academic resource sharing web platform built for college students. It connects seniors and juniors by enabling senior students to share study materials, notes, lab records, and past exam papers, while juniors can easily discover and download curated content.

---

## 🌟 Key Features

- **Automated Role Detection**:
  - Roles are inferred automatically from college email patterns (e.g. `name.24bca@mail`):
    - **Junior (1st Year)**: Can browse and download approved study materials.
    - **Senior (2nd–4th Year)**: Can upload notes and study resources.
    - **Admin**: Dedicated dashboard to moderate, review, and approve or reject submissions.
- **Single Page Application (SPA)**: Lightweight client-side hash router (`#home`, `#files`, `#upload`, `#admin`, `#about`, `#feedback`).
- **Resource Upload & Review Workflow**: Drag-and-drop file upload with preview before submission for admin moderation.
- **Client-Side Persistence**: Stores user sessions, file metadata, and pending moderation queues via browser `localStorage`.
- **Responsive & Modern Design**: Styled with custom CSS, CSS variables, Google Fonts (*Playfair Display* & *DM Sans*), and responsive layout.

---

## 📁 Project Structure

```text
scholars-space/
├── index.html        # Main entrypoint and SPA container
├── css/
│   └── style.css     # Design system, color tokens, and responsive styles
├── js/
│   ├── auth.js       # Authentication & automated role-detection logic
│   ├── files.js      # Resource metadata and admin approval queue
│   ├── team.js       # Team member data and credits
│   └── app.js        # Core SPA router, page renderers, and event handlers
├── .gitignore        # Git ignore rules for editor and system files
└── README.md         # Project documentation
```

---

## 🚀 Getting Started

### 1. Open in VS Code
You can open this project in Visual Studio Code:
```bash
code .
```

### 2. Run the Application
Because Scholar Space is built with pure web standards (HTML5, CSS3, JavaScript):
- **Option A (Live Server)**: Install the **Live Server** extension in VS Code, right-click `index.html` and select **"Open with Live Server"**.
- **Option B (Direct Browser)**: Double-click `index.html` to open it directly in any modern browser.

---

## 🔑 Demo Credentials

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | `sixty@mail` | `sixty` | Full moderation (Approve / Reject uploads) |
| **Senior** | Register with e.g. `alex.23bca@mail` | *(any 6+ chars)* | Upload resources for review |
| **Junior** | Register with e.g. `jordan.26bca@mail` | *(any 6+ chars)* | Browse & download resources |

---

## 👥 Meet the Team

- **Madhuree** — *Frontend Developer* (Landing page & hero experience)
- **Sandra** — *Database Engineer* (Data models & storage architecture)
- **Pallakshi** — *UI Designer* (Visual identity & design system)
- **Shreyash** — *QA & Tester* (Quality assurance & edge cases)
- **Sisira** — *Frontend Developer* (Auth, admin, and utility pages)
- **Chishti** — *Developer* (Application routing & module integration)
