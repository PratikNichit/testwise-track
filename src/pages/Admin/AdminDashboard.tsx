
import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import ExamCard from '@/components/ui/ExamCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAllExams, getAllResults, Exam, ExamResult } from '@/services/api';
import { PlusCircle, BarChart, BookOpen, Users, Calendar, User, Loader2 } from 'lucide-react';

const AdminDashboard = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch exams and results data in parallel
        const [examsData, resultsData] = await Promise.all([
          getAllExams(),
          getAllResults()
        ]);
        
        setExams(examsData);
        setResults(resultsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);
  
  // Redirect if not logged in
  if (!loading && !user) {
    return <Navigate to="/login" />;
  }
  
  // Redirect if not admin
  if (!loading && user && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  
  // Calculate statistics
  const upcomingExamsCount = exams.filter(exam => exam.status === 'upcoming').length;
  const ongoingExamsCount = exams.filter(exam => exam.status === 'ongoing').length;
  const completedExamsCount = exams.filter(exam => exam.status === 'completed').length;
  
  // Calculate average score
  const averageScore = results.length > 0
    ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length)
    : 0;
  
  // Get unique student count (assuming each result has a unique student)
  const uniqueStudents = new Set(results.map(result => result.id.split('-')[0])).size;
  
  // Get recent exams
  const recentExams = [...exams]
    .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
    .slice(0, 3);
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar isAdmin={true} />
        <main className="flex-1 p-4 sm:p-6 pt-20 sm:ml-[70px] md:ml-[240px]">
          <div className="max-w-7xl mx-auto page-transition">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage exams and view student performance</p>
              </div>
              
              <Button onClick={() => navigate('/admin/exams/new')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Schedule New Exam
              </Button>
            </div>
            
            {/* Statistics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Total Exams</p>
                      <h3 className="text-2xl font-bold">{exams.length}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <BookOpen className="text-primary" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Active Exams</p>
                      <h3 className="text-2xl font-bold">{ongoingExamsCount}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                      <Calendar className="text-warning" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Students</p>
                      <h3 className="text-2xl font-bold">{uniqueStudents}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center">
                      <Users className="text-info" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Avg. Score</p>
                      <h3 className="text-2xl font-bold">{averageScore}%</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                      <BarChart className="text-success" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent exams section */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Recent Exams</h2>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/admin/exams')}
                  className="text-sm"
                >
                  View All
                </Button>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <ExamCard
                      key={i}
                      id=""
                      title=""
                      subject=""
                      scheduledDate=""
                      duration={0}
                      questionsCount={0}
                      loading={true}
                    />
                  ))}
                </div>
              ) : recentExams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentExams.map(exam => (
                    <ExamCard
                      key={exam.id}
                      id={exam.id}
                      title={exam.title}
                      subject={exam.subject}
                      scheduledDate={exam.scheduledDate}
                      duration={exam.duration}
                      questionsCount={exam.questionsCount}
                      status={exam.status}
                      admin={true}
                    />
                  ))}
                </div>
              ) : (
                <Card className="bg-muted/40">
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No exams available yet.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate('/admin/exams/new')}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Schedule New Exam
                    </Button>
                  </CardContent>
                </Card>
              )}
            </section>
            
            {/* Status summary */}
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">Exam Status Summary</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-info/5 border-info/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Upcoming</h3>
                      <div className="h-10 w-10 rounded-full bg-info/10 flex items-center justify-center">
                        <Calendar className="text-info" size={20} />
                      </div>
                    </div>
                    <p className="text-3xl font-bold">{upcomingExamsCount}</p>
                    <p className="text-muted-foreground text-sm mt-1">Scheduled exams</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-warning/5 border-warning/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Ongoing</h3>
                      <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                        <BookOpen className="text-warning" size={20} />
                      </div>
                    </div>
                    <p className="text-3xl font-bold">{ongoingExamsCount}</p>
                    <p className="text-muted-foreground text-sm mt-1">Active exams</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-success/5 border-success/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Completed</h3>
                      <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                        <BarChart className="text-success" size={20} />
                      </div>
                    </div>
                    <p className="text-3xl font-bold">{completedExamsCount}</p>
                    <p className="text-muted-foreground text-sm mt-1">Finished exams</p>
                  </CardContent>
                </Card>
              </div>
            </section>
            
            {/* Recent activity - placeholder */}
            <section>
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                        <User className="text-primary" size={18} />
                      </div>
                      <div>
                        <p className="font-medium">John Doe</p>
                        <p className="text-sm text-muted-foreground">Completed "English Literature" with score 85%</p>
                        <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                        <User className="text-primary" size={18} />
                      </div>
                      <div>
                        <p className="font-medium">Alice Smith</p>
                        <p className="text-sm text-muted-foreground">Started "Advanced Mathematics" exam</p>
                        <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                        <User className="text-primary" size={18} />
                      </div>
                      <div>
                        <p className="font-medium">Robert Johnson</p>
                        <p className="text-sm text-muted-foreground">Registered for "Basic Physics" exam</p>
                        <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
