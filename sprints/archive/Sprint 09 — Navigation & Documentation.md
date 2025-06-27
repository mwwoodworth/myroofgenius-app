Sprint 09 — Navigation & Documentation
Objective
Implement a sophisticated, AI-enhanced navigation system with integrated documentation, contextual help, and intelligent search that makes every feature discoverable and accessible.
File Targets

components/layout/Navigation.tsx (update)
components/layout/CommandPalette.tsx (create)
components/docs/DocumentationHub.tsx (create)
components/layout/Breadcrumbs.tsx (create)
lib/navigation/search-engine.ts (create)
lib/docs/content-loader.ts (create)
app/api/search/route.ts (create)
types/navigation.ts (create)

Step-by-Step Instructions
1. Define Navigation Types
typescript// types/navigation.ts
export interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: {
    text: string;
    variant: 'new' | 'beta' | 'pro';
  };
  children?: NavItem[];
  requiredPermission?: string;
  keywords?: string[];
}

export interface SearchResult {
  id: string;
  type: 'page' | 'action' | 'doc' | 'setting';
  title: string;
  description?: string;
  path?: string;
  action?: () => void;
  icon?: React.ComponentType;
  relevance: number;
  category: string;
}

export interface DocSection {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  relatedLinks?: string[];
  lastUpdated: Date;
}

export interface UserNavigation {
  recentPages: string[];
  favorites: string[];
  customShortcuts: NavItem[];
}
2. Create Enhanced Navigation Component
tsx// components/layout/Navigation.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Calculator, Map, Package, Smartphone, Brain, 
  Settings, HelpCircle, Search, Menu, X, Command,
  Sparkles, Shield, TrendingUp
} from 'lucide-react';
import GlassPanel from '@/components/ui/GlassPanel';
import CommandPalette from './CommandPalette';
import { useAuth } from '@/hooks/useAuth';
import { NavItem } from '@/types/navigation';

const navigationItems: NavItem[] = [
  {
    id: 'home',
    label: 'Dashboard',
    href: '/',
    icon: Home,
    description: 'Overview and insights',
    keywords: ['home', 'dashboard', 'overview']
  },
  {
    id: 'estimator',
    label: 'AI Estimator',
    href: '/estimator',
    icon: Calculator,
    description: 'Intelligent cost analysis',
    badge: { text: 'AI', variant: 'new' },
    keywords: ['estimate', 'calculator', 'cost', 'pricing']
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: TrendingUp,
    children: [
      {
        id: 'active-projects',
        label: 'Active Projects',
        href: '/projects/active',
        description: 'Current work in progress'
      },
      {
        id: 'project-insights',
        label: 'Insights',
        href: '/projects/insights',
        description: 'Performance analytics',
        badge: { text: 'NEW', variant: 'new' }
      }
    ]
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    href: '/marketplace',
    icon: Package,
    description: 'Products & contractors',
    keywords: ['shop', 'buy', 'products', 'contractors']
  },
  {
    id: 'fieldapps',
    label: 'Field Apps',
    href: '/fieldapps',
    icon: Smartphone,
    description: 'Mobile tools',
    badge: { text: 'BETA', variant: 'beta' },
    keywords: ['mobile', 'field', 'inspection']
  },
  {
    id: 'ai-tools',
    label: 'AI Tools',
    icon: Brain,
    children: [
      {
        id: 'copilot',
        label: 'AI Copilot',
        href: '/ai/copilot',
        description: 'Your AI assistant'
      },
      {
        id: 'claude-tools',
        label: 'Claude Tools',
        href: '/ai/claude',
        description: 'Advanced AI analysis'
      }
    ]
  }
];

