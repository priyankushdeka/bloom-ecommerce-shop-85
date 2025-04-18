
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Loader2, User } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { user, updateProfile, updatePassword, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: ""
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: ""
  });
  
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
  
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || ""
      });
    }
  }, [user]);
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsProfileUpdating(true);
      await updateProfile(profileData);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsProfileUpdating(false);
    }
  };
  
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.newPasswordConfirm) {
      return toast({
        title: "Passwords Don't Match",
        description: "New password and confirm password must match",
        variant: "destructive"
      });
    }
    
    try {
      setIsPasswordUpdating(true);
      await updatePassword(
        passwordData.currentPassword, 
        passwordData.newPassword, 
        passwordData.newPasswordConfirm
      );
      
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: ""
      });
      
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update password",
        variant: "destructive"
      });
    } finally {
      setIsPasswordUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <div className="flex items-center mb-8">
          <User className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold">My Profile</h1>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="password">Change Password</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal details here
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleProfileUpdate}>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      placeholder="Your email address"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      value={profileData.phone || ""}
                      onChange={handleProfileChange}
                      placeholder="Your phone number"
                    />
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button type="submit" disabled={isProfileUpdating}>
                    {isProfileUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Profile"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handlePasswordUpdate}>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="currentPassword" className="text-sm font-medium">
                      Current Password
                    </label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Your current password"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="newPassword" className="text-sm font-medium">
                      New Password
                    </label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Your new password"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="newPasswordConfirm" className="text-sm font-medium">
                      Confirm New Password
                    </label>
                    <Input
                      id="newPasswordConfirm"
                      name="newPasswordConfirm"
                      type="password"
                      value={passwordData.newPasswordConfirm}
                      onChange={handlePasswordChange}
                      placeholder="Confirm your new password"
                      required
                    />
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button type="submit" disabled={isPasswordUpdating}>
                    {isPasswordUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
