<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Primary Meta Tags -->
    <title>@yield('title', 'Recommend Her Initiative - Elevating Women into Leadership')</title>
    <meta name="title" content="@yield('meta_title', 'Recommend Her Initiative - Elevating Women into Leadership')" />
    <meta name="description" content="@yield('meta_description', 'Join a community dedicated to elevating women into leadership. Talent profiles, sponsorship opportunities, and career resources for women leaders.')" />
    <meta name="keywords" content="women leadership, career advancement, mentorship, diversity inclusion, women executives, talent pool, leadership opportunities" />
    <meta name="author" content="Recommend Her Initiative" />
    <meta name="robots" content="index, follow" />
    <meta name="language" content="English" />
    <meta name="revisit-after" content="7 days" />
    
    <!-- Canonical URL -->
    <link rel="canonical" href="{{ url()->current() }}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="{{ url()->current() }}" />
    <meta property="og:title" content="@yield('og_title', 'Recommend Her Initiative - Elevating Women into Leadership')" />
    <meta property="og:description" content="@yield('og_description', 'Join a community dedicated to elevating women into leadership. Talent profiles, sponsorship opportunities, and career resources.')" />
    <meta property="og:image" content="{{ asset('images/og-image.jpg') }}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Recommend Her Initiative" />
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="{{ url()->current() }}" />
    <meta property="twitter:title" content="@yield('twitter_title', 'Recommend Her Initiative - Elevating Women into Leadership')" />
    <meta property="twitter:description" content="@yield('twitter_description', 'Join a community dedicated to elevating women into leadership. Talent profiles, sponsorship opportunities, and career resources.')" />
    <meta property="twitter:image" content="{{ asset('images/og-image.jpg') }}" />
    
    <!-- Favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('images/apple-touch-icon.png') }}" />
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('images/favicon-32x32.png') }}" />
    <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('images/favicon-16x16.png') }}" />
    <link rel="manifest" href="{{ asset('site.webmanifest') }}" />
    <meta name="theme-color" content="#1a1a2e" />
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Playfair+Display:wght@500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS -->
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    
    <!-- Custom Styles -->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Playfair+Display:wght@500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

        :root {
            /* HSL Color System - Light Mode */
            --background: 340 20% 98%;
            --foreground: 340 25% 15%;
            --card: 0 0% 100%;
            --card-foreground: 340 25% 15%;
            --popover: 0 0% 100%;
            --popover-foreground: 340 25% 15%;
            --primary: 20 70% 45%;
            --primary-foreground: 0 0% 100%;
            --secondary: 340 15% 95%;
            --secondary-foreground: 340 25% 15%;
            --muted: 340 10% 92%;
            --muted-foreground: 340 10% 40%;
            --accent: 30 80% 55%;
            --accent-foreground: 340 25% 15%;
            --destructive: 0 70% 45%;
            --destructive-foreground: 0 0% 100%;
            --border: 340 10% 88%;
            --input: 340 10% 88%;
            --ring: 20 70% 45%;
            --radius: 0.625rem;
            
            /* Typography */
            --font-sans: 'Poppins', system-ui, sans-serif;
            --font-serif: 'Playfair Display', Georgia, serif;
            --font-mono: 'Space Mono', monospace;
            
            /* Shadows */
            --shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
            --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
            --shadow-md: 0 6px 20px rgba(0, 0, 0, 0.12);
            --shadow-lg: 0 12px 24px rgba(0, 0, 0, 0.15);
            --shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.2);
            --shadow-2xs: 0 1px 2px rgba(0, 0, 0, 0.05);
            --shadow-xs: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        * {
            border-color: hsl(var(--border));
        }
        
        html {
            scroll-behavior: smooth;
            font-size: 16px;
        }
        
        body {
            background-color: hsl(var(--background));
            color: hsl(var(--foreground));
            font-family: var(--font-sans);
            font-weight: 400;
            line-height: 1.7;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        h1, h2, h3, h4, h5, h6 {
            font-family: var(--font-serif);
            font-weight: 700;
            line-height: 1.2;
            color: hsl(var(--foreground));
            letter-spacing: -0.01em;
        }

        h1 {
            font-size: 3rem;
            line-height: 1.1;
        }

        h2 {
            font-size: 2.25rem;
        }

        h3 {
            font-size: 1.75rem;
        }

        p {
            font-size: 1.0625rem;
            line-height: 1.8;
        }

        .font-heading {
            font-family: var(--font-serif);
        }
        
        .font-body {
            font-family: var(--font-sans);
        }
        
        .font-mono {
            font-family: var(--font-mono);
        }
        
        .btn-primary {
            padding: 1rem 2rem;
            border-radius: 0.75rem;
            font-family: var(--font-sans);
            font-weight: 600;
            transition: all 0.3s;
            background-color: hsl(var(--primary));
            color: hsl(var(--primary-foreground));
            box-shadow: 0 4px 14px hsl(var(--primary) / 0.25);
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px hsl(var(--primary) / 0.35);
        }
        
        .btn-secondary {
            padding: 1rem 2rem;
            border-radius: 0.75rem;
            font-family: var(--font-sans);
            font-weight: 600;
            transition: all 0.3s;
            background-color: hsl(var(--secondary));
            color: hsl(var(--secondary-foreground));
            border: 2px solid hsl(var(--border));
        }
        
        .btn-secondary:hover {
            background-color: hsl(var(--muted));
            transform: translateY(-2px);
        }
        
        .btn-outline {
            padding: 1rem 2rem;
            border-radius: 0.75rem;
            font-family: var(--font-sans);
            font-weight: 600;
            transition: all 0.3s;
            border: 2px solid hsl(var(--primary));
            color: hsl(var(--primary));
            background: transparent;
        }
        
        .btn-outline:hover {
            background-color: hsl(var(--primary));
            color: hsl(var(--primary-foreground));
            transform: translateY(-2px);
        }
        
        .card-hover {
            transition: all 0.3s;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }
        
        .card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }
        
        .section-padding {
            padding-left: 1rem;
            padding-right: 1rem;
        }
        
        @media (min-width: 640px) {
            .section-padding {
                padding-left: 1.5rem;
                padding-right: 1.5rem;
            }
        }
        
        @media (min-width: 1024px) {
            .section-padding {
                padding-left: 2rem;
                padding-right: 2rem;
            }
        }
        
        @media (min-width: 1280px) {
            .section-padding {
                padding-left: 3rem;
                padding-right: 3rem;
            }
        }
        
        @media (min-width: 1536px) {
            .section-padding {
                padding-left: 6rem;
                padding-right: 6rem;
            }
        }
        
        .text-gradient {
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
            background-image: linear-gradient(135deg, hsl(var(--primary)), hsl(20 65% 50%));
        }

        .animate-float {
            animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-slow {
            animation: float 8s ease-in-out infinite;
            animation-delay: -2s;
        }
        
        .animate-pulse-glow {
            animation: pulseGlow 3s ease-in-out infinite;
        }
        
        .glassmorphism {
            backdrop-filter: blur(12px);
            background-color: rgba(255, 255, 255, 0.9);
        }

        @keyframes float {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-10px);
            }
        }

        @keyframes pulseGlow {
            0%, 100% {
                box-shadow: 0 0 20px hsl(var(--primary) / 0.3);
            }
            50% {
                box-shadow: 0 0 30px hsl(var(--primary) / 0.5);
            }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 10px;
        }

        ::-webkit-scrollbar-track {
            background: hsl(var(--background));
        }

        ::-webkit-scrollbar-thumb {
            background: hsl(var(--primary));
            border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: hsl(20 75% 40%);
        }

        /* Animation utilities */
        .reveal {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        
        .reveal.active {
            opacity: 1;
            transform: translateY(0);
        }

        /* Admin layout specific styles */
        .admin-sidebar {
            background: linear-gradient(180deg, oklch(0.25 0.08 340) 0%, oklch(0.20 0.06 340) 100%);
        }
    </style>
    
    @stack('styles')
</head>
<body class="min-h-screen" style="background-color: hsl(var(--background));">
    @if(!isset($hideNavigation) || !$hideNavigation)
        @include('sections.navigation')
    @endif

    <main>
        @yield('content')
    </main>

    @if(!isset($hideFooter) || !$hideFooter)
        @include('sections.footer')
    @endif

    <!-- Toast notifications container -->
    <div id="toast-container" class="fixed top-4 right-4 z-50"></div>
    
    <!-- Scripts -->
    <script>
        // Scroll reveal animation
        document.addEventListener('DOMContentLoaded', function() {
            const revealElements = document.querySelectorAll('.reveal');
            
            const revealOnScroll = () => {
                revealElements.forEach(element => {
                    const elementTop = element.getBoundingClientRect().top;
                    const windowHeight = window.innerHeight;
                    
                    if (elementTop < windowHeight - 100) {
                        element.classList.add('active');
                    }
                });
            };
            
            revealOnScroll();
            window.addEventListener('scroll', revealOnScroll);
        });
        
        // Mobile menu toggle
        function toggleMobileMenu() {
            const menu = document.getElementById('mobile-menu');
            menu.classList.toggle('max-h-0');
            menu.classList.toggle('max-h-[500px]');
            menu.classList.toggle('mt-4');
        }
    </script>
    
    @stack('scripts')
</body>
</html>
