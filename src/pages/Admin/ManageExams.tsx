
import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAllExams, deleteExam, Exam } from '@/services/api';
import { 
  PlusCircle, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  AlertTriangle,
  Loader2,
  CalendarClock,
  Clock,
  BookOpen
} from 'lucide-react';
import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns';

const ManageExams = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setIsLoading(true);
        const data = await getAllExams();
        setExams(data);
      } catch (error) {
        console.error('Error fetching exams:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user && isAdmin) {
      fetchExams();
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
  
  // Filter exams based on search query
  const filteredExams = exams.filter(exam => 
    exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Group exams by status
  const upcomingExams = filteredExams.filter(exam => exam.status === 'upcoming');
  const ongoingExams = filteredExams.filter(exam => exam.status === 'ongoing');
  const completedExams = filteredExams.filter(exam => exam.status === 'completed');
  
  // Handle exam deletion
  const confirmDelete = (exam: Exam) => {
    setExamToDelete(exam);
  };
  
  const handleDelete = async () => {
    if (!examToDelete) return;
    
    try {
      setIsDeleting(true);
      await deleteExam(examToDelete.id);
      
      // Remove exam from state
      setExams(exams.filter(e => e.id !== examToDelete.id));
      
      // Close dialog
      setExamToDelete(null);
    } catch (error) {
      console.error('Error deleting exam:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PPP');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  // Get relative time for display
  const getRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      if (isPast(date)) {
        return `${formatDistanceToNow(date)} ago`;
      } else {
        return `in ${formatDistanceToNow(date)}`;
      }
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  const renderExamRow = (exam: Exam) => (
    <TableRow key={exam.id}>
      <TableCell className="font-medium">{exam.title}</TableCell>
      <TableCell>{exam.subject}</TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span>{formatDate(exam.scheduledDate)}</span>
          <span className="text-xs text-muted-foreground">{getRelativeTime(exam.scheduledDate)}</span>
        </div>
      </TableCell>
      <TableCell>{exam.duration} min</TableCell>
      <TableCell>{exam.questionsCount}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical size={16} />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(`/admin/exams/${exam.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/admin/exams/${exam.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Exam
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={() => confirmDelete(exam)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Exam
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar isAdmin={true} />
        <main className="flex-1 p-4 sm:p-6 pt-20 sm:ml-[70px] md:ml-[240px]">
          <div className="max-w-7xl mx-auto page-transition">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <div>
                <h1 className="text-2xl font-bold">Manage Exams</h1>
                <p className="text-muted-foreground">View, edit and delete exams</p>
              </div>
              
              <Button onClick={() => navigate('/admin/exams/new')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Schedule New Exam
              </Button>
            </div>
            
            {/* Search and filters */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exams by title or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Exams list */}
            <Tabs defaultValue="all">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Exams</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              
              <Card>
                <CardHeader className="px-6 py-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Exams</CardTitle>
                    <CardDescription>{filteredExams.length} total</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredExams.length === 0 ? (
                    <div className="py-16 text-center">
                      <p className="text-muted-foreground mb-4">No exams found</p>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/admin/exams/new')}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Schedule New Exam
                      </Button>
                    </div>
                  ) : (
                    <>
                      <TabsContent value="all" className="mt-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Title</TableHead>
                              <TableHead>Subject</TableHead>
                              <TableHead>Scheduled</TableHead>
                              <TableHead>Duration</TableHead>
                              <TableHead>Questions</TableHead>
                              <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredExams.map(renderExamRow)}
                          </TableBody>
                        </Table>
                      </TabsContent>
                      
                      <TabsContent value="upcoming" className="mt-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Title</TableHead>
                              <TableHead>Subject</TableHead>
                              <TableHead>Scheduled</TableHead>
                              <TableHead>Duration</TableHead>
                              <TableHead>Questions</TableHead>
                              <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {upcomingExams.length > 0 ? (
                              upcomingExams.map(renderExamRow)
                            ) : (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                  No upcoming exams
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TabsContent>
                      
                      <TabsContent value="ongoing" className="mt-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Title</TableHead>
                              <TableHead>Subject</TableHead>
                              <TableHead>Scheduled</TableHead>
                              <TableHead>Duration</TableHead>
                              <TableHead>Questions</TableHead>
                              <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {ongoingExams.length > 0 ? (
                              ongoingExams.map(renderExamRow)
                            ) : (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                  No ongoing exams
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TabsContent>
                      
                      <TabsContent value="completed" className="mt-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Title</TableHead>
                              <TableHead>Subject</TableHead>
                              <TableHead>Scheduled</TableHead>
                              <TableHead>Duration</TableHead>
                              <TableHead>Questions</TableHead>
                              <TableHead className="w-[80px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {completedExams.length > 0 ? (
                              completedExams.map(renderExamRow)
                            ) : (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                                  No completed exams
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TabsContent>
                    </>
                  )}
                </CardContent>
              </Card>
            </Tabs>
            
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <Card className="bg-info/5 border-info/20">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <CalendarClock className="h-5 w-5 text-info mr-2" />
                    <h3 className="text-lg font-medium">Upcoming</h3>
                  </div>
                  <p className="text-3xl font-bold">{upcomingExams.length}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-warning/5 border-warning/20">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Clock className="h-5 w-5 text-warning mr-2" />
                    <h3 className="text-lg font-medium">Ongoing</h3>
                  </div>
                  <p className="text-3xl font-bold">{ongoingExams.length}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-success/5 border-success/20">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <BookOpen className="h-5 w-5 text-success mr-2" />
                    <h3 className="text-lg font-medium">Completed</h3>
                  </div>
                  <p className="text-3xl font-bold">{completedExams.length}</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Delete confirmation dialog */}
            <Dialog open={!!examToDelete} onOpenChange={(open) => !open && setExamToDelete(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    This will permanently delete the exam 
                    <span className="font-medium text-foreground"> {examToDelete?.title} </span>
                    and all associated data. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="flex items-center p-3 bg-destructive/10 text-destructive rounded-md">
                  <AlertTriangle className="h-5 w-5 mr-3" />
                  <p className="text-sm">All student data and results for this exam will also be deleted.</p>
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setExamToDelete(null)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Exam
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageExams;
