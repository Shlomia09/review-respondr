import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  MessageSquare,
  Bot,
  TrendingUp,
  Share2,
  Plug,
  Users,
  Settings,
  HelpCircle,
  Home
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { useTranslation } from "@/hooks/useTranslation";

const navigationItems = [
  { 
    title: "dashboard.title", 
    url: "/dashboard", 
    icon: Home,
    isMain: true
  },
  { 
    title: "sidebar.reviews", 
    url: "/reviews", 
    icon: MessageSquare 
  },
  { 
    title: "sidebar.aiResponses", 
    url: "/ai-responses", 
    icon: Bot 
  },
  { 
    title: "sidebar.analytics", 
    url: "/analytics", 
    icon: BarChart3 
  },
  { 
    title: "sidebar.socialHub", 
    url: "/social-hub", 
    icon: Share2 
  },
  { 
    title: "sidebar.integrations", 
    url: "/integrations", 
    icon: Plug 
  },
  { 
    title: "sidebar.customers", 
    url: "/customers", 
    icon: Users 
  },
  { 
    title: "sidebar.settings", 
    url: "/settings", 
    icon: Settings 
  },
  { 
    title: "sidebar.support", 
    url: "/support", 
    icon: HelpCircle 
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { t, language } = useTranslation();
  
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === '/dashboard' || currentPath === '/';
    }
    return currentPath === path;
  };

  const getNavClassName = (path: string) => {
    const baseClasses = "w-full justify-start transition-colors";
    const activeClasses = "bg-primary text-primary-foreground hover:bg-primary/90";
    const inactiveClasses = "hover:bg-accent hover:text-accent-foreground";
    
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`;
  };

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} border-r`}
    >
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={`${collapsed ? "sr-only" : ""} px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider`}>
            {t("sidebar.navigation")}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName(item.url)}
                      title={collapsed ? t(item.title) : undefined}
                    >
                      <item.icon className={`${collapsed ? "mx-auto" : "mr-3"} h-4 w-4 flex-shrink-0`} />
                      {!collapsed && (
                        <span className="truncate" dir={language === 'he' || language === 'ar' ? 'rtl' : 'ltr'}>
                          {t(item.title)}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}