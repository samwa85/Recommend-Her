# Recommend Her

A modern web application connecting talented women with sponsors who actively recommend and support them in their career journeys. Built with React, TypeScript, and Vite.

## 🌟 About

Recommend Her is a movement dedicated to building a more equitable future by empowering women through sponsorship. The platform connects talented women with leaders who actively recommend and sponsor them into leadership positions.

## ✨ Features

- **Hero Section**: Engaging landing with smooth GSAP animations
- **Talent Pool**: Browse and discover talented professionals
- **For Talent**: Submit your CV and get discovered by sponsors
- **For Sponsors**: Find and recommend talented women
- **Resources**: Educational content and career guidance
- **Mission**: Learn about our vision and goals
- **Contact**: Get in touch with the team
- **Responsive Design**: Fully responsive across all devices
- **Smooth Animations**: Powered by GSAP and ScrollTrigger
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd "Recommend Her"
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

## 📦 Available Scripts

- `npm run dev` - Start development server with hot module replacement
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## 🛠️ Tech Stack

### Core
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **GSAP** - Professional-grade animation library

### Routing
- **React Router DOM** - Client-side routing

### Forms & Validation
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **@hookform/resolvers** - Form validation integration

### UI Components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **Recharts** - Data visualization

### Development Tools
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript linting rules
- **PostCSS** - CSS transformations
- **Autoprefixer** - CSS vendor prefixing

## 📁 Project Structure

```
Recommend Her/
├── public/                 # Static assets
│   └── images/            # Image files
├── src/
│   ├── components/        # Reusable UI components
│   │   └── ui/           # shadcn/ui components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── pages/            # Page components
│   └── sections/         # Section components
├── index.html            # HTML entry point
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── tailwind.config.js    # Tailwind CSS configuration
```

## 🎨 Key Components

### Pages
- [`HomePage`](src/pages/HomePage.tsx:1) - Main landing page
- [`Mission`](src/pages/Mission.tsx:1) - About the mission
- [`ForTalent`](src/pages/ForTalent.tsx:1) - Information for talent
- [`ForSponsors`](src/pages/ForSponsors.tsx:1) - Information for sponsors
- [`TalentPool`](src/pages/TalentPool.tsx:1) - Browse talent
- [`Resources`](src/pages/Resources.tsx:1) - Educational resources
- [`Contact`](src/pages/Contact.tsx:1) - Contact form

### Sections
- [`Hero`](src/sections/Hero.tsx:1) - Landing hero with animations
- [`Navigation`](src/sections/Navigation.tsx:1) - Main navigation bar
- [`Footer`](src/sections/Footer.tsx:1) - Site footer
- [`ValueProposition`](src/sections/ValueProposition.tsx:1) - Value propositions
- [`HowItWorks`](src/sections/HowItWorks.tsx:1) - Process explanation
- [`Testimonials`](src/sections/Testimonials.tsx:1) - User testimonials
- [`CTASection`](src/sections/CTASection.tsx:1) - Call to action

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Add your environment variables here
VITE_API_URL=https://api.example.com
VITE_ANALYTICS_ID=your-analytics-id
```

See `.env.example` for all available variables.

## 🧪 Testing

The project is set up for testing. Run tests with:

```bash
npm test
```

## 📝 Code Quality

### Linting

Run ESLint to check code quality:

```bash
npm run lint
```

### TypeScript

TypeScript is configured with strict mode for type safety. The build process includes type checking.

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

The optimized files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

### Deployment Platforms

This project can be deployed to:
- **Vercel** - Recommended for React applications
- **Netlify** - Easy deployment with continuous integration
- **GitHub Pages** - Free hosting for static sites
- Any static hosting service

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/) components
- Icons by [Lucide](https://lucide.dev/)
- Animations powered by [GSAP](https://gsap.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

For questions or support, please contact us through the [Contact page](/contact) or open an issue in the repository.

---

**Recommend Her** - When women recommend women, incredible things happen.
