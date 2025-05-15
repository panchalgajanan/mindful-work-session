
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Clock, Play, BarChart, AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-focus-light/30 dark:from-gray-900 dark:to-focus-primary/30">
      <div className="container mx-auto px-4 py-12">
        {/* Header navigation */}
        <header className="flex justify-between items-center mb-12">
          <div className="text-2xl font-bold text-focus-primary">
            Focus<span className="text-focus-secondary">Flow</span>
          </div>
          <div className="space-x-4">
            {isAuthenticated ? (
              <Button 
                onClick={() => navigate("/dashboard")}
                className="bg-focus-primary hover:bg-focus-secondary transition-colors"
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="border-focus-primary text-focus-primary hover:bg-focus-light/20"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => navigate("/register")}
                  className="bg-focus-primary hover:bg-focus-secondary transition-colors"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </header>

        {/* Hero section */}
        <section className="max-w-6xl mx-auto py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-800 dark:text-white">
            Stay focused and boost your productivity<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-focus-primary to-focus-secondary">
              one Pomodoro at a time
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
            FocusFlow combines a powerful Pomodoro timer with distraction blocking
            and insightful analytics to help you achieve deep work.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button 
              size="lg" 
              onClick={() => navigate(isAuthenticated ? "/timer" : "/register")}
              className="bg-focus-primary hover:bg-focus-secondary text-white px-8 py-6 text-lg rounded-lg transition-all"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <span>Start Focusing Now</span>
              <ArrowRight className={`ml-2 transition-transform ${isHovering ? 'translate-x-1' : ''}`} />
            </Button>
          </div>
        </section>

        {/* Features section */}
        <section className="py-16 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">
            Powerful features to enhance your productivity
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-focus-primary/10 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow card-gradient">
              <div className="mb-4 p-3 bg-focus-light/30 dark:bg-focus-primary/20 rounded-full w-fit">
                <Clock className="h-6 w-6 text-focus-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Pomodoro Timer</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Customize your work sessions and breaks. The Pomodoro technique helps maintain focus through structured time blocks.
              </p>
            </div>
            
            <div className="bg-white dark:bg-focus-primary/10 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow card-gradient">
              <div className="mb-4 p-3 bg-focus-light/30 dark:bg-focus-primary/20 rounded-full w-fit">
                <AlertOctagon className="h-6 w-6 text-focus-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Distraction Blocker</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Block distracting websites during work sessions. Automatically unblocks during breaks to allow guilt-free browsing.
              </p>
            </div>
            
            <div className="bg-white dark:bg-focus-primary/10 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow card-gradient">
              <div className="mb-4 p-3 bg-focus-light/30 dark:bg-focus-primary/20 rounded-full w-fit">
                <BarChart className="h-6 w-6 text-focus-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Focus Analytics</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track your progress with detailed analytics. Understand your focus patterns and improve your productivity habits.
              </p>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="py-16 text-center">
          <div className="max-w-3xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-focus-primary to-focus-secondary text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to maximize your productivity?</h2>
            <p className="text-lg mb-6">
              Join thousands of users who have improved their focus and achieved more with FocusFlow.
            </p>
            <Button 
              size="lg"
              onClick={() => navigate(isAuthenticated ? "/timer" : "/register")}
              className="bg-white text-focus-primary hover:bg-gray-100 px-8 py-6"
            >
              <Play className="mr-2" />
              <span>{isAuthenticated ? "Go to Timer" : "Get Started for Free"}</span>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>© 2025 FocusFlow. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
