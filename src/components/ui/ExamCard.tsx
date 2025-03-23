
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarClock, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { formatDistanceToNow, format, isPast, isFuture } from 'date-fns';

interface ExamCardProps {
  id: string;
  title: string;
  subject: string;
  scheduledDate: Date | string;
  duration: number; // in minutes
  questionsCount: number;
  status?: 'upcoming' | 'ongoing' | 'completed';
  score?: number;
  maxScore?: number;
  onClick?: () => void;
  loading?: boolean;
  admin?: boolean;
}

const ExamCard = ({
  id,
  title,
  subject,
  scheduledDate,
  duration,
  questionsCount,
  status = 'upcoming',
  score,
  maxScore,
  onClick,
  loading = false,
  admin = false,
}: ExamCardProps) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
  if (loading) {
    return (
      <Card className="w-full transition-transform duration-300 shadow-sm">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-9 w-full" />
        </CardFooter>
      </Card>
    );
  }

  // Convert string date to Date object if needed
  const examDate = typeof scheduledDate === 'string' ? new Date(scheduledDate) : scheduledDate;
  
  // Get relevant date display
  const getDateDisplay = () => {
    if (isPast(examDate) && status !== 'ongoing') {
      return `Conducted on ${format(examDate, 'PPP')}`;
    } else if (isFuture(examDate)) {
      return `Scheduled in ${formatDistanceToNow(examDate, { addSuffix: false })}`;
    } else {
      return `Available now`;
    }
  };

  // Get status badge color
  const getStatusColor = () => {
    if (status === 'upcoming') return 'bg-info/10 text-info hover:bg-info/20';
    if (status === 'ongoing') return 'bg-warning/10 text-warning hover:bg-warning/20';
    return 'bg-success/10 text-success hover:bg-success/20';
  };

  // Handle button click
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (admin) {
      navigate(`/admin/exams/${id}`);
    } else if (status === 'completed') {
      navigate(`/results/${id}`);
    } else {
      navigate(`/exam/${id}`);
    }
  };

  return (
    <Card 
      className={`w-full transition-all duration-300 ${isHovered ? 'translate-y-[-4px] shadow-md' : 'shadow-sm'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg md:text-xl text-balance">{title}</CardTitle>
          <Badge variant="outline" className={`${getStatusColor()} capitalize`}>
            {status}
          </Badge>
        </div>
        <CardDescription>{subject}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-muted-foreground mb-2">
          <div className="flex items-center">
            <CalendarClock size={16} className="mr-1.5" />
            <span>{getDateDisplay()}</span>
          </div>
          <div className="flex items-center">
            <Clock size={16} className="mr-1.5" />
            <span>{duration} min</span>
          </div>
          <div className="flex items-center">
            <BookOpen size={16} className="mr-1.5" />
            <span>{questionsCount} questions</span>
          </div>
        </div>
        
        {status === 'completed' && score !== undefined && maxScore !== undefined && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-medium">Score</span>
              <span className="text-sm font-medium">{score}/{maxScore}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${(score / maxScore) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full gap-2 mt-1"
          onClick={handleClick}
          disabled={admin ? false : (status === 'upcoming' && isFuture(examDate))}
        >
          {admin ? 'Manage' : status === 'completed' ? 'View Results' : 'Start Exam'}
          <ArrowRight size={16} className={`transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExamCard;
