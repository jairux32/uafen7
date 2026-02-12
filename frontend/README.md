# VSinnfo Frontend - React Implementation

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 10+

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm run dev
```
Server will start at http://localhost:5173

### Build
```bash
npm run build
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable components (badges, buttons)
│   │   ├── layout/          # Layout components (Sidebar, Header)
│   │   └── forms/           # Form components
│   ├── pages/
│   │   ├── auth/            # Login, Register
│   │   ├── dashboard/       # Dashboard
│   │   ├── operaciones/     # Operations management
│   │   ├── alertas/         # Alerts management
│   │   ├── reportes/        # UAFE reports
│   │   └── configuracion/   # Settings
│   ├── services/            # API services
│   ├── store/               # Zustand stores
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── .env                     # Environment variables
├── tailwind.config.js       # Tailwind configuration
├── vite.config.ts           # Vite configuration
└── package.json
```

## ✅ Implemented Components

### Core
- ✅ TypeScript types (matching backend API)
- ✅ Axios API client with interceptors
- ✅ Authentication service
- ✅ Operations service
- ✅ Zustand auth store

### Layout
- ✅ MainLayout (Sidebar + Header)
- ✅ Sidebar with navigation
- ✅ Header with user info and logout

### Pages
- ✅ LoginPage (fully functional)
- ✅ DashboardPage (with stats cards and tables)

### Components
- ✅ RiesgoBadge (color-coded risk levels)
- ✅ PrivateRoute (authentication guard)

## 🎨 Styling

Using Tailwind CSS with custom configuration:
- Primary color: #2563eb (blue)
- Risk levels: green, yellow, orange, red
- Alert severity: color-coded badges
- Responsive design

## 🔐 Authentication

- JWT-based authentication
- Token stored in localStorage
- Auto-redirect on token expiration
- Protected routes with PrivateRoute

## 🌐 API Integration

Backend API: http://localhost:3000/api

Configured in `.env`:
```
VITE_API_URL=http://localhost:3000/api
```

## 📊 State Management

- **Zustand**: Client state (auth)
- **React Query**: Server state (operations, alerts, reports)

## 🚧 TODO

### High Priority
- [ ] Operations list page
- [ ] Nueva Operación wizard (3 steps)
- [ ] Alerts management page
- [ ] UAFE reports page

### Medium Priority
- [ ] Operation detail page
- [ ] ROS generation form
- [ ] Configuration pages
- [ ] User management

### Low Priority
- [ ] Charts integration (Recharts)
- [ ] File upload components
- [ ] Advanced filters
- [ ] Export functionality

## 🧪 Testing

```bash
npm run test
```

## 📦 Dependencies

### Core
- react: ^18.3.1
- react-dom: ^18.3.1
- react-router-dom: ^7.1.3
- typescript: ^5.7.2

### State & Data
- zustand: ^5.0.3
- @tanstack/react-query: ^5.64.2
- axios: ^1.7.9

### UI
- tailwindcss: ^3.4.17
- @headlessui/react: ^2.2.0
- @heroicons/react: ^2.2.0
- react-hot-toast: ^2.4.1

### Forms
- react-hook-form: ^7.54.2
- zod: ^3.24.1

## 🎯 Next Steps

1. Complete operations management pages
2. Implement alerts workflow
3. Add UAFE reporting functionality
4. Integrate charts (Recharts)
5. Add E2E tests
6. Deploy to production

## 📝 Notes

- Backend must be running on port 3000
- Database must be configured
- See backend README for setup instructions
