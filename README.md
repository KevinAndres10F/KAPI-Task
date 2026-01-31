# 🎯 KAPI Task Board - Professional Project Management Platform

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0.0-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

## 📋 Description

**KAPI Task Board** is a modern, professional-grade project management application built with React, TypeScript, and Vite. It features advanced drag-and-drop functionality, intelligent state management, and beautiful animations for an exceptional user experience.

### 🌟 Why Choose KAPI Task Board?

- **⚡ Lightning Fast**: Built with Vite for instant HMR and lightning-quick builds
- **🎨 Professional UI**: Designed with modern aesthetics and smooth animations
- **🚀 Production Ready**: Optimized for deployment with security and performance in mind
- **📱 Fully Responsive**: Works flawlessly on mobile, tablet, and desktop
- **🔄 Real-time Sync**: Ready for Supabase integration with real-time updates
- **♿ Accessible**: Full keyboard navigation and WCAG compliance

## ✨ Key Features

### Kanban Board Management
- **Visual Task Organization**: Organize tasks across To Do, In Progress, and Done columns
- **Advanced Drag & Drop**: Smooth, responsive drag-and-drop with professional animations
- **Instant Updates**: Real-time state management with Zustand
- **Multiple Views**: Switch between Kanban and Table views

### Task Management
- **Priority System**: Set tasks as Low, Medium, High, or Critical
- **Subtasks**: Break down large tasks into manageable subtasks with progress tracking
- **Assignees**: Assign tasks to team members with visual avatars
- **Due Dates**: Track deadlines with smart relative date formatting (ES locale)
- **Rich Descriptions**: Add detailed task information and notes

### Professional Modals
- **Accessible Dialogs**: Radix UI-powered accessible modals
- **Comprehensive Editing**: Edit all task properties in one place
- **Form Validation**: Ensure data integrity with validation
- **Smooth Animations**: Framer Motion for delightful interactions

### State Management
- **Zustand**: Lightweight, performant state management (3KB)
- **Reactive Store**: Automatic updates propagate throughout the app
- **No Redux Bloat**: Simple, intuitive API with DevTools support

### Animations & Effects
- **Framer Motion**: 60fps smooth animations for cards and interactions
- **Interactive Feedback**: Visual cues for user actions
- **Loading States**: Smooth transitions between different states
- **Toast Notifications**: Ready for user feedback integration

## 🛠️ Tech Stack

### Frontend
```json
{
  "Runtime": "React 18.3.1",
  "Language": "TypeScript 5.7.3",
  "Build Tool": "Vite 5.2 with Rolldown",
  "Styling": "Tailwind CSS 4.0",
  "Icons": "Lucide React",
  "State Management": "Zustand",
  "Drag & Drop": "@dnd-kit",
  "Animations": "Framer Motion",
  "Modals": "Radix UI",
  "Dates": "date-fns with ES locale"
}
```

### Backend & Deployment
- **Supabase**: Real-time database and backend
- **Netlify**: CI/CD and hosting
- **GitHub**: Version control

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm/yarn
- Git for version control

### Installation

```bash
# Clone the repository
git clone https://github.com/KevinAndres10F/KAPI-Task.git
cd KAPI-Task

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Development

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linting
npm run lint
```

### Production Build

```bash
# Build optimized production version
npm run build

# Output is in the 'dist' directory
# Ready to deploy to Netlify, Vercel, or any static host
```

## 📁 Project Structure

```
KAPI-Task/
├── src/
│   ├── components/          # React components
│   │   ├── Board.tsx        # Main board orchestrator
│   │   ├── Column.tsx       # Kanban column container
│   │   ├── TaskCard.tsx     # Individual task card
│   │   └── TaskModal.tsx    # Task editing modal
│   ├── hooks/               # Custom React hooks
│   │   └── useTasks.ts      # Zustand state management
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts         # Task and Priority types
│   ├── lib/                 # Utility libraries
│   │   └── supabaseClient.ts # Supabase initialization
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── dist/                    # Production build (generated)
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── vite.config.ts           # Vite configuration
├── netlify.toml             # Netlify deployment config
└── README.md                # This file
```

