import { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ErrorBoundary } from './components/ErrorBoundary';
import Navigation from './sections/Navigation';
import Footer from './sections/Footer';
import { routes } from './routes';
import { PageLoader } from './components/PageLoader';
import { Toaster } from './components/ui/sonner';

// Register GSAP plugins
try {
  gsap.registerPlugin(ScrollTrigger);
  console.log('[App] GSAP ScrollTrigger registered');
} catch (e) {
  console.error('[App] Failed to register GSAP ScrollTrigger:', e);
}

// Wrapper to conditionally show Navigation and Footer
// Admin routes have their own layout
function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  console.log('[Layout] Current path:', location.pathname, 'isAdmin:', isAdminRoute);

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navigation />
      {children}
      <Footer />
    </>
  );
}

function App() {
  useEffect(() => {
    console.log('[App] Component mounted');
    ScrollTrigger.refresh();
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen" style={{ backgroundColor: 'hsl(var(--background))' }}>
          <Layout>
            <main>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {routes.map((route) => (
                    <Route 
                      key={route.path} 
                      path={route.path} 
                      element={
                        <ErrorBoundary>
                          {route.element}
                        </ErrorBoundary>
                      } 
                    />
                  ))}
                </Routes>
              </Suspense>
            </main>
          </Layout>
          <Toaster position="top-right" richColors closeButton />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
