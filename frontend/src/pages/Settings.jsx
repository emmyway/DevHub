import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Import the Navbar component
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Label } from '../components/ui/label';
import { AlertCircle, User, Upload as UploadIcon } from 'lucide-react'; // Import the Upload icon
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Skeleton } from '../components/ui/skeleton';

const API_URL = import.meta.env.VITE_API_URL;

export default function SettingsPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    bio: '',
  });
  const [profilePic, setProfilePic] = useState(null); // State for the uploaded image
  const [preview, setPreview] = useState(null); // State for the image preview
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/current_user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch user data');
      const userData = await response.json();
      setFormData(userData);
      // Update this line to construct the full URL for the profile picture
      const profilePicUrl = userData.profile_pic
        ? `${API_URL}/uploads/${userData.profile_pic}`
        : null;
      setPreview(profilePicUrl);
    } catch (err) {
      setError('Failed to load user data. Please try again.', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);

    // Generate a preview for the uploaded image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }
    if (profilePic) {
      formDataToSend.append('profile_pic', profilePic);
    }

    try {
      const response = await fetch(`${API_URL}/edit_profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const result = await response.json();
      setFormData(result.user);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-900 text-gray-100 pt-8 pb-16">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto bg-gray-800 border-gray-700">
              <CardHeader>
                <Skeleton className="h-8 w-1/2 bg-gray-700" />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-24 w-24 rounded-full bg-gray-700" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-1/2 mb-2 bg-gray-700" />
                      <Skeleton className="h-3 w-1/3 bg-gray-700" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Skeleton className="h-10 bg-gray-700" />
                    <Skeleton className="h-10 bg-gray-700" />
                  </div>
                  <Skeleton className="h-10 bg-gray-700" />
                  <Skeleton className="h-10 bg-gray-700" />
                  <Skeleton className="h-24 bg-gray-700" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-4">
                <Skeleton className="h-10 w-24 bg-gray-700" />
                <Skeleton className="h-10 w-32 bg-gray-700" />
              </CardFooter>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-gray-100 pt-8 pb-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-blue-400">
                Edit Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="space-y-6">
                  {/* Profile Picture Upload Section */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="w-24 h-24">
                        <AvatarImage
                          src={preview || '/placeholder.svg?height=80&width=80'}
                          alt="Profile picture"
                        />
                        <AvatarFallback>
                          <User className="w-12 h-12" />
                        </AvatarFallback>
                      </Avatar>
                      {/* Custom Upload Button */}
                      <label
                        htmlFor="profile_pic"
                        className="absolute bottom-0 right-0 p-2 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600 transition-colors duration-200"
                      >
                        <UploadIcon className="w-5 h-5 text-white" />
                        <input
                          id="profile_pic"
                          name="profile_pic"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="flex-1">
                      <Label
                        htmlFor="profile_pic"
                        className="text-sm font-medium text-gray-300"
                      >
                        Upload Profile Picture
                      </Label>
                      <p className="text-gray-500 text-sm">
                        Allowed formats: JPG, PNG
                      </p>
                    </div>
                  </div>

                  {/* Other Form Fields */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label
                        htmlFor="first-name"
                        className="text-sm font-medium text-gray-300"
                      >
                        First Name
                      </Label>
                      <Input
                        id="first-name"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="mt-1 bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="last-name"
                        className="text-sm font-medium text-gray-300"
                      >
                        Last Name
                      </Label>
                      <Input
                        id="last-name"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="mt-1 bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-300"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="username"
                      className="text-sm font-medium text-gray-300"
                    >
                      Username
                    </Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleInputChange}
                      className="mt-1 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="bio"
                      className="text-sm font-medium text-gray-300"
                    >
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="mt-1 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                {/* Error and Success Messages */}
                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mt-4 bg-green-700 border-green-600">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>
                      Your profile has been updated successfully.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Form Actions */}
                <CardFooter className="flex justify-end space-x-4 mt-6 px-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
