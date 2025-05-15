
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate(from, { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-focus-light/30 dark:from-gray-900 dark:to-focus-primary/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-2xl font-bold text-focus-primary">
              Focus<span className="text-focus-secondary">Flow</span>
            </h1>
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="text-xs text-focus-primary hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-focus-primary hover:bg-focus-secondary"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Don't have an account?{" "}
            </span>
            <Link
              to="/register"
              className="text-focus-primary hover:text-focus-secondary hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
        
        <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-xs">
          <Link to="/" className="hover:underline">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
