
import { useNavigate } from "react-router-dom";
import { Clock, Play, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useFocus } from "@/contexts/FocusContext";
import { formatDuration } from "@/lib/time-utils";

const Dashboard = () => {
  const { user } = useAuth();
  const { sessions, timerState, startTimer } = useFocus();
  const navigate = useNavigate();
  
  // Calculate stats from sessions
  const todaySessions = sessions.filter(session => {
    const today = new Date();
    const sessionDate = new Date(session.startTime);
    return sessionDate.toDateString() === today.toDateString();
  });
  
  const totalWorkSessions = sessions.filter(session => session.type === 'work').length;
  const completedWorkSessions = sessions.filter(session => session.type === 'work' && session.completed).length;
  const completionRate = totalWorkSessions > 0 
    ? Math.round((completedWorkSessions / totalWorkSessions) * 100) 
    : 0;
  
  const totalFocusTime = sessions
    .filter(session => session.type === 'work')
    .reduce((total, session) => {
      if (session.endTime) {
        const duration = Math.floor(
          (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000
        );
        return total + duration - (session.pauseDuration || 0);
      }
      return total;
    }, 0);
  
  const todayFocusTime = todaySessions
    .filter(session => session.type === 'work')
    .reduce((total, session) => {
      if (session.endTime) {
        const duration = Math.floor(
          (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000
        );
        return total + duration - (session.pauseDuration || 0);
      }
      return total;
    }, 0);

  return (
    <Layout title={`Welcome, ${user?.name || 'Friend'}`}>
      {/* Timer quick action */}
      <section className="mb-8">
        <Card className="bg-gradient-to-r from-focus-primary to-focus-secondary text-white">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Ready to focus?</h3>
                <p className="text-white/80">
                  {timerState === 'idle' 
                    ? 'Start a new focus session to boost your productivity.'
                    : 'You have an active session. Continue your focus journey!'}
                </p>
              </div>
              <Button 
                size="lg"
                variant={timerState === 'idle' ? "default" : "outline"}
                className={timerState === 'idle' 
                  ? "bg-white text-focus-primary hover:bg-gray-100" 
                  : "border-white text-white hover:bg-white/20"
                }
                onClick={() => navigate("/timer")}
              >
                {timerState === 'idle' ? (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Focus Session
                  </>
                ) : (
                  <>
                    <Clock className="mr-2 h-4 w-4" />
                    Continue Session
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Stats overview */}
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Today's Focus Time</CardTitle>
              <CardDescription>Total time spent focusing today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-focus-primary">
                {formatDuration(todayFocusTime)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Completion Rate</CardTitle>
              <CardDescription>Percentage of completed sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="text-2xl font-bold text-focus-primary">{completionRate}%</div>
                <Progress value={completionRate} className="h-2" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Total Focus Time</CardTitle>
              <CardDescription>All-time focus duration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-focus-primary">
                {formatDuration(totalFocusTime)}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/timer")}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-focus-light/30 rounded-full">
                <Clock className="h-6 w-6 text-focus-primary" />
              </div>
              <div>
                <h3 className="font-medium">Pomodoro Timer</h3>
                <p className="text-sm text-muted-foreground">Start a new focus session</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/analytics")}>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-focus-light/30 rounded-full">
                <BarChart className="h-6 w-6 text-focus-primary" />
              </div>
              <div>
                <h3 className="font-medium">View Analytics</h3>
                <p className="text-sm text-muted-foreground">See your productivity trends</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;
