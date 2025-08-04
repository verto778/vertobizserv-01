import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, RefreshCw, Shield, User, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PasswordResetConfirmation from './PasswordResetConfirmation';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  is_super_admin: boolean;
}

const AdminUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Create new user states
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  
  const navigate = useNavigate();

  // Get current user email
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setCurrentUserEmail(session.user.email);
      }
    };
    getCurrentUser();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      console.log('Loading users...');
      const { data, error } = await supabase.functions.invoke('admin-list-users');
      
      if (error) {
        console.error('Error from admin-list-users:', error);
        
        // Check if it's an authentication error
        if (error.message?.includes('Unauthorized') || error.message?.includes('Auth session missing')) {
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive"
          });
          // Redirect to login after a short delay
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }
        
        throw error;
      }

      setUsers(data.users || []);
      toast({
        title: "Users Loaded",
        description: `Found ${data.total_count} users in the system`
      });
    } catch (error: any) {
      console.error('Error loading users:', error);
      
      // Handle network or other errors
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        toast({
          title: "Network Error",
          description: "Please check your internet connection and try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error Loading Users",
          description: error.message || "Failed to load user list. Try refreshing the page.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordResetClick = () => {
    if (!selectedUserEmail || !newPassword) {
      toast({
        title: "Missing Information",
        description: "Please select a user and enter a new password",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setShowConfirmation(true);
  };

  const resetUserPassword = async () => {
    const isResettingOwnPassword = selectedUserEmail === currentUserEmail;
    
    setIsResetting(true);
    setShowConfirmation(false);
    
    try {
      console.log('Resetting password for:', selectedUserEmail);
      const { data, error } = await supabase.functions.invoke('admin-reset-password', {
        body: {
          targetUserEmail: selectedUserEmail,
          newPassword: newPassword
        }
      });
      
      if (error) {
        console.error('Password reset error:', error);
        throw error;
      }

      toast({
        title: "Password Reset Successful",
        description: `Password has been reset for ${selectedUserEmail}`,
      });

      // Clear the form
      setSelectedUserEmail('');
      setNewPassword('');
      setShowPassword(false);
      
      // If user reset their own password, log them out and redirect to login
      if (isResettingOwnPassword) {
        toast({
          title: "Logging Out",
          description: "Your password was changed. Redirecting to login page...",
        });
        
        // Force logout and redirect to login
        setTimeout(async () => {
          try {
            await supabase.auth.signOut();
          } catch (logoutError) {
            console.error('Logout error:', logoutError);
          } finally {
            // Force navigation to login regardless of logout success
            window.location.href = '/login';
          }
        }, 2000);
      } else {
        // Reload users to get updated info
        loadUsers();
      }
    } catch (error: any) {
      console.error('Error resetting password:', error);
      
      // Check for session-related errors
      if (error.message?.includes('Unauthorized') || error.message?.includes('Auth session missing')) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive"
        });
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        toast({
          title: "Password Reset Failed",
          description: error.message || "Failed to reset user password",
          variant: "destructive"
        });
      }
    } finally {
      setIsResetting(false);
    }
  };

  const createNewUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password for the new user",
        variant: "destructive"
      });
      return;
    }

    if (newUserPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingUser(true);
    
    try {
      console.log('Creating new user:', newUserEmail);
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: newUserEmail,
          password: newUserPassword
        }
      });
      
      if (error) {
        console.error('User creation error:', error);
        throw error;
      }

      toast({
        title: "User Created Successfully",
        description: `New user ${newUserEmail} has been created and can now log in`,
      });

      // Clear the form
      setNewUserEmail('');
      setNewUserPassword('');
      setShowNewUserPassword(false);
      
      // Reload users to show the new user
      loadUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      // Check for session-related errors
      if (error.message?.includes('Unauthorized') || error.message?.includes('Auth session missing')) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive"
        });
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        toast({
          title: "User Creation Failed",
          description: error.message || "Failed to create new user",
          variant: "destructive"
        });
      }
    } finally {
      setIsCreatingUser(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const isResettingOwnPassword = selectedUserEmail === currentUserEmail;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-red-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Panel</h1>
          <p className="text-gray-600">Manage user accounts and reset passwords</p>
          {currentUserEmail && (
            <p className="text-sm text-blue-600">Logged in as: {currentUserEmail}</p>
          )}
        </div>
      </div>

      {/* Create New User Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create New User
          </CardTitle>
          <CardDescription>
            Create a new user account with email and password. Only Super Admin can perform this action.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="newUserEmail">Email Address</Label>
            <Input
              id="newUserEmail"
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="Enter email address for new user"
            />
          </div>

          <div>
            <Label htmlFor="newUserPassword">Password</Label>
            <div className="relative mt-1">
              <Input
                id="newUserPassword"
                type={showNewUserPassword ? 'text' : 'password'}
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="Enter password (min 6 characters)"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowNewUserPassword(!showNewUserPassword)}
              >
                {showNewUserPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <Button 
            onClick={createNewUser}
            disabled={isCreatingUser || !newUserEmail || !newUserPassword}
            className="w-full"
          >
            {isCreatingUser ? 'Creating User...' : 'Create User'}
          </Button>
        </CardContent>
      </Card>

      {/* Password Reset Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Reset User Password
          </CardTitle>
          <CardDescription>
            Select a user and set a new password. Only Super Admin can perform this action.
            {isResettingOwnPassword && (
              <span className="block mt-2 text-orange-600 font-medium">
                ⚠️ Warning: You are resetting your own password. This will log you out.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="userSelect">Select User</Label>
            <select
              id="userSelect"
              value={selectedUserEmail}
              onChange={(e) => setSelectedUserEmail(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a user...</option>
              {users.map((user) => (
                <option key={user.id} value={user.email}>
                  {user.email} {user.is_super_admin ? '(Super Admin)' : ''} {user.email === currentUserEmail ? '(You)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative mt-1">
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <Button 
            onClick={handlePasswordResetClick}
            disabled={isResetting || !selectedUserEmail || !newPassword}
            className="w-full"
          >
            {isResetting ? 'Resetting Password...' : 'Reset Password'}
          </Button>
        </CardContent>
      </Card>

      {/* Users List Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                All Users ({users.length})
              </CardTitle>
              <CardDescription>
                Complete list of all users in the system
              </CardDescription>
            </div>
            <Button onClick={loadUsers} disabled={isLoading} variant="outline">
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 && !isLoading ? (
            <div className="text-center py-8 text-gray-500">
              No users found. Click "Refresh" to try loading again.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Sign In</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className={user.email === currentUserEmail ? 'bg-blue-50' : ''}>
                    <TableCell className="font-medium">
                      {user.email}
                      {user.email === currentUserEmail && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">You</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {user.last_sign_in_at 
                        ? new Date(user.last_sign_in_at).toLocaleDateString()
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.email_confirmed_at 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.email_confirmed_at ? 'Confirmed' : 'Pending'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {user.is_super_admin ? (
                        <span className="flex items-center gap-1 text-red-600 font-medium">
                          <Shield className="h-4 w-4" />
                          Super Admin
                        </span>
                      ) : (
                        <span className="text-gray-600">User</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PasswordResetConfirmation
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        onConfirm={resetUserPassword}
        userEmail={selectedUserEmail}
        isOwnPassword={isResettingOwnPassword}
        isLoading={isResetting}
      />
    </div>
  );
};

export default AdminUserManagement;
