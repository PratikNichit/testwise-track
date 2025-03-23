
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import QuestionCard from '@/components/ui/QuestionCard';
import Timer from '@/components/ui/Timer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getExamById, getExamQuestions, submitExam, Exam, Question } from '@/services/api';
import { ChevronLeft, ChevronRight, Send, AlertCircle, Loader2 } from 'lucide-react';

const ExamPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitConfirmed, setSubmitConfirmed] = useState(false);
  const [timeEnded, setTimeEnded] = useState(false);
  
  // Function to handle time end
  const handleTimeEnd = useCallback(() => {
    setTimeEnded(true);
    setShowSubmitDialog(true);
  }, []);
  
  // Load exam and questions
  useEffect(() => {
    const fetchExamData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch exam details and questions in parallel
        const [examData, questionsData] = await Promise.all([
          getExamById(id),
          getExamQuestions(id)
        ]);
        
        if (!examData) {
          navigate('/dashboard');
          return;
        }
        
        setExam(examData);
        setQuestions(questionsData);
        
        // Initialize answers object with empty values
        const initialAnswers: Record<string, string> = {};
        questionsData.forEach(q => {
          initialAnswers[q.id] = '';
        });
        setAnswers(initialAnswers);
      } catch (error) {
        console.error('Error fetching exam data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExamData();
  }, [id, navigate]);
  
  // Submit exam
  const handleSubmitExam = async () => {
    if (!id) return;
    
    try {
      setIsSubmitting(true);
      
      const result = await submitExam(id, answers);
      
      // Navigate to results page
      navigate(`/results/${id}`);
    } catch (error) {
      console.error('Error submitting exam:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle answering a question
  const handleAnswerQuestion = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };
  
  // Navigation functions
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };
  
  // Count answered questions
  const answeredCount = Object.values(answers).filter(a => a !== '').length;
  
  // Redirect if not logged in
  if (!loading && !user) {
    return <Navigate to="/login" />;
  }
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg">Loading exam...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Show error if exam not found
  if (!exam) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Exam Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The exam you're looking for doesn't exist or you don't have access to it.
              </p>
              <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  // Get current question
  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 px-4 pt-20 pb-10">
        <div className="max-w-5xl mx-auto page-transition">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{exam.title}</h1>
              <p className="text-muted-foreground">{exam.subject}</p>
            </div>
            
            <Timer 
              duration={exam.duration} 
              onTimeEnd={handleTimeEnd}
              className="w-auto md:w-48"
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Question display - main content */}
            <div className="md:flex-[3]">
              {currentQuestion && (
                <QuestionCard
                  id={currentQuestion.id}
                  questionNumber={currentQuestionIndex + 1}
                  questionText={currentQuestion.text}
                  options={currentQuestion.options}
                  selectedOption={answers[currentQuestion.id]}
                  onChange={(optionId) => handleAnswerQuestion(currentQuestion.id, optionId)}
                />
              )}
              
              <div className="mt-6 flex justify-between">
                <Button
                  variant="outline"
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="gap-1"
                >
                  <ChevronLeft size={16} />
                  Previous
                </Button>
                
                {currentQuestionIndex < questions.length - 1 ? (
                  <Button 
                    onClick={goToNextQuestion} 
                    className="gap-1"
                  >
                    Next
                    <ChevronRight size={16} />
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setShowSubmitDialog(true)} 
                    className="gap-1"
                  >
                    Submit
                    <Send size={16} />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Question navigation - sidebar */}
            <div className="md:flex-1">
              <Card>
                <CardContent className="p-4">
                  <div className="mb-3">
                    <p className="font-medium">Questions</p>
                    <p className="text-sm text-muted-foreground">
                      {answeredCount} of {questions.length} answered
                    </p>
                  </div>
                  
                  <Tabs defaultValue="all">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="flagged">Unanswered</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all" className="m-0">
                      <div className="grid grid-cols-5 gap-2">
                        {questions.map((q, index) => (
                          <Button
                            key={q.id}
                            variant={index === currentQuestionIndex ? "default" : "outline"}
                            className={`w-full h-10 p-0 ${
                              answers[q.id] ? "bg-primary/10 hover:bg-primary/20" : ""
                            }`}
                            onClick={() => goToQuestion(index)}
                          >
                            {index + 1}
                          </Button>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="flagged" className="m-0">
                      <div className="grid grid-cols-5 gap-2">
                        {questions
                          .filter((q) => !answers[q.id])
                          .map((q, index) => {
                            const originalIndex = questions.findIndex((question) => question.id === q.id);
                            return (
                              <Button
                                key={q.id}
                                variant={originalIndex === currentQuestionIndex ? "default" : "outline"}
                                className="w-full h-10 p-0"
                                onClick={() => goToQuestion(originalIndex)}
                              >
                                {originalIndex + 1}
                              </Button>
                            );
                          })}
                      </div>
                      
                      {questions.filter((q) => !answers[q.id]).length === 0 && (
                        <p className="text-center py-4 text-sm text-muted-foreground">
                          All questions answered
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
                  
                  <Button 
                    className="w-full mt-4"
                    onClick={() => setShowSubmitDialog(true)}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Submit Exam
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      {/* Submit confirmation dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {timeEnded ? "Time's Up!" : "Submit Exam?"}
            </DialogTitle>
            <DialogDescription>
              {timeEnded 
                ? "Your exam time has ended. Your answers will now be submitted."
                : `You've answered ${answeredCount} out of ${questions.length} questions. Unanswered questions will be marked as incorrect.`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {timeEnded ? (
              <p className="text-center font-medium">
                Submitting your exam...
              </p>
            ) : (
              answeredCount < questions.length && (
                <div className="p-3 bg-warning/10 text-warning rounded-md text-sm">
                  <strong>Warning:</strong> You have {questions.length - answeredCount} unanswered questions.
                </div>
              )
            )}
          </div>
          
          <DialogFooter>
            {!timeEnded && (
              <Button
                variant="outline"
                onClick={() => setShowSubmitDialog(false)}
                disabled={isSubmitting}
              >
                Continue Exam
              </Button>
            )}
            
            <Button 
              onClick={handleSubmitExam}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Exam
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamPage;
