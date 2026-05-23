import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";


import Index from "./pages/Index";
import About from "./pages/About";
import Rooms from "./pages/Rooms";
import Facilities from "./pages/Facilities";
import Rules from "./pages/Rules";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Booking from "./pages/Booking";
import StudentLogin from "./pages/StudentLogin";
import WardenLogin from "./pages/WardenLogin";
import StudentDashboard from "./pages/StudentDashboard";
import WardenDashboard from "./pages/WardenDashboard";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const NO_FOOTER_ROUTES = ["/student-dashboard", "/warden-dashboard"];

const AppContent = () => {
  return (
    <BrowserRouter>
      
      <Navbar />
      <Routes>
        <Route path="/" element={<><Index /><Footer /></>} />
        <Route path="/about" element={<><About /><Footer /></>} />
        <Route path="/rooms" element={<><Rooms /><Footer /></>} />
        <Route path="/facilities" element={<><Facilities /><Footer /></>} />
        <Route path="/rules" element={<><Rules /><Footer /></>} />
        <Route path="/gallery" element={<><Gallery /><Footer /></>} />
        <Route path="/contact" element={<><Contact /><Footer /></>} />
        <Route path="/booking" element={<><Booking /><Footer /></>} />
        <Route path="/login" element={<StudentLogin />} />
        <Route path="/warden-login" element={<WardenLogin />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/warden-dashboard" element={<WardenDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
