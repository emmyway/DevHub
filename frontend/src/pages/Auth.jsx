import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import BackgroundBubbles from '../components/BackgroundBubbles';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { FaGoogle } from 'react-icons/fa';
import {
  AlertCircle,
  User,
  Mail,
  Lock,
  UserPlus,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';

const API_URL = import.meta.env.VITE_API_URL;

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const endpoint =
        activeTab === 'login'
          ? `${API_URL}/login`
          : `${API_URL}/register`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `${activeTab === 'login' ? 'Login' : 'Registration'} failed`
        );
      }

      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        navigate('/');
      } else {
        throw new Error('No access token received');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    console.log('Google authentication clicked');
  };

  const handleGuestAccess = () => {
    navigate('/');
  };

  const renderInput = (
    name,
    label,
    IconComponent,
    type = 'text',
    required = true
  ) => {
    const isPassword = name === 'password';
    return (
      <div>
        <Label
          htmlFor={name}
          className="text-sm font-medium text-gray-200 flex items-center"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <div className="mt-1 relative">
          <Input
            id={name}
            name={name}
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            required={required}
            className="w-full pl-8 pr-10 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Enter your ${label.toLowerCase()}`}
            value={formData[name]}
            onChange={handleChange}
          />
          <IconComponent className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
          {isPassword && (
            <Button
              type="button"
              variant="ghost"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white focus:outline-none bg-transparent hover:bg-transparent focus:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    );
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  const renderForm = (tabValue) => (
    <motion.div
      key={tabValue}
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        {tabValue === 'register' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>{renderInput('firstName', 'First Name', User)}</div>
              <div>
                {renderInput('lastName', 'Last Name', User, 'text', false)}
              </div>
            </div>
            {renderInput('email', 'Email address', Mail, 'email', true)}
          </>
        )}
        {renderInput(
          'username',
          'Username',
          tabValue === 'register' ? UserPlus : User
        )}
        {renderInput('password', 'Password', Lock)}
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300"
          disabled={isLoading}
        >
          {isLoading
            ? `${tabValue === 'login' ? 'Logging in' : 'Creating account'}...`
            : tabValue === 'login'
            ? 'Log in'
            : 'Create account'}
        </Button>
      </form>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
      <BackgroundBubbles />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-white space-y-6 lg:text-left hidden lg:block"
        >
          <h2 className="text-5xl font-bold">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600">
              Join DevHub
            </span>
            <span className="block text-white mt-2">Today</span>
          </h2>
          <p className="text-xl font-semibold text-gray-300">
            Elevate Your Coding Journey
          </p>
          <ul className="space-y-3">
            <li className="flex items-center">
              <AlertCircle className="h-5 w-5 text-green-500 mr-2" />
              <span>Connect with 10,000+ developers worldwide</span>
            </li>
            <li className="flex items-center">
              <AlertCircle className="h-5 w-5 text-green-500 mr-2" />
              <span>Access exclusive coding resources and tutorials</span>
            </li>
            <li className="flex items-center">
              <AlertCircle className="h-5 w-5 text-green-500 mr-2" />
              <span>Collaborate on cutting-edge projects</span>
            </li>
          </ul>
          <p className="text-2xl font-handwriting transform rotate-1 opacity-90 mt-4">
            Share. Learn. Collaborate.
          </p>
          <p className="text-3xl font-handwriting transform -rotate-1 opacity-80">
            Connect with Developers!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto rounded-xl shadow-2xl overflow-hidden lg:col-span-2"
        >
          <Card className="bg-gray-800/70 backdrop-blur-md border-gray-700/50">
            <CardContent className="text-gray-100">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 bg-gray-700/50 rounded-lg p-1 mt-4 mb-6">
                  <TabsTrigger
                    value="login"
                    className="rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-200"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-200"
                  >
                    Register
                  </TabsTrigger>
                </TabsList>
                <div className="block lg:hidden text-center mb-6">
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600">
                    Welcome to DevHub
                  </h2>
                </div>
                <AnimatePresence mode="wait">
                  {activeTab === 'login' && renderForm('login')}
                  {activeTab === 'register' && renderForm('register')}
                </AnimatePresence>
              </Tabs>
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full border-t border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-800 text-gray-400">
                      Or continue with
                    </span>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200 transition-colors duration-300"
                    onClick={handleGoogleAuth}
                  >
                    <FaGoogle className="w-5 h-5 mr-2 text-gray-600" />
                    Sign up with Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 transition-colors duration-300"
                    onClick={handleGuestAccess}
                  >
                    <User className="w-5 h-5 mr-2" />
                    Continue as Guest
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-gray-300">
                {activeTab === 'login' ? (
                  <>
                    Don&#39;t have an account?{' '}
                    <Button
                      variant="link"
                      className="p-0 text-blue-400 hover:text-blue-300 transition-colors duration-300"
                      onClick={() => setActiveTab('register')}
                    >
                      Sign up
                    </Button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <Button
                      variant="link"
                      className="p-0 text-blue-400 hover:text-blue-300 transition-colors duration-300"
                      onClick={() => setActiveTab('login')}
                    >
                      Sign in
                    </Button>
                  </>
                )}
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
