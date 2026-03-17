import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Loading from './components/common/Loading';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const CourseDetailsPage = lazy(() => import('./pages/CourseDetailsPage'));
const AIAssistantPage = lazy(() => import('./pages/AIAssistantPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const CertificatePage = lazy(() => import('./pages/CertificatePage'));
const ResumeAnalyzerPage = lazy(() => import('./pages/ResumeAnalyzerPage'));
const ProjectGeneratorPage = lazy(() => import('./pages/ProjectGeneratorPage'));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Navbar />
            <main className="pt-16">
              <Suspense fallback={<Loading fullScreen />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/courses" element={<CoursesPage />} />
                  <Route path="/courses/:id" element={<CourseDetailsPage />} />
                  <Route path="/ai-assistant" element={<AIAssistantPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/certificate/:courseId" element={<CertificatePage />} />
                  <Route path="/resume-analyzer" element={<ResumeAnalyzerPage />} />
                  <Route path="/projects" element={<ProjectGeneratorPage />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
