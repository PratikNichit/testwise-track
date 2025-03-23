
import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getAllResults, ExamResult } from '@/services/api';
import { Search, Download, ArrowUpDown, BarChart3, User, School, BookOpen, LineChart } from 'lucide-react';
import { format } from 'date-fns';
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StudentPerformance = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [results, setResults] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Load results data
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setIsLoading(true);
        const data = await getAllResults();
        setResults(data);
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user && isAdmin) {
      fetchResults();
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
  
  // Sort and filter results
  const sortedAndFilteredResults = [...results]
    .filter(result => 
      result.examTitle.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === 'date') {
        return sortDirection === 'asc' 
          ? new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
          : new Date(b.examDate).getTime() - new Date(a.examDate).getTime();
      }
      
      if (sortField === 'score') {
        return sortDirection === 'asc' 
          ? a.score - b.score
          : b.score - a.score;
      }
      
      if (sortField === 'title') {
        return sortDirection === 'asc'
          ? a.examTitle.localeCompare(b.examTitle)
          : b.examTitle.localeCompare(a.examTitle);
      }
      
      return 0;
    });
  
  // Get average score
  const averageScore = results.length > 0
    ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length)
    : 0;
  
  // Get highest score
  const highestScore = results.length > 0
    ? Math.max(...results.map(result => result.score))
    : 0;
  
  // Get lowest score
  const lowestScore = results.length > 0
    ? Math.min(...results.map(result => result.score))
    : 0;
  
  // Get total students (assuming each result has a unique student ID)
  const totalStudents = new Set(results.map(result => result.id.split('-')[0])).size;
  
  // Get score distribution data for chart
  const scoreDistribution = [
    { range: '0-20', count: 0 },
    { range: '21-40', count: 0 },
    { range: '41-60', count: 0 },
    { range: '61-80', count: 0 },
    { range: '81-100', count: 0 },
  ];
  
  results.forEach(result => {
    if (result.score <= 20) scoreDistribution[0].count++;
    else if (result.score <= 40) scoreDistribution[1].count++;
    else if (result.score <= 60) scoreDistribution[2].count++;
    else if (result.score <= 80) scoreDistribution[3].count++;
    else scoreDistribution[4].count++;
  });
  
  // Get score trend data
  const scoreTrendData = [...results]
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
    .map(result => ({
      date: format(new Date(result.examDate), 'MMM d'),
      score: result.score
    }));
  
  // Handle sort change
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar isAdmin={true} />
        <main className="flex-1 p-4 sm:p-6 pt-20 sm:ml-[70px] md:ml-[240px]">
          <div className="max-w-7xl mx-auto page-transition">
            <h1 className="text-2xl font-bold mb-2">Student Performance</h1>
            <p className="text-muted-foreground mb-6">Analyze exam results and student performance</p>
            
            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Average Score</p>
                      <h3 className="text-2xl font-bold">{averageScore}%</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <BarChart3 className="text-primary" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Highest Score</p>
                      <h3 className="text-2xl font-bold">{highestScore}%</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                      <LineChart className="text-success" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Students</p>
                      <h3 className="text-2xl font-bold">{totalStudents}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center">
                      <User className="text-info" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Exams</p>
                      <h3 className="text-2xl font-bold">{results.length}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                      <BookOpen className="text-warning" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={scoreDistribution}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 0,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f680" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Score Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={scoreTrendData}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 0,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="#3b82f680" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Results table */}
            <Card>
              <CardHeader className="flex-row items-center justify-between py-4">
                <CardTitle className="text-lg">Exam Results</CardTitle>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by exam title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                        <div className="flex items-center">
                          Exam
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                        <div className="flex items-center">
                          Date
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('score')}>
                        <div className="flex items-center">
                          Score
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10">
                          Loading results...
                        </TableCell>
                      </TableRow>
                    ) : sortedAndFilteredResults.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10">
                          No results found
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedAndFilteredResults.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p>John Doe</p>
                                <p className="text-xs text-muted-foreground">john@example.com</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{result.examTitle}</TableCell>
                          <TableCell>
                            {format(new Date(result.examDate), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{result.score}%</span>
                          </TableCell>
                          <TableCell>
                            {result.score >= 80 ? (
                              <Badge className="bg-success/10 text-success hover:bg-success/20">Excellent</Badge>
                            ) : result.score >= 60 ? (
                              <Badge className="bg-info/10 text-info hover:bg-info/20">Good</Badge>
                            ) : result.score >= 40 ? (
                              <Badge className="bg-warning/10 text-warning hover:bg-warning/20">Average</Badge>
                            ) : (
                              <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">Poor</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <div className="flex justify-end mt-6">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export to CSV
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentPerformance;
