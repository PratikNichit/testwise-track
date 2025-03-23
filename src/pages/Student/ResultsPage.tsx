
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import QuestionCard from '@/components/ui/QuestionCard';
import ResultCard from '@/components/ui/ResultCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { getResultByExamId, getExamQuestions, getStudentResults, ExamResult, Question } from '@/services/api';
import { ArrowLeft, Loader2, AlertCircle, Download, Share2 } from 'lucide-react';

const ResultsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const [result, setResult] = useState<ExamResult | null>(null);
  const [allResults, setAllResults] = useState<ExamResult[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchResultData = async () => {
      if (!id) {
        // If no ID, fetch all results
        try {
          setIsLoading(true);
          const resultsData = await getStudentResults();
          setAllResults(resultsData);
        } catch (error) {
          console.error('Error fetching results:', error);
        } finally {
          setIsLoading(false);
        }
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Fetch result and questions in parallel
        const [resultData, questionsData] = await Promise.all([
          getResultByExamId(id),
          getExamQuestions(id)
        ]);
        
        if (!resultData) {
          navigate('/results');
          return;
        }
        
        setResult(resultData);
        
        // Add correctOptionId from the result
        const questionsWithCorrectAnswers = questionsData.map(q => {
          const answer = resultData.answers.find(a => a.questionId === q.id);
          return {
            ...q,
            // Simulate having explanation for some questions
            explanation: Math.random() > 0.5 
              ? `This is an explanation for the correct answer. ${q.options.find(o => o.id === q.correctOptionId)?.text}.`
              : undefined
          };
        });
        
        setQuestions(questionsWithCorrectAnswers);
      } catch (error) {
        console.error('Error fetching result data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResultData();
  }, [id, navigate]);
  
  // Redirect if not logged in
  if (!loading && !user) {
    return <Navigate to="/login" />;
  }
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center pt-20 sm:ml-[70px] md:ml-[240px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-lg">Loading results...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Results list view (when no ID is provided)
  if (!id) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4 sm:p-6 pt-20 sm:ml-[70px] md:ml-[240px]">
            <div className="max-w-7xl mx-auto page-transition">
              <h1 className="text-2xl font-bold mb-6">My Results</h1>
              
              {allResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allResults.map(result => (
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
                  <CardContent className="py-10 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Results Found</h3>
                    <p className="text-muted-foreground mb-6">
                      You haven't completed any exams yet.
                    </p>
                    <Button onClick={() => navigate('/dashboard')}>View Available Exams</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  // Show error if result not found
  if (!result) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center p-4 pt-20 sm:ml-[70px] md:ml-[240px]">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6 text-center">
                <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Result Not Found</h2>
                <p className="text-muted-foreground mb-6">
                  The exam result you're looking for doesn't exist or you don't have access to it.
                </p>
                <Button onClick={() => navigate('/results')}>View All Results</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 pt-20 sm:ml-[70px] md:ml-[240px]">
          <div className="max-w-7xl mx-auto page-transition">
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/results')}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Results
              </Button>
              
              <h1 className="text-2xl font-bold">{result.examTitle} - Exam Results</h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="md:col-span-1">
                <ResultCard
                  id={result.examId}
                  examTitle={result.examTitle}
                  examDate={result.examDate}
                  duration={result.duration}
                  score={result.score}
                  totalScore={result.totalScore}
                  correctAnswers={result.correctAnswers}
                  totalQuestions={result.totalQuestions}
                  detailed={true}
                />
                
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <Card>
                  <CardContent className="p-4 md:p-6">
                    <Tabs defaultValue="all">
                      <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="all">All Questions</TabsTrigger>
                        <TabsTrigger value="correct">Correct</TabsTrigger>
                        <TabsTrigger value="incorrect">Incorrect</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="all" className="m-0 space-y-6">
                        {questions.map((question, index) => {
                          const answer = result.answers.find(a => a.questionId === question.id);
                          return (
                            <QuestionCard
                              key={question.id}
                              id={question.id}
                              questionNumber={index + 1}
                              questionText={question.text}
                              options={question.options}
                              selectedOption={answer?.selectedOptionId || null}
                              onChange={() => {}}
                              isReview={true}
                              correctOption={question.correctOptionId}
                              explanation={question.explanation}
                            />
                          );
                        })}
                      </TabsContent>
                      
                      <TabsContent value="correct" className="m-0 space-y-6">
                        {questions
                          .filter(q => {
                            const answer = result.answers.find(a => a.questionId === q.id);
                            return answer?.isCorrect;
                          })
                          .map((question, index) => {
                            const answer = result.answers.find(a => a.questionId === question.id);
                            return (
                              <QuestionCard
                                key={question.id}
                                id={question.id}
                                questionNumber={index + 1}
                                questionText={question.text}
                                options={question.options}
                                selectedOption={answer?.selectedOptionId || null}
                                onChange={() => {}}
                                isReview={true}
                                correctOption={question.correctOptionId}
                                explanation={question.explanation}
                              />
                            );
                          })}
                          
                        {questions.filter(q => {
                          const answer = result.answers.find(a => a.questionId === q.id);
                          return answer?.isCorrect;
                        }).length === 0 && (
                          <p className="text-center py-10 text-muted-foreground">
                            No correct answers found
                          </p>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="incorrect" className="m-0 space-y-6">
                        {questions
                          .filter(q => {
                            const answer = result.answers.find(a => a.questionId === q.id);
                            return !answer?.isCorrect;
                          })
                          .map((question, index) => {
                            const answer = result.answers.find(a => a.questionId === question.id);
                            return (
                              <QuestionCard
                                key={question.id}
                                id={question.id}
                                questionNumber={index + 1}
                                questionText={question.text}
                                options={question.options}
                                selectedOption={answer?.selectedOptionId || null}
                                onChange={() => {}}
                                isReview={true}
                                correctOption={question.correctOptionId}
                                explanation={question.explanation}
                              />
                            );
                          })}
                          
                        {questions.filter(q => {
                          const answer = result.answers.find(a => a.questionId === q.id);
                          return !answer?.isCorrect;
                        }).length === 0 && (
                          <p className="text-center py-10 text-muted-foreground">
                            No incorrect answers found
                          </p>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResultsPage;
