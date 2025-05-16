import { useState } from "react";
import { BarChart as BarChartIcon, PieChart, Calendar, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import { useFocus, FocusSession } from "@/contexts/FocusContext";
import { 
  formatDuration, 
  formatDateFull, 
  getDateRangeLabel,
  ensureValidDate 
} from "@/lib/time-utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORS = ['#2A6B84', '#3C8DAD', '#A5D8E6', '#66B2D2'];

const Analytics = () => {
  const { sessions } = useFocus();
  const [dateRange, setDateRange] = useState<7 | 14 | 30>(7);
  
  // Filter sessions by date range with proper date handling
  const filteredSessions = sessions.filter(session => {
    const sessionDate = ensureValidDate(session.startTime);
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - dateRange);
    return sessionDate >= pastDate && sessionDate <= today;
  });

  // Group sessions by day with proper date handling
  const sessionsByDay = filteredSessions.reduce<Record<string, FocusSession[]>>((acc, session) => {
    const date = ensureValidDate(session.startTime).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(session);
    return acc;
  }, {});

  // Create data for bar chart
  const dailyData = Object.entries(sessionsByDay).map(([date, daySessions]) => {
    const totalMinutes = daySessions.reduce((total, session) => {
      if (session.type === 'work' && session.endTime) {
        const startTime = ensureValidDate(session.startTime).getTime();
        const endTime = ensureValidDate(session.endTime).getTime();
        const duration = Math.floor((endTime - startTime) / 1000) - (session.pauseDuration || 0);
        return total + duration / 60; // Convert to minutes
      }
      return total;
    }, 0);
    
    const completedSessions = daySessions.filter(
      session => session.type === 'work' && session.completed
    ).length;
    
    const abortedSessions = daySessions.filter(
      session => session.type === 'work' && session.aborted
    ).length;
    
    return {
      date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      totalMinutes: Math.round(totalMinutes),
      completedSessions,
      abortedSessions
    };
  }).sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Create data for pie chart
  const totalCompleted = filteredSessions.filter(
    session => session.type === 'work' && session.completed
  ).length;
  
  const totalAborted = filteredSessions.filter(
    session => session.type === 'work' && session.aborted
  ).length;
  
  const pieData = [
    { name: 'Completed', value: totalCompleted },
    { name: 'Aborted', value: totalAborted }
  ];

  // Calculate stats with proper date handling
  const totalFocusTime = filteredSessions
    .filter(session => session.type === 'work')
    .reduce((total, session) => {
      if (session.endTime) {
        const startTime = ensureValidDate(session.startTime).getTime();
        const endTime = ensureValidDate(session.endTime).getTime();
        const duration = Math.floor((endTime - startTime) / 1000) - (session.pauseDuration || 0);
        return total + duration;
      }
      return total;
    }, 0);
  
  const averageDailyFocusTime = dailyData.length > 0
    ? Math.round(dailyData.reduce((sum, day) => sum + day.totalMinutes, 0) / dailyData.length)
    : 0;
  
  const completionRate = (totalCompleted + totalAborted) > 0
    ? Math.round((totalCompleted / (totalCompleted + totalAborted)) * 100)
    : 0;

  
  return (
    <Layout title="Focus Analytics">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium text-muted-foreground">
            Viewing data for the last {dateRange} days
          </h2>
          <p className="text-sm text-muted-foreground">
            {getDateRangeLabel(dateRange)}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className={dateRange === 7 ? "bg-focus-light/30" : ""}
            onClick={() => setDateRange(7)}
          >
            7 Days
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className={dateRange === 14 ? "bg-focus-light/30" : ""}
            onClick={() => setDateRange(14)}
          >
            14 Days
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className={dateRange === 30 ? "bg-focus-light/30" : ""}
            onClick={() => setDateRange(30)}
          >
            30 Days
          </Button>
        </div>
      </div>
      
      
      {filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="text-muted-foreground text-center">
              <p className="text-lg font-medium mb-2">No focus data available</p>
              <p className="mb-6">
                Complete some focus sessions to see your analytics here.
              </p>
              <Button onClick={() => window.location.href = '/timer'}>
                Start a Focus Session
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-900 border-blue-100 dark:border-blue-900 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-focus-primary">Total Focus Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-focus-primary">
                  {formatDuration(totalFocusTime)}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-900 border-blue-100 dark:border-blue-900 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-focus-primary">Avg. Daily Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-focus-primary">
                  {averageDailyFocusTime} minutes
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-900 border-blue-100 dark:border-blue-900 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-focus-primary">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-focus-primary">{completionRate}%</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts */}
          <Tabs defaultValue="barChart" className="mb-8">
            <TabsList className="mb-4">
              <TabsTrigger value="barChart" className="flex items-center gap-2">
                <BarChartIcon className="h-4 w-4" />
                <span>Focus Time</span>
              </TabsTrigger>
              <TabsTrigger value="pieChart" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                <span>Completion</span>
              </TabsTrigger>
              <TabsTrigger value="sessions" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Sessions</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="barChart">
              <Card className="border-blue-100 dark:border-blue-900 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-focus-primary to-focus-secondary text-white">
                  <CardTitle>Daily Focus Minutes</CardTitle>
                </CardHeader>
                <CardContent className="h-80 pt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis unit="m" />
                      <Tooltip 
                        formatter={(value) => [`${value} minutes`, 'Focus Time']}
                        labelStyle={{ color: '#374151' }}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px'
                        }}
                      />
                      <Bar dataKey="totalMinutes" fill="#2A6B84" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="pieChart">
              <Card className="border-blue-100 dark:border-blue-900 shadow-lg overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-focus-primary to-focus-secondary text-white">
                  <CardTitle>Session Completion</CardTitle>
                </CardHeader>
                <CardContent className="h-80 pt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sessions">
              <Card className="border-blue-100 dark:border-blue-900 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-focus-primary to-focus-secondary text-white">
                  <CardTitle>Recent Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Date & Time</th>
                          <th className="text-left py-3 px-4 font-medium">Type</th>
                          <th className="text-left py-3 px-4 font-medium">Duration</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSessions
                          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                          .slice(0, 10)
                          .map((session) => (
                            <tr key={session.id} className="border-b hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors">
                              <td className="py-3 px-4">{formatDateFull(ensureValidDate(session.startTime))}</td>
                              <td className="py-3 px-4 capitalize">{session.type}</td>
                              <td className="py-3 px-4">{formatDuration(session.duration)}</td>
                              <td className="py-3 px-4">
                                <span className={`inline-block px-2 py-1 rounded text-xs ${
                                  session.completed 
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
                                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                                }`}>
                                  {session.completed ? "Completed" : "Aborted"}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </Layout>
  );
};

export default Analytics;