export default function Navigation() {
  const router = useRouter();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Global keyboard shortcut
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isActive = (item: NavItem): boolean => {
    if (item.href === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(item.href || '');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50">
        <GlassPanel className="m-4 p-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl hidden sm:inline">
                MyRoofGenius
              </span>
            </div>

            {/* Desktop Navigation */}
            {!isMobile && (
              <div className="flex items-center gap-1">
                {navigationItems.map((item) => (
                  <div key={item.id} className="relative">
                    {item.children ? (
                      <>
                        <button
                          onClick={() => setActiveDropdown(
                            activeDropdown === item.id ? null : item.id
                          )}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                            activeDropdown === item.id
                              ? 'bg-white/10 text-white'
                              : 'hover:bg-white/5'
                          }`}
                        >
                          {item.icon && <item.icon className="w-4 h-4" />}
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              item.badge.variant === 'new' ? 'bg-green-500/20 text-green-500' :
                              item.badge.variant === 'beta' ? 'bg-yellow-500/20 text-yellow-500' :
                              'bg-purple-500/20 text-purple-500'
                            }`}>
                              {item.badge.text}
                            </span>
                          )}
                        </button>

                        <AnimatePresence>
                          {activeDropdown === item.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-full left-0 mt-2 w-64"
                            >
                              <GlassPanel className="p-2">
                                {item.children.map((child) => (
                                  
                                    key={child.id}
                                    href={child.href}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      router.push(child.href!);
                                      setActiveDropdown(null);
                                    }}
                                    className="block px-4 py-3 rounded-lg hover:bg-white/5 transition-all"
                                  >
                                    <div className="font-medium">{child.label}</div>
                                    {child.description && (
                                      <div className="text-sm text-gray-400 mt-1">
                                        {child.description}
                                      </div>
                                    )}
                                    {child.badge && (
                                      <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${
                                        child.badge.variant === 'new' ? 'bg-green-500/20 text-green-500' :
                                        'bg-yellow-500/20 text-yellow-500'
                                      }`}>
                                        {child.badge.text}
                                      </span>
                                    )}
                                  </a>
                                ))}
                              </GlassPanel>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(item.href!);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          isActive(item)
                            ? 'bg-white/10 text-white'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        {item.icon && <item.icon className="w-4 h-4" />}
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            item.badge.variant === 'new' ? 'bg-green-500/20 text-green-500' :
                            item.badge.variant === 'beta' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-purple-500/20 text-purple-500'
                          }`}>
                            {item.badge.text}
                          </span>
                        )}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="glass-button px-3 py-2 rounded-lg flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Search</span>
                <kbd className="hidden sm:inline text-xs bg-white/10 px-2 py-0.5 rounded">
                  ⌘K
                </kbd>
              </button>

              <button className="glass-button p-2 rounded-lg">
                <HelpCircle className="w-5 h-5" />
              </button>

              {user && (
                <button className="glass-button p-2 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
                </button>
              )}

              {isMobile && (
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="glass-button p-2 rounded-lg"
                >
                  {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isMobile && isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="space-y-1">
                  {navigationItems.map((item) => (
                    <div key={item.id}>
                      {item.children ? (
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-400 px-4 py-2">
                            {item.label}
                          </div>
                          {item.children.map((child) => (
                            
                              key={child.id}
                              href={child.href}
                              onClick={(e) => {
                                e.preventDefault();
                                router.push(child.href!);
                                setIsOpen(false);
                              }}
                              className="block px-4 py-2 rounded-lg hover:bg-white/5"
                            >
                              {child.label}
                            </a>
                          ))}
                        </div>
                      ) : (
                        
                          href={item.href}
                          onClick={(e) => {
                            e.preventDefault();
                            router.push(item.href!);
                            setIsOpen(false);
                          }}
                          className={`block px-4 py-2 rounded-lg ${
                            isActive(item)
                              ? 'bg-white/10'
                              : 'hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {item.icon && <item.icon className="w-4 h-4" />}
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                item.badge.variant === 'new' ? 'bg-green-500/20 text-green-500' :
                                'bg-yellow-500/20 text-yellow-500'
                              }`}>
                                {item.badge.text}
                              </span>
                            )}
                          </div>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassPanel>
      </nav>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        navigationItems={navigationItems}
      />
    </>
  );
}
3. Create Command Palette Component
tsx// components/layout/CommandPalette.tsx
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Command, File, Settings, User } from 'lucide-react';
import { NavItem, SearchResult } from '@/types/navigation';
import { searchContent } from '@/lib/navigation/search-engine';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  navigationItems: NavItem[];
}

export default function CommandPalette({ 
  isOpen, 
  onClose, 
  navigationItems 
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => 
            prev < results.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => 
            prev > 0 ? prev - 1 : results.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            executeResult(results[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  useEffect(() => {
    const performSearch = async () => {
      if (query.length === 0) {
        // Show recent/suggested items
        setResults(getDefaultResults());
      } else {
        const searchResults = await searchContent(query);
        setResults(searchResults);
      }
      setSelectedIndex(0);
    };

    performSearch();
  }, [query]);

  const getDefaultResults = (): SearchResult[] => {
    return navigationItems.flatMap(item => {
      const baseResult: SearchResult = {
        id: item.id,
        type: 'page',
        title: item.label,
        description: item.description,
        path: item.href,
        icon: item.icon,
        relevance: 1,
        category: 'Navigation'
      };

      if (item.children) {
        return [
          baseResult,
          ...item.children.map(child => ({
            id: child.id,
            type: 'page' as const,
            title: child.label,
            description: child.description,
            path: child.href,
            relevance: 1,
            category: item.label
          }))
        ];
      }

      return [baseResult];
    });
  };

  const executeResult = (result: SearchResult) => {
    if (result.action) {
      result.action();
    } else if (result.path) {
      router.push(result.path);
    }
    onClose();
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'navigation':
        return <Command className="w-4 h-4" />;
      case 'documentation':
        return <File className="w-4 h-4" />;
      case 'settings':
        return <Settings className="w-4 h-4" />;
      case 'user':
        return <User className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50"
          >
            <div className="glass-panel mx-4 overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-white/10">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for pages, actions, or help..."
                  className="flex-1 bg-transparent outline-none text-lg placeholder-gray-400"
                />
                <kbd className="text-xs bg-white/10 px-2 py-1 rounded">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto">
                {results.length > 0 ? (
                  results.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => executeResult(result)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${
                        index === selectedIndex
                          ? 'bg-white/10'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5">
                        {result.icon ? (
                          <result.icon className="w-5 h-5" />
                        ) : (
                          getCategoryIcon(result.category)
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{result.title}</div>
                        {result.description && (
                          <div className="text-sm text-gray-400">
                            {result.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{result.category}</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-400">
                    No results found for "{query}"
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-3 border-t border-white/10 text-xs text-gray-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="bg-white/10 px-1.5 py-0.5 rounded">↑</kbd>
                    <kbd className="bg-white/10 px-1.5 py-0.5 rounded">↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="bg-white/10 px-1.5 py-0.5 rounded">↵</kbd>
                    Select
                  </span>
                </div>
                <span>AI-Powered Search</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
4. Create Search Engine
typescript// lib/navigation/search-engine.ts
import { SearchResult } from '@/types/navigation';
import Fuse from 'fuse.js';

interface SearchableItem {
  id: string;
  title: string;
  description?: string;
  content?: string;
  path?: string;
  category: string;
  keywords?: string[];
  action?: () => void;
}

// This would typically come from a database or CMS
const searchableContent: SearchableItem[] = [
  // Navigation items
  {
    id: 'nav-dashboard',
    title: 'Dashboard',
    description: 'Main overview and insights',
    path: '/',
    category: 'Navigation',
    keywords: ['home', 'overview', 'main']
  },
  {
    id: 'nav-estimator',
    title: 'AI Estimator',
    description: 'Create intelligent cost estimates',
    path: '/estimator',
    category: 'Navigation',
    keywords: ['estimate', 'cost', 'calculator', 'pricing', 'ai']
  },
  // Documentation
  {
    id: 'doc-getting-started',
    title: 'Getting Started Guide',
    description: 'Learn the basics of MyRoofGenius',
    path: '/docs/getting-started',
    category: 'Documentation',
    keywords: ['tutorial', 'beginner', 'start', 'guide']
  },
  {
    id: 'doc-api',
    title: 'API Reference',
    description: 'Complete API documentation',
    path: '/docs/api',
    category: 'Documentation',
    keywords: ['api', 'developer', 'integration', 'reference']
  },
  // Actions
  {
    id: 'action-create-project',
    title: 'Create New Project',
    description: 'Start a new roofing project',
    category: 'Action',
    keywords: ['new', 'create', 'project', 'start'],
    action: () => window.location.href = '/projects/new'
  },
  {
    id: 'action-invite-team',
    title: 'Invite Team Member',
    description: 'Add someone to your team',
    category: 'Action',
    keywords: ['invite', 'team', 'member', 'add', 'user'],
    action: () => window.location.href = '/settings/team'
  },
  // Settings
  {
    id: 'settings-profile',
    title: 'Profile Settings',
    description: 'Manage your profile information',
    path: '/settings/profile',
    category: 'Settings',
    keywords: ['profile', 'account', 'user', 'settings']
  },
  {
    id: 'settings-billing',
    title: 'Billing & Subscription',
    description: 'Manage your subscription and payment methods',
    path: '/settings/billing',
    category: 'Settings',
    keywords: ['billing', 'payment', 'subscription', 'invoice']
  }
];

const fuseOptions = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'description', weight: 0.3 },
    { name: 'keywords', weight: 0.2 },
    { name: 'content', weight: 0.1 }
  ],
  threshold: 0.3,
  includeScore: true
};

const fuse = new Fuse(searchableContent, fuseOptions);

export async function searchContent(query: string): Promise<SearchResult[]> {
  if (!query || query.length === 0) {
    return [];
  }

  // Perform fuzzy search
  const results = fuse.search(query);

  // Transform to SearchResult format
  return results.map(({ item, score = 0 }) => ({
    id: item.id,
    type: getResultType(item.category),
    title: item.title,
    description: item.description,
    path: item.path,
    action: item.action,
    relevance: 1 - score, // Fuse returns lower scores for better matches
    category: item.category
  }));
}

function getResultType(category: string): SearchResult['type'] {
  switch (category.toLowerCase()) {
    case 'navigation':
      return 'page';
    case 'action':
      return 'action';
    case 'documentation':
      return 'doc';
    case 'settings':
      return 'setting';
    default:
      return 'page';
  }
}

export async function addSearchableContent(items: SearchableItem[]) {
  searchableContent.push(...items);
  // Recreate Fuse instance with new content
  Object.assign(fuse, new Fuse(searchableContent, fuseOptions));
}

export async function searchWithAI(query: string): Promise<SearchResult[]> {
  // This could integrate with Claude or another AI for semantic search
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    // Fallback to regular search
    return searchContent(query);
  }

  return response.json();
}
Commit Message
feat(navigation): implemented AI-enhanced navigation with command palette, intelligent search, and documentation hub
QA/Acceptance Checklist

 Navigation is responsive and works on all screen sizes
 Command palette opens with Cmd/Ctrl+K
 Search returns relevant results instantly
 Dropdown menus animate smoothly
 Mobile menu functions correctly
 All navigation items are accessible
 Keyboard navigation works in command palette
 Recent/suggested items appear when search is empty

AI Execution Block
Codex/Operator Instructions:

Install required dependencies: npm install fuse.js
Update all page components to use new navigation
Test keyboard shortcuts on Mac and Windows
Verify mobile navigation on actual devices
Ensure all routes are properly configured
Test search with various queries
Deploy and verify navigation persists across page loads

Advanced/Optional Enhancements

Add personalized navigation based on user behavior
Implement voice-activated navigation
Create contextual shortcuts based on current page
Add navigation analytics to track usage patterns
Build onboarding tour for new users