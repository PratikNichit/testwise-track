
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Settings, ChevronDown, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get only first initial for avatar
  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/dashboard') return 'Dashboard';
    if (path.includes('/exam/')) return 'Exam';
    if (path === '/results') return 'Results';
    if (path === '/admin') return 'Admin Dashboard';
    if (path === '/admin/exams') return 'Manage Exams';
    if (path === '/admin/exams/new') return 'Schedule Exam';
    if (path === '/admin/results') return 'Student Performance';
    
    return 'Exam Portal';
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? 'bg-background/80 backdrop-blur-md shadow-sm' : 'bg-background'
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold mr-2">
              EP
            </div>
            <span className="text-lg font-semibold hidden sm:block">Exam Portal</span>
          </Link>
        </div>

        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <h1 className="text-lg font-medium">{getPageTitle()}</h1>
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback>{getInitials(user.displayName || '')}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium hidden sm:block">{user.displayName || 'User'}</span>
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card absolute top-16 left-0 right-0 z-50 animate-fade-in">
          <div className="px-4 py-5 shadow-md bg-background/90 backdrop-blur-md">
            <h2 className="text-lg font-medium mb-4">{getPageTitle()}</h2>
            
            <div className="space-y-4">
              {user && (
                <div className="flex items-center space-x-3 mb-6">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback>{getInitials(user.displayName || '')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.displayName || 'User'}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start" onClick={() => {
                  navigate('/profile');
                  closeMobileMenu();
                }}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Button>
                
                <Button variant="ghost" className="w-full justify-start" onClick={() => {
                  navigate('/settings');
                  closeMobileMenu();
                }}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Button>
                
                <Button variant="ghost" className="w-full justify-start text-destructive" onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
