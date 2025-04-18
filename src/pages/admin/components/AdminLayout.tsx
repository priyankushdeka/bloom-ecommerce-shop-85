
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { BarChart, Users, ShoppingBag, Package, LogOut, Menu, X, Home } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin, if not redirect to home
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If not admin, don't render anything (redirection handled by useEffect)
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white shadow-sm h-16 z-20 sticky top-0">
        <div className="px-4 h-full flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden mr-2"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h1 className="text-xl font-bold text-blue-600">Admin Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <Home className="h-4 w-4 mr-1" />
                Back to Site
              </Link>
            </Button>
            
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-grow flex">
        {/* Sidebar */}
        <aside 
          className={`bg-white shadow-sm w-64 fixed inset-y-0 pt-16 z-10 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:relative`}
        >
          <div className="p-4">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
              Main
            </div>
            
            <nav className="mt-2 space-y-1">
              <Button
                variant={isActive('/admin') ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <Link to="/admin" onClick={() => setIsSidebarOpen(false)}>
                  <BarChart className="h-4 w-4 mr-3" />
                  Dashboard
                </Link>
              </Button>
              
              <Button
                variant={isActive('/admin/products') ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <Link to="/admin/products" onClick={() => setIsSidebarOpen(false)}>
                  <Package className="h-4 w-4 mr-3" />
                  Products
                </Link>
              </Button>
              
              <Button
                variant={isActive('/admin/orders') ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <Link to="/admin/orders" onClick={() => setIsSidebarOpen(false)}>
                  <ShoppingBag className="h-4 w-4 mr-3" />
                  Orders
                </Link>
              </Button>
              
              <Button
                variant={isActive('/admin/users') ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <Link to="/admin/users" onClick={() => setIsSidebarOpen(false)}>
                  <Users className="h-4 w-4 mr-3" />
                  Users
                </Link>
              </Button>
            </nav>
            
            <Separator className="my-4" />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-grow pt-4 pb-12 lg:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
