
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Award, Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface ResultCardProps {
  id: string;
  examTitle: string;
  examDate: Date | string;
  duration: number; // in minutes
  score: number;
  totalScore: number;
  correctAnswers: number;
  totalQuestions: number;
  detailed?: boolean;
}

const ResultCard = ({
  id,
  examTitle,
  examDate,
  duration,
  score,
  totalScore,
  correctAnswers,
  totalQuestions,
  detailed = false,
}: ResultCardProps) => {
  const navigate = useNavigate();
  
  // Convert string date to Date if needed
  const date = typeof examDate === 'string' ? new Date(examDate) : examDate;
  
  // Calculate percentage
  const percentage = Math.round((score / totalScore) * 100);
  
  // Determine badge color based on percentage
  const getBadgeColor = () => {
    if (percentage >= 80) return 'bg-success/10 text-success';
    if (percentage >= 60) return 'bg-info/10 text-info';
    if (percentage >= 40) return 'bg-warning/10 text-warning';
    return 'bg-destructive/10 text-destructive';
  };
  
  // Determine grade
  const getGrade = () => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const handleViewDetails = () => {
    navigate(`/results/${id}`);
  };

  return (
    <Card className={`w-full transition-all duration-300 hover:shadow-md ${detailed ? 'shadow-md' : 'shadow-sm'}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg md:text-xl">{examTitle}</CardTitle>
          <Badge className={`${getBadgeColor()} font-semibold text-sm px-2`}>
            {getGrade()}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2">
          <Calendar size={14} />
          <span>{format(date, 'PPP')}</span>
          <span className="text-muted-foreground">•</span>
          <Clock size={14} />
          <span>{duration} min</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Score</span>
            <span className="text-sm font-medium">{score}/{totalScore} ({percentage}%)</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-success/10">
            <div className="flex items-center gap-1.5 text-success mb-1">
              <CheckCircle2 size={16} />
              <span className="font-medium">Correct</span>
            </div>
            <span className="text-lg font-bold">{correctAnswers}</span>
          </div>
          
          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-destructive/10">
            <div className="flex items-center gap-1.5 text-destructive mb-1">
              <XCircle size={16} />
              <span className="font-medium">Incorrect</span>
            </div>
            <span className="text-lg font-bold">{totalQuestions - correctAnswers}</span>
          </div>
        </div>
        
        {detailed && (
          <>
            <Separator />
            <div className="pt-2">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Award size={18} />
                Performance Analysis
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Accuracy</span>
                    <span>{Math.round((correctAnswers / totalQuestions) * 100)}%</span>
                  </div>
                  <Progress value={(correctAnswers / totalQuestions) * 100} className="h-1.5" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Completion</span>
                    <span>100%</span>
                  </div>
                  <Progress value={100} className="h-1.5" />
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      {!detailed && (
        <CardFooter>
          <Button onClick={handleViewDetails} className="w-full">
            View Details
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ResultCard;
