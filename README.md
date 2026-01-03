# Frontend - BD Healthcare

Welcome to the frontend of **BD Healthcare**. This is a sleek, modern, and high-performance Angular application designed to provide a premium user experience for patients and doctors alike.

---

## ✨ Design Aesthetic
- **Glossy UI:** Glassmorphism effects with soft gradients and smooth transitions.
- **Responsive:** Optimized for everything from mobile phones to high-res desktops.
- **Humanized:** Friendly, empathetic language throughout the interface.

---

## 🛠️ Technical Specifications

- **Framework:** [Angular 17+](https://angular.io/)
- **Styling:** Vanilla CSS & SCSS (Custom Glossy Design System).
- **Typography:** Inter & Outfit (Modern Sans-Serif).
- **State Management:** Reactive programming with RxJS.
- **Icons:** FontAwesome & Bootstrap Icons.
- **Charts:** Chart.js for data visualization.

---

## 🚀 Key Features

### 🏥 Patient Experience
- **Smart Search:** Find doctors by location and specialty with a beautiful interactive UI.
- **Health Journey:** Dashboard to track all upcoming and past appointments.
- **Seamless Booking:** Interactive scheduling with real-time feedback.

### 👨‍⚕️ Doctor Dashboard
- **Schedule Control:** Effortless management of time slots.
- **Patient Management:** View patient history and appointment notes.
- **Analytics:** Visual insights into patient volume and feedback.

### 🛡️ Admin Suite
- **Control Center:** Manage hospitals, doctors, and system-wide settings.
- **System KPIs:** Real-time analytics on growth and performance.

---

## 📂 Component Structure

```text
src/app/
├── components/     # Feature-based components (Login, Register, Dashboard)
├── services/       # API Integration & Authentication logic
├── guard/          # Route protection guards
├── model/          # TypeScript interfaces/classes
└── auth/           # OTP & Password Recovery modules
```

---

## 📥 Getting Started (Local Setup)

### Prerequisites
- **Node.js** (v18+) and **npm**.
- **Angular CLI** (`npm install -g @angular/cli`).

### Installation
1.  **Clone the Repo:**
    ```bash
    git clone [frontend-repo-url]
    cd Frontend-Doctor-Appointment-System
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Run Development Server:**
    ```bash
    ng serve
    ```
    *Access the app at `http://localhost:4200`.*

---

## 🔐 Demo Credentials

Use these accounts to explore the portals:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `sadmin@gmail.com` | `123456` |
| **Admin** | `admin@gmail.com` | `123456` |
| **Doctor** | `doctor@gmail.com` | `123456` |
| **Patient** | `patient@gmail.com` | `123456` |

---

## 🔧 Environment Configuration
Update your backend API URL in `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  api_url: 'http://localhost:5000/api'
};
```

---

## 🎨 Design Philosophy
**The design** focuses on **empowering users**. Every button, transition, and code choice is designed to make healthcare management feel simple, fast, and stress-free.

---
