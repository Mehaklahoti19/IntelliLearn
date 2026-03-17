import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Download, ArrowLeft, GraduationCap } from 'lucide-react';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';

const CertificatePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const certRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    loadCertificate();
  }, [courseId]);

  const loadCertificate = async () => {
    try {
      const data = await userService.getCertificate(courseId);
      setCert(data.certificate);
    } catch (err) {
      setError(err.message || 'Could not load certificate. Complete the course first.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  if (loading) return <Loading fullScreen />;

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <Award className="h-16 w-16 text-gray-300" />
      <p className="text-xl text-gray-600 dark:text-gray-400 text-center">{error}</p>
      <Button onClick={() => navigate(-1)} variant="outline">
        <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">
            <ArrowLeft className="h-5 w-5" /> Back
          </button>
          <Button onClick={handlePrint} className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Download Certificate
          </Button>
        </div>

        {/* Certificate */}
        <motion.div ref={certRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none">
          {/* Top border */}
          <div className="h-3 bg-gradient-to-r from-primary-500 via-accent-500 to-secondary-500" />

          <div className="p-12 text-center">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <GraduationCap className="h-12 w-12 text-primary-500" />
              <span className="text-3xl font-bold gradient-text">IntelliLearn</span>
            </div>

            <Award className="h-20 w-20 text-yellow-500 mx-auto mb-6" />

            <p className="text-gray-500 text-lg mb-2 uppercase tracking-widest text-sm">Certificate of Completion</p>
            <p className="text-gray-600 mb-6">This is to certify that</p>

            <h1 className="text-5xl font-bold gradient-text mb-6">{cert.studentName}</h1>

            <p className="text-gray-600 mb-3">has successfully completed the course</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{cert.courseName}</h2>
            <p className="text-gray-500 mb-8">Instructed by {cert.instructor}</p>

            <div className="flex items-center justify-center gap-12 mb-10">
              <div className="text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Date Completed</p>
                <p className="font-semibold">{new Date(cert.completedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Certificate ID</p>
                <p className="font-mono text-sm font-semibold text-primary-600">{cert.certificateId}</p>
              </div>
            </div>

            {/* Signature line */}
            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-400">IntelliLearn — AI-Powered Learning Platform</p>
            </div>
          </div>

          {/* Bottom border */}
          <div className="h-3 bg-gradient-to-r from-secondary-500 via-accent-500 to-primary-500" />
        </motion.div>
      </div>
    </div>
  );
};

export default CertificatePage;
