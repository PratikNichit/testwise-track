
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  ClipboardList, 
  CalendarRange, 
  BarChart,
  ChevronRight,
  ChevronLeft,
  Home,
  PanelLeft,
  BookOpen
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  isAdmin?: boolean;
}

const Sidebar = ({ isAdmin = false }: SidebarProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  
  useEffect(() => {
    // When on mobile, sidebar should be collapsed by default
    setCollapsed(isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  
  // Generate link items based on user role
  const navItems = isAdmin 
    ? [
        { 
          path: '/admin', 
          name: 'Dashboard', 
          icon: <LayoutDashboard size={20} />
        },
        { 
          path: '/admin/exams', 
          name: 'Manage Exams', 
          icon: <ClipboardList size={20} />
        },
        { 
          path: '/admin/exams/new', 
          name: 'Schedule Exam', 
          icon: <CalendarRange size={20} />
        },
        { 
          path: '/admin/results', 
          name: 'Performance', 
          icon: <BarChart size={20} />
        }
      ]
    : [
        { 
          path: '/dashboard', 
          name: 'Dashboard', 
          icon: <Home size={20} />
        },
        { 
          path: '/exams', 
          name: 'My Exams', 
          icon: <BookOpen size={20} />
        },
        { 
          path: '/results', 
          name: 'Results', 
          icon: <BarChart size={20} />
        }
      ];
  
  return (
    <aside 
      className={cn(
        "h-screen fixed top-0 left-0 z-40 pt-16 transition-all duration-300 flex flex-col border-r",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <div className="flex-1 overflow-y-auto py-4 px-3 scrollbar-hide">
        <div className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center py-2 px-3 rounded-md transition-colors",
                "hover:bg-primary/10 group",
                location.pathname === item.path
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground/80"
              )}
            >
              <span className="mr-3">{item.icon}</span>
              <span className={cn(
                "transition-opacity", 
                collapsed ? "opacity-0 invisible w-0" : "opacity-100 visible"
              )}>
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Collapse/Expand Toggle */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full flex items-center justify-center"
          onClick={toggleSidebar}
        >
          {collapsed ? (
            <>
              <PanelLeft size={18} />
              <span className="sr-only">Expand</span>
            </>
          ) : (
            <>
              <ChevronLeft size={18} />
              <span className="ml-2">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
