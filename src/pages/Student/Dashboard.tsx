
import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import ExamCard from '@/components/ui/ExamCard';
import ResultCard from '@/components/ui/ResultCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getStudentExams, getStudentResults, Exam, ExamResult } from '@/services/api';
import { Calendar, BookOpen, Award, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch exams and results in parallel
        const [examsData, resultsData] = await Promise.all([
          getStudentExams(),
          getStudentResults()
        ]);
        
        setExams(examsData);
        setResults(resultsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user]);
  
  // Redirect if not logged in
  if (!loading && !user) {
    return <Navigate to="/login" />;
  }
  
  // Redirect if admin
  if (!loading && user?.role === 'admin') {
    return <Navigate to="/admin" />;
  }
  
  // Filter exams by status
  const upcomingExams = exams.filter(exam => exam.status === 'upcoming');
  const ongoingExams = exams.filter(exam => exam.status === 'ongoing');
  const completedExams = exams.filter(exam => exam.status === 'completed');
  
  // Get recent results (top 2)
  const recentResults = [...results].sort((a, b) => 
    new Date(b.examDate).getTime() - new Date(a.examDate).getTime()
  ).slice(0, 2);
  
  // Calculate overall statistics
  const totalExams = exams.length;
  const totalCompletedExams = completedExams.length;
  const averageScore = results.length > 0 
    ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length) 
    : 0;
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 pt-20 sm:ml-[70px] md:ml-[240px]">
          <div className="max-w-7xl mx-auto page-transition">
            {/* Welcome card */}
            <Card className="mb-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/10">
              <CardContent className="pt-6 pb-6">
                <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.displayName || 'Student'}</h1>
                <p className="text-muted-foreground">
                  Your learning journey continues. You have {ongoingExams.length} ongoing and {upcomingExams.length} upcoming exams.
                </p>
              </CardContent>
            </Card>
            
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Total Exams</p>
                      <h3 className="text-2xl font-bold">{totalExams}</h3>
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
                      <p className="text-sm font-medium text-muted-foreground mb-1">Completed</p>
                      <h3 className="text-2xl font-bold">{totalCompletedExams}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                      <Award className="text-success" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Average Score</p>
                      <h3 className="text-2xl font-bold">{averageScore}%</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center">
                      <Calendar className="text-info" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Ongoing Exams Section */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Ongoing Exams</h2>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-1 text-sm"
                  onClick={() => navigate('/exams')}
                >
                  View All
                  <ArrowRight size={16} />
                </Button>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              ) : ongoingExams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ongoingExams.map(exam => (
                    <ExamCard
                      key={exam.id}
                      id={exam.id}
                      title={exam.title}
                      subject={exam.subject}
                      scheduledDate={exam.scheduledDate}
                      duration={exam.duration}
                      questionsCount={exam.questionsCount}
                      status={exam.status}
                    />
                  ))}
                </div>
              ) : (
                <Card className="bg-muted/40">
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No ongoing exams at the moment.</p>
                  </CardContent>
                </Card>
              )}
            </section>
            
            {/* Upcoming Exams Section */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Upcoming Exams</h2>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2].map(i => (
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
              ) : upcomingExams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingExams.map(exam => (
                    <ExamCard
                      key={exam.id}
                      id={exam.id}
                      title={exam.title}
                      subject={exam.subject}
                      scheduledDate={exam.scheduledDate}
                      duration={exam.duration}
                      questionsCount={exam.questionsCount}
                      status={exam.status}
                    />
                  ))}
                </div>
              ) : (
                <Card className="bg-muted/40">
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No upcoming exams scheduled.</p>
                  </CardContent>
                </Card>
              )}
            </section>
            
            {/* Recent Results Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Recent Results</h2>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-1 text-sm"
                  onClick={() => navigate('/results')}
                >
                  View All
                  <ArrowRight size={16} />
                </Button>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map(i => (
                    <Card key={i} className="w-full shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="animate-pulse h-6 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="animate-pulse h-4 bg-muted rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="animate-pulse h-4 bg-muted rounded w-full mb-3"></div>
                        <div className="animate-pulse h-8 bg-muted rounded w-full mb-3"></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="animate-pulse h-16 bg-muted rounded"></div>
                          <div className="animate-pulse h-16 bg-muted rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : recentResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentResults.map(result => (
                    <ResultCard
                      key={result.id}
                      id={result.examId}
                      examTitle={result.examTitle}
                      examDate={result.examDate}
                      duration={result.duration}
                      score={result.score}
                      totalScore={result.totalScore}
                      correctAnswers={result.correctAnswers}
                      totalQuestions={result.totalQuestions}
                    />
                  ))}
                </div>
              ) : (
                <Card className="bg-muted/40">
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No exam results available yet.</p>
                  </CardContent>
                </Card>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
