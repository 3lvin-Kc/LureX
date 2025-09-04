import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, 
  Target, 
  Trophy, 
  Clock, 
  BarChart3, 
  TrendingUp,
  Users,
  CheckCircle
} from "lucide-react";
import { useEducationSessions } from "@/hooks/useEducationSessions";
import { format } from "date-fns";

export function EducationAnalyticsDashboard() {
  const { sessions, analytics, loading, getCompletionTrend } = useEducationSessions();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No education data available</p>
      </div>
    );
  }

  const completionTrend = getCompletionTrend();
  const recentSessions = sessions.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              Education sessions created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completionRate}%</div>
            <div className="mt-1 h-2">
              <Progress value={analytics.completionRate} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.completedSessions} of {analytics.totalSessions} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              Learning assessment average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageTimeToComplete}m</div>
            <p className="text-xs text-muted-foreground">
              Average completion time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Risk Assessment Distribution
          </CardTitle>
          <CardDescription>
            User risk levels based on clicking behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {analytics.riskDistribution.high}
              </div>
              <Badge variant="destructive" className="mt-2">High Risk</Badge>
              <p className="text-sm text-muted-foreground mt-1">
                Clicked &lt; 10 seconds
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {analytics.riskDistribution.medium}
              </div>
              <Badge variant="secondary" className="mt-2">Medium Risk</Badge>
              <p className="text-sm text-muted-foreground mt-1">
                Clicked 10-30 seconds
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {analytics.riskDistribution.low}
              </div>
              <Badge variant="outline" className="mt-2">Low Risk</Badge>
              <p className="text-sm text-muted-foreground mt-1">
                Clicked &gt; 30 seconds
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Recent Education Sessions
          </CardTitle>
          <CardDescription>
            Latest phishing education completions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentSessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No education sessions yet
            </p>
          ) : (
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      session.education_completed 
                        ? 'bg-green-500' 
                        : session.education_started_at 
                          ? 'bg-yellow-500' 
                          : 'bg-gray-300'
                    }`} />
                    <div>
                      <p className="text-sm font-medium">
                        {session.target_email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(session.created_at), "MMM d, yyyy 'at' HH:mm")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {session.education_completed ? (
                      <div>
                        <Badge variant="default">Completed</Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Score: {session.learning_score}%
                        </p>
                      </div>
                    ) : session.education_started_at ? (
                      <Badge variant="secondary">In Progress</Badge>
                    ) : (
                      <Badge variant="outline">Not Started</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completion Trend */}
      {completionTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Education Completion Trend
            </CardTitle>
            <CardDescription>
              Daily completion rates over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-end space-x-1">
              {completionTrend.map((day, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center"
                >
                  <div
                    className="w-full bg-blue-200 rounded-t"
                    style={{
                      height: `${Math.max(day.completionRate * 2, 4)}px`,
                      backgroundColor: day.completionRate > 80 
                        ? '#22c55e' 
                        : day.completionRate > 50 
                          ? '#eab308' 
                          : '#ef4444'
                    }}
                    title={`${format(new Date(day.date), 'MMM d')}: ${Math.round(day.completionRate)}% completion rate`}
                  />
                  {index % 5 === 0 && (
                    <span className="text-xs text-muted-foreground mt-1 transform rotate-45">
                      {format(new Date(day.date), 'M/d')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}