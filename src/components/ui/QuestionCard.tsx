
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Option {
  id: string;
  text: string;
}

interface QuestionCardProps {
  id: string;
  questionNumber: number;
  questionText: string;
  options: Option[];
  selectedOption: string | null;
  onChange: (optionId: string) => void;
  isReview?: boolean;
  correctOption?: string;
  explanation?: string;
}

const QuestionCard = ({
  id,
  questionNumber,
  questionText,
  options,
  selectedOption,
  onChange,
  isReview = false,
  correctOption,
  explanation,
}: QuestionCardProps) => {
  const [isHovering, setIsHovering] = useState(false);

  const handleOptionChange = (optionId: string) => {
    if (!isReview) {
      onChange(optionId);
    }
  };

  const getOptionClass = (optionId: string) => {
    if (!isReview) return '';
    
    if (optionId === correctOption) {
      return 'border-success/30 bg-success/5';
    } 
    
    if (optionId === selectedOption && optionId !== correctOption) {
      return 'border-destructive/30 bg-destructive/5';
    }
    
    return '';
  };

  return (
    <Card 
      className={cn(
        "w-full transition-all duration-300 overflow-hidden", 
        isHovering && !isReview ? "shadow-md" : "shadow-sm"
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <CardContent className="p-5 md:p-6">
        <div className="mb-5">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm mb-3">
            {questionNumber}
          </span>
          <h3 className="text-lg font-medium mb-1">{questionText}</h3>
        </div>

        <RadioGroup
          value={selectedOption || ''}
          onValueChange={handleOptionChange}
          className="space-y-3"
        >
          {options.map((option) => (
            <div
              key={option.id}
              className={cn(
                "flex items-center space-x-3 rounded-md border p-4 transition-all",
                "hover:border-primary/50 hover:bg-primary/5",
                getOptionClass(option.id),
                selectedOption === option.id && !isReview ? "border-primary/50 bg-primary/5" : ""
              )}
            >
              <RadioGroupItem 
                value={option.id} 
                id={`${id}-${option.id}`} 
                disabled={isReview} 
                className="data-[state=checked]:border-primary data-[state=checked]:text-primary"
              />
              <Label
                htmlFor={`${id}-${option.id}`}
                className="flex-1 text-base cursor-pointer"
              >
                {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {isReview && explanation && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <h4 className="font-medium mb-1 text-sm">Explanation:</h4>
            <p className="text-muted-foreground text-sm">{explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
