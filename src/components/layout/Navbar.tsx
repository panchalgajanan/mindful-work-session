
import { Link, useLocation } from "react-router-dom";
import { Clock, BarChart, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="bg-white dark:bg-focus-primary/20 backdrop-blur-md border-b border-focus-light/20 dark:border-focus-primary/30 fixed top-0 left-0 right-0 z-10 py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Link to="/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-focus-primary">Focus<span className="text-focus-secondary">Flow</span></span>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-2">
          <Link to="/timer" className={cn(
            "px-4 py-2 rounded-md transition-colors flex items-center gap-2",
            isActive("/timer") 
              ? "bg-focus-primary text-white" 
              : "hover:bg-focus-light/20"
          )}>
            <Clock size={18} />
            <span>Timer</span>
          </Link>
          
          <Link to="/analytics" className={cn(
            "px-4 py-2 rounded-md transition-colors flex items-center gap-2",
            isActive("/analytics") 
              ? "bg-focus-primary text-white" 
              : "hover:bg-focus-light/20"
          )}>
            <BarChart size={18} />
            <span>Analytics</span>
          </Link>
          
          <Link to="/settings" className={cn(
            "px-4 py-2 rounded-md transition-colors flex items-center gap-2",
            isActive("/settings") 
              ? "bg-focus-primary text-white" 
              : "hover:bg-focus-light/20"
          )}>
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-muted-foreground hidden md:block">
              {user.name || user.email}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={logout} className="text-red-500 hover:text-red-700 hover:bg-red-50">
            <LogOut size={18} className="mr-2" />
            <span className="hidden md:inline">Logout</span>
          </Button>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-2">
        <div className="flex justify-around">
          <Link to="/timer" className={cn(
            "flex flex-col items-center p-2 rounded-md",
            isActive("/timer") && "text-focus-primary"
          )}>
            <Clock size={20} />
            <span className="text-xs mt-1">Timer</span>
          </Link>
          
          <Link to="/analytics" className={cn(
            "flex flex-col items-center p-2 rounded-md",
            isActive("/analytics") && "text-focus-primary"
          )}>
            <BarChart size={20} />
            <span className="text-xs mt-1">Analytics</span>
          </Link>
          
          <Link to="/settings" className={cn(
            "flex flex-col items-center p-2 rounded-md",
            isActive("/settings") && "text-focus-primary"
          )}>
            <Settings size={20} />
            <span className="text-xs mt-1">Settings</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
