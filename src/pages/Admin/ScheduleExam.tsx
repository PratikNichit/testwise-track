
import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { createExam } from '@/services/api';
import { 
  CalendarClock, 
  Clock, 
  BookOpen, 
  Loader2, 
  Check, 
  Save,
  PlusCircle
} from 'lucide-react';

const ScheduleExam = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    scheduledDate: '',
    scheduledTime: '09:00',
    duration: 60,
    questionsCount: 30,
    description: '',
    instructions: ''
  });
  
  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle slider change
  const handleSliderChange = (name: string, value: number[]) => {
    setFormData(prev => ({ ...prev, [name]: value[0] }));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Date is required';
    }
    
    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    // Only validate when moving from details to questions
    if (activeTab === 'details' && value === 'questions') {
      const isValid = validateForm();
      if (!isValid) return;
    }
    
    setActiveTab(value);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = validateForm();
    if (!isValid) return;
    
    try {
      setIsSubmitting(true);
      
      // Combine date and time
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      
      // Create exam
      await createExam({
        title: formData.title,
        subject: formData.subject,
        scheduledDate: scheduledDateTime.toISOString(),
        duration: formData.duration,
        questionsCount: formData.questionsCount
      });
      
      // Show success state
      setSubmitSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/admin/exams');
      }, 1500);
    } catch (error) {
      console.error('Error creating exam:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get tomorrow's date in YYYY-MM-DD format for min date value
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const formattedTomorrow = tomorrowDate.toISOString().split('T')[0];
  
  // Redirect if not logged in
  if (!loading && !user) {
    return <Navigate to="/login" />;
  }
  
  // Redirect if not admin
  if (!loading && user && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar isAdmin={true} />
        <main className="flex-1 p-4 sm:p-6 pt-20 sm:ml-[70px] md:ml-[240px]">
          <div className="max-w-5xl mx-auto page-transition">
            <h1 className="text-2xl font-bold mb-2">Schedule New Exam</h1>
            <p className="text-muted-foreground mb-6">Create and configure a new exam for students</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs 
                value={activeTab} 
                onValueChange={handleTabChange}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="details">Exam Details</TabsTrigger>
                  <TabsTrigger value="questions">Questions & Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details">
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                      <CardDescription>
                        Enter the details for the new exam
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="title">Exam Title</Label>
                          <Input
                            id="title"
                            name="title"
                            placeholder="e.g. Introduction to Computer Science"
                            value={formData.title}
                            onChange={handleChange}
                            className={errors.title ? 'border-destructive' : ''}
                          />
                          {errors.title && (
                            <p className="text-destructive text-sm">{errors.title}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="subject">Subject</Label>
                          <Input
                            id="subject"
                            name="subject"
                            placeholder="e.g. Computer Science"
                            value={formData.subject}
                            onChange={handleChange}
                            className={errors.subject ? 'border-destructive' : ''}
                          />
                          {errors.subject && (
                            <p className="text-destructive text-sm">{errors.subject}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="scheduledDate">Exam Date</Label>
                          <Input
                            id="scheduledDate"
                            name="scheduledDate"
                            type="date"
                            min={formattedTomorrow}
                            value={formData.scheduledDate}
                            onChange={handleChange}
                            className={errors.scheduledDate ? 'border-destructive' : ''}
                          />
                          {errors.scheduledDate && (
                            <p className="text-destructive text-sm">{errors.scheduledDate}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="scheduledTime">Exam Time</Label>
                          <Input
                            id="scheduledTime"
                            name="scheduledTime"
                            type="time"
                            value={formData.scheduledTime}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <Label>Description (Optional)</Label>
                        <Textarea
                          name="description"
                          placeholder="Brief description of the exam"
                          value={formData.description}
                          onChange={handleChange}
                          rows={3}
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/admin/exams')}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="button"
                        onClick={() => handleTabChange('questions')}
                      >
                        Next
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="questions">
                  <Card>
                    <CardHeader>
                      <CardTitle>Exam Configuration</CardTitle>
                      <CardDescription>
                        Configure questions and settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <span className="text-sm font-medium">{formData.duration} min</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <Slider
                              id="duration"
                              min={15}
                              max={180}
                              step={15}
                              value={[formData.duration]}
                              onValueChange={(value) => handleSliderChange('duration', value)}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="questionsCount">Number of Questions</Label>
                            <span className="text-sm font-medium">{formData.questionsCount} questions</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <BookOpen className="h-5 w-5 text-muted-foreground" />
                            <Slider
                              id="questionsCount"
                              min={5}
                              max={100}
                              step={5}
                              value={[formData.questionsCount]}
                              onValueChange={(value) => handleSliderChange('questionsCount', value)}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <Label>Instructions for Students (Optional)</Label>
                        <Textarea
                          name="instructions"
                          placeholder="Instructions to be shown to students before the exam begins"
                          value={formData.instructions}
                          onChange={handleChange}
                          rows={4}
                        />
                      </div>
                      
                      <div className="bg-muted p-4 rounded-md">
                        <h3 className="font-medium mb-2">Exam Summary</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Title:</span>
                            <span className="font-medium">{formData.title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subject:</span>
                            <span className="font-medium">{formData.subject}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Date:</span>
                            <span className="font-medium">{formData.scheduledDate ? new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toLocaleString() : 'Not set'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="font-medium">{formData.duration} minutes</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Questions:</span>
                            <span className="font-medium">{formData.questionsCount}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => handleTabChange('details')}
                      >
                        Back
                      </Button>
                      <Button 
                        type="submit"
                        disabled={isSubmitting || submitSuccess}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : submitSuccess ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Created!
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Create Exam
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ScheduleExam;
