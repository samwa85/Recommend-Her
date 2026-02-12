import { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ErrorBoundary } from './components/ErrorBoundary';
import Navigation from './sections/Navigation';
import Footer from './sections/Footer';
import { routes } from './routes';
import { PageLoader } from './components/PageLoader';

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

// Error handler for lazy loading failures
function LazyErrorFallback({ error }: { error: Error }) {
  console.error('[App] Lazy loading error:', error);
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--destructive)' }}>Failed to load page</h1>
        <p className="mb-4" style={{ color: 'var(--muted-foreground)' }}>{error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          Reload Page
        </button>
      </div>
    </div>
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
        <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
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
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