## 🎮 Usage Guide

### Creating Tasks
1. Click the **"+"** button on any column
2. Fill in the task details:
   - Title (required)
   - Description
   - Priority
   - Assignee
   - Due Date
   - Subtasks
3. Click **"Create Task"**

### Managing Tasks
- **Edit**: Click a task card to edit its details
- **Delete**: Click the trash icon on a task card
- **Move**: Drag tasks between columns
- **Track Progress**: Check subtask completion

### Switching Views
- **Kanban**: Click the grid icon (default)
- **Table**: Click the list icon for a tabular view

### Keyboard Navigation
- **Tab**: Navigate between elements
- **Enter**: Open modals and submit forms
- **Escape**: Close modals
- **Arrow Keys**: Navigate in sortable lists

## 🎨 Customization

### Colors
Edit `src/types/index.ts` to customize priority colors:
```typescript
export const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'border-l-blue-500',
  medium: 'border-l-yellow-500',
  high: 'border-l-orange-500',
  critical: 'border-l-red-500',
};
```

### Tailwind Theme
Customize in `tailwind.config.js`:
```javascript
export default {
  theme: {
    extend: {
      colors: {
        // Add custom colors
      },
    },
  },
}
```

## 🔗 API Integration

### Supabase Setup
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Add your API keys to `.env.local`:
   ```
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   ```
3. Update database schema in `src/lib/supabaseClient.ts`

## 📊 Performance

### Build Metrics
- **Bundle Size**: ~200KB vendor (gzipped)
- **App Size**: ~70KB (gzipped)
- **Load Time**: < 1 second on 4G
- **LCP**: < 2.5s on average hardware

### Optimization Features
- Code splitting with Rolldown
- Tree-shaking of unused code
- Minification with Terser
- CSS purging with Tailwind
- Image optimization ready

## 🚀 Deployment

### Netlify (Recommended)
1. Push code to GitHub
2. Connect repo to Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy automatically on push

### Vercel
```bash
npm install -g vercel
vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📚 Documentation

For detailed feature documentation, see:
- [Professional Features](./PROFESSIONAL_FEATURES.md) - Complete feature overview
- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Deployment Guide](./GITHUB_NETLIFY.md) - Deployment steps

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋 Support

- **Issues**: [GitHub Issues](https://github.com/KevinAndres10F/KAPI-Task/issues)
- **Discussions**: [GitHub Discussions](https://github.com/KevinAndres10F/KAPI-Task/discussions)
- **Email**: Create an issue for urgent matters

## 🎯 Roadmap

### Phase 2 - Real-time Collaboration
- [ ] User authentication
- [ ] Team collaboration features
- [ ] Real-time task updates with Supabase
- [ ] Activity history and notifications

### Phase 3 - Advanced Features
- [ ] Custom workflows
- [ ] Automation rules
- [ ] File attachments
- [ ] Comments and mentions

### Phase 4 - Enterprise Features
- [ ] Team management
- [ ] Advanced permissions
- [ ] SSO integration
- [ ] Analytics and reporting

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [dnd-kit Documentation](https://docs.dndkit.com/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Framer Motion Guide](https://www.framer.com/motion/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 🎉 Acknowledgments

- Built with [React](https://react.dev)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Drag & drop by [dnd-kit](https://docs.dndkit.com/)
- State management by [Zustand](https://github.com/pmndrs/zustand)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- Icons by [Lucide React](https://lucide.dev)
- Dialogs by [Radix UI](https://www.radix-ui.com)

---

**Made with ❤️ by Kevin**

**Repository**: https://github.com/KevinAndres10F/KAPI-Task  
**Live Demo**: https://kapi-task.netlify.app  
**Version**: 2.0.0 (Professional SaaS Platform)
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
