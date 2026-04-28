import { teacherDashboardData } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Brain, TrendingUp } from "lucide-react";

export default function TeacherDashboard() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-navy mb-2">Teacher Dashboard</h1>
        <p className="text-muted-foreground text-lg">{teacherDashboardData.className} Overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <Card className="border-none shadow-sm bg-parchment/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Students</p>
              <h3 className="text-2xl font-bold text-navy">24</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-parchment/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-accent/10 text-accent rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Module</p>
              <h3 className="text-2xl font-bold text-navy">Module 2</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-parchment/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-navy/10 text-navy rounded-xl">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Class Mastery</p>
              <h3 className="text-2xl font-bold text-navy">78%</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-parchment/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 text-green-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Weekly Growth</p>
              <h3 className="text-2xl font-bold text-navy">+12%</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl text-navy">Live Student Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-parchment/50 rounded-t-lg">
                    <tr>
                      <th className="px-6 py-4 rounded-tl-lg">Student</th>
                      <th className="px-6 py-4">Current Stage</th>
                      <th className="px-6 py-4">Engagement</th>
                      <th className="px-6 py-4 rounded-tr-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherDashboardData.students.map((student, i) => (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-parchment/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-navy">{student.name}</td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="font-medium">
                            {student.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              student.engagement === 'High' ? 'bg-green-500' :
                              student.engagement === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                            <span>{student.engagement}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-primary font-medium hover:underline">View Report</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl text-navy">Thinking Cycle Mastery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Analyze</span>
                  <span className="text-primary">{teacherDashboardData.classMastery.analyze}%</span>
                </div>
                <Progress value={teacherDashboardData.classMastery.analyze} className="h-2 bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Evaluate</span>
                  <span className="text-accent">{teacherDashboardData.classMastery.evaluate}%</span>
                </div>
                <Progress value={teacherDashboardData.classMastery.evaluate} className="h-2 bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Justify</span>
                  <span className="text-navy">{teacherDashboardData.classMastery.justify}%</span>
                </div>
                <Progress value={teacherDashboardData.classMastery.justify} className="h-2 bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Reflect</span>
                  <span className="text-green-600">{teacherDashboardData.classMastery.reflect}%</span>
                </div>
                <Progress value={teacherDashboardData.classMastery.reflect} className="h-2 bg-muted" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
