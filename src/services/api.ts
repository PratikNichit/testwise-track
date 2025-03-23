
import { toast } from 'sonner';

// Define exam interface
export interface Exam {
  id: string;
  title: string;
  subject: string;
  scheduledDate: string;
  duration: number; // in minutes
  questionsCount: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  score?: number;
  maxScore?: number;
}

// Define question interface
export interface Question {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId?: string;
  explanation?: string;
}

// Define result interface
export interface ExamResult {
  id: string;
  examId: string;
  examTitle: string;
  examDate: string;
  duration: number;
  score: number;
  totalScore: number;
  correctAnswers: number;
  totalQuestions: number;
  answers: {
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
  }[];
}

// Generate a random delay between 500-1500ms for API calls to simulate network latency
const randomDelay = () => Math.floor(Math.random() * 1000) + 500;

// Mock exams data
const mockExams: Exam[] = [
  {
    id: '1',
    title: 'Introduction to Computer Science',
    subject: 'Computer Science',
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    duration: 60,
    questionsCount: 30,
    status: 'upcoming'
  },
  {
    id: '2',
    title: 'Advanced Mathematics',
    subject: 'Mathematics',
    scheduledDate: new Date().toISOString(), // Today
    duration: 90,
    questionsCount: 40,
    status: 'ongoing'
  },
  {
    id: '3',
    title: 'English Literature',
    subject: 'English',
    scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    duration: 45,
    questionsCount: 25,
    status: 'completed',
    score: 78,
    maxScore: 100
  },
  {
    id: '4',
    title: 'Basic Physics',
    subject: 'Physics',
    scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    duration: 60,
    questionsCount: 30,
    status: 'completed',
    score: 85,
    maxScore: 100
  }
];

// Mock questions data
const mockQuestions: Record<string, Question[]> = {
  '1': Array.from({ length: 30 }, (_, i) => ({
    id: `q${i+1}`,
    text: `Sample question ${i+1} for Introduction to Computer Science exam?`,
    options: [
      { id: `q${i+1}a`, text: `Option A for question ${i+1}` },
      { id: `q${i+1}b`, text: `Option B for question ${i+1}` },
      { id: `q${i+1}c`, text: `Option C for question ${i+1}` },
      { id: `q${i+1}d`, text: `Option D for question ${i+1}` }
    ],
    correctOptionId: `q${i+1}${['a', 'b', 'c', 'd'][Math.floor(Math.random() * 4)]}`
  })),
  '2': Array.from({ length: 40 }, (_, i) => ({
    id: `q${i+1}`,
    text: `Sample question ${i+1} for Advanced Mathematics exam?`,
    options: [
      { id: `q${i+1}a`, text: `Option A for question ${i+1}` },
      { id: `q${i+1}b`, text: `Option B for question ${i+1}` },
      { id: `q${i+1}c`, text: `Option C for question ${i+1}` },
      { id: `q${i+1}d`, text: `Option D for question ${i+1}` }
    ],
    correctOptionId: `q${i+1}${['a', 'b', 'c', 'd'][Math.floor(Math.random() * 4)]}`
  }))
};

// Mock results data
const mockResults: ExamResult[] = [
  {
    id: 'r1',
    examId: '3',
    examTitle: 'English Literature',
    examDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 45,
    score: 78,
    totalScore: 100,
    correctAnswers: 19,
    totalQuestions: 25,
    answers: Array.from({ length: 25 }, (_, i) => ({
      questionId: `q${i+1}`,
      selectedOptionId: `q${i+1}${['a', 'b', 'c', 'd'][Math.floor(Math.random() * 4)]}`,
      isCorrect: Math.random() > 0.25
    }))
  },
  {
    id: 'r2',
    examId: '4',
    examTitle: 'Basic Physics',
    examDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 60,
    score: 85,
    totalScore: 100,
    correctAnswers: 26,
    totalQuestions: 30,
    answers: Array.from({ length: 30 }, (_, i) => ({
      questionId: `q${i+1}`,
      selectedOptionId: `q${i+1}${['a', 'b', 'c', 'd'][Math.floor(Math.random() * 4)]}`,
      isCorrect: Math.random() > 0.15
    }))
  }
];

// API functions for Student

// Get all exams for the current student
export const getStudentExams = async (): Promise<Exam[]> => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, randomDelay()));
    
    return mockExams;
  } catch (error) {
    console.error('Error fetching exams:', error);
    toast.error('Failed to load exams');
    throw error;
  }
};

// Get a specific exam by ID
export const getExamById = async (examId: string): Promise<Exam | null> => {
  try {
    await new Promise(resolve => setTimeout(resolve, randomDelay()));
    
    const exam = mockExams.find(e => e.id === examId);
    if (!exam) {
      toast.error('Exam not found');
      return null;
    }
    
    return exam;
  } catch (error) {
    console.error('Error fetching exam:', error);
    toast.error('Failed to load exam');
    throw error;
  }
};

// Get questions for a specific exam
export const getExamQuestions = async (examId: string): Promise<Question[]> => {
  try {
    await new Promise(resolve => setTimeout(resolve, randomDelay()));
    
    if (!mockQuestions[examId]) {
      // If we don't have questions for this exam, generate some
      mockQuestions[examId] = Array.from({ length: 30 }, (_, i) => ({
        id: `q${i+1}`,
        text: `Sample question ${i+1} for exam ${examId}?`,
        options: [
          { id: `q${i+1}a`, text: `Option A for question ${i+1}` },
          { id: `q${i+1}b`, text: `Option B for question ${i+1}` },
          { id: `q${i+1}c`, text: `Option C for question ${i+1}` },
          { id: `q${i+1}d`, text: `Option D for question ${i+1}` }
        ],
        correctOptionId: `q${i+1}${['a', 'b', 'c', 'd'][Math.floor(Math.random() * 4)]}`
      }));
    }
    
    return mockQuestions[examId];
  } catch (error) {
    console.error('Error fetching exam questions:', error);
    toast.error('Failed to load exam questions');
    throw error;
  }
};

