import { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ErrorBoundary } from './components/ErrorBoundary';
import Navigation from './sections/Navigation';
import Footer from './sections/Footer';
import { routes } from './routes';
import { PageLoader } from './components/PageLoader';

gsap.registerPlugin(ScrollTrigger);

// Wrapper to conditionally show Navigation and Footer
// Admin routes have their own layout
function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

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
                    <Route key={route.path} path={route.path} element={route.element} />
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
