import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';

interface LocationState {
  type: 'login' | 'signup';
  user?: {
    username: string;
    fullName: string;
    email: string;
  };
}

const SuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(5);

  const state = location.state as LocationState;
  const isLogin = state?.type === 'login';
  const isSignup = state?.type === 'signup';

  useEffect(() => {
    if (!isLogin && !isSignup) {
      navigate('/');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/home');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLogin, isSignup, navigate]);

  const handleGoHome = () => {
    navigate('/home');
  };

  const handleGoProfile = () => {
    navigate('/profile');
  };

  if (!isLogin && !isSignup) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {isSignup ? 'Welcome to Mesh!' : 'Welcome Back!'}
        </h1>
        
        <p className="text-lg text-gray-600 mb-2">
          {isSignup 
            ? 'Your account has been created successfully!' 
            : 'You have been logged in successfully!'
          }
        </p>

        {user && (
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <img 
                src={user.avatar} 
                alt={user.fullName}
                className="w-12 h-12 rounded-full"
              />
              <div className="text-left">
                <p className="font-medium text-gray-900">{user.fullName}</p>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleGoHome}
            className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Home
          </Button>

          <Button 
            onClick={handleGoProfile}
            variant="outline"
            className="w-full h-12"
          >
            <User className="w-4 h-4 mr-2" />
            View Profile
          </Button>
        </div>

        {/* Auto Redirect */}
        <p className="text-sm text-gray-500 mt-6">
          Redirecting to home in {countdown} seconds...
        </p>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">
            {isSignup ? 'What\'s Next?' : 'Ready to Connect?'}
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            {isSignup ? (
              <>
                <li>• Complete your profile</li>
                <li>• Start sharing your first post</li>
                <li>• Connect with other users</li>
              </>
            ) : (
              <>
                <li>• Check your latest notifications</li>
                <li>• Explore trending content</li>
                <li>• Connect with friends</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage; 