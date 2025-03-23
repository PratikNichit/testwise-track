import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Auth pages
import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";

// Student pages
import Dashboard from "@/pages/Student/Dashboard";
import ExamPage from "@/pages/Student/ExamPage";
import ResultsPage from "@/pages/Student/ResultsPage";

// Admin pages
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import ManageExams from "@/pages/Admin/ManageExams";
import ScheduleExam from "@/pages/Admin/ScheduleExam";
import StudentPerformance from "@/pages/Admin/StudentPerformance";

// Other pages
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/exams" element={<Dashboard />} />
            <Route path="/exam/:id" element={<ExamPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/results/:id" element={<ResultsPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/exams" element={<ManageExams />} />
            <Route path="/admin/exams/new" element={<ScheduleExam />} />
            <Route path="/admin/results" element={<StudentPerformance />} />

            {/* Catch-all Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