// Submit exam answers
export const submitExam = async (
  examId: string, 
  answers: Record<string, string>
): Promise<ExamResult> => {
  try {
    await new Promise(resolve => setTimeout(resolve, randomDelay()));
    
    // Get questions to calculate score
    const questions = mockQuestions[examId] || [];
    
    // Calculate score
    let correctCount = 0;
    const answerDetails = Object.entries(answers).map(([questionId, selectedOptionId]) => {
      const question = questions.find(q => q.id === questionId);
      const isCorrect = question?.correctOptionId === selectedOptionId;
      
      if (isCorrect) correctCount++;
      
      return {
        questionId,
        selectedOptionId,
        isCorrect
      };
    });
    
    // Calculate score as a percentage
    const score = Math.round((correctCount / questions.length) * 100);
    
    // Find exam details
    const exam = mockExams.find(e => e.id === examId);
    
    // Create result
    const result: ExamResult = {
      id: `r${Date.now()}`,
      examId,
      examTitle: exam?.title || 'Unknown Exam',
      examDate: exam?.scheduledDate || new Date().toISOString(),
      duration: exam?.duration || 60,
      score,
      totalScore: 100,
      correctAnswers: correctCount,
      totalQuestions: questions.length,
      answers: answerDetails
    };
    
    // Update exam status to completed
    const examIndex = mockExams.findIndex(e => e.id === examId);
    if (examIndex !== -1) {
      mockExams[examIndex] = {
        ...mockExams[examIndex],
        status: 'completed',
        score,
        maxScore: 100
      };
    }
    
    // Add to results
    mockResults.push(result);
    
    toast.success('Exam submitted successfully!');
    
    return result;
  } catch (error) {
    console.error('Error submitting exam:', error);
    toast.error('Failed to submit exam');
    throw error;
  }
};

// Get exam results
export const getStudentResults = async (): Promise<ExamResult[]> => {
  try {
    await new Promise(resolve => setTimeout(resolve, randomDelay()));
    
    return mockResults;
  } catch (error) {
    console.error('Error fetching results:', error);
    toast.error('Failed to load results');
    throw error;
  }
};

// Get a specific result by exam ID
export const getResultByExamId = async (examId: string): Promise<ExamResult | null> => {
  try {
    await new Promise(resolve => setTimeout(resolve, randomDelay()));
    
    const result = mockResults.find(r => r.examId === examId);
    if (!result) {
      toast.error('Result not found');
      return null;
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching result:', error);
    toast.error('Failed to load result');
    throw error;
  }
};

// API functions for Admin

// Get all exams (admin view)
export const getAllExams = async (): Promise<Exam[]> => {
  try {
    await new Promise(resolve => setTimeout(resolve, randomDelay()));
    
    return mockExams;
  } catch (error) {
    console.error('Error fetching all exams:', error);
    toast.error('Failed to load exams');
    throw error;
  }
};

// Create a new exam
export const createExam = async (examData: Omit<Exam, 'id' | 'status'>): Promise<Exam> => {
  try {
    await new Promise(resolve => setTimeout(resolve, randomDelay()));
    
    // Generate a new ID
    const newId = `${mockExams.length + 1}`;
    
    // Create new exam
    const newExam: Exam = {
      id: newId,
      ...examData,
      status: 'upcoming'
    };
    
    // Add to mock data
    mockExams.push(newExam);
    
    toast.success('Exam created successfully!');
    
    return newExam;
  } catch (error) {
    console.error('Error creating exam:', error);
    toast.error('Failed to create exam');
    throw error;
  }
};

// Update an existing exam
export const updateExam = async (examId: string, examData: Partial<Exam>): Promise<Exam> => {
  try {
    await new Promise(resolve => setTimeout(resolve, randomDelay()));
    
    const examIndex = mockExams.findIndex(e => e.id === examId);
    if (examIndex === -1) {
      throw new Error('Exam not found');
    }
    
    // Update exam
    mockExams[examIndex] = {
      ...mockExams[examIndex],
      ...examData
    };
    
    toast.success('Exam updated successfully!');
    
    return mockExams[examIndex];
  } catch (error) {
    console.error('Error updating exam:', error);
    toast.error('Failed to update exam');
    throw error;
  }
};

// Delete an exam
export const deleteExam = async (examId: string): Promise<void> => {
  try {
    await new Promise(resolve => setTimeout(resolve, randomDelay()));
    
    const examIndex = mockExams.findIndex(e => e.id === examId);
    if (examIndex === -1) {
      throw new Error('Exam not found');
    }
    
    // Remove exam
    mockExams.splice(examIndex, 1);
    
    toast.success('Exam deleted successfully!');
  } catch (error) {
    console.error('Error deleting exam:', error);
    toast.error('Failed to delete exam');
    throw error;
  }
};

// Get all student results
export const getAllResults = async (): Promise<ExamResult[]> => {
  try {
    await new Promise(resolve => setTimeout(resolve, randomDelay()));
    
    return mockResults;
  } catch (error) {
    console.error('Error fetching all results:', error);
    toast.error('Failed to load results');
    throw error;
  }
};
