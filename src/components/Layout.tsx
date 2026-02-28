import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Layers, Map, Settings, FileText, Menu, X, LogOut, Languages, ChevronLeft, ChevronRight } from 'lucide-react';
import Joyride, { CallBackProps } from 'react-joyride';
import { cn } from '../lib/utils';
import NotificationBell from './NotificationBell';
import { useLanguage } from '../lib/i18n';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false); // mobile
  const [isCollapsed, setIsCollapsed] = React.useState(false); // desktop compact
  const [runTour, setRunTour] = React.useState(false);
  const { t, language, setLanguage, dir } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/orders', icon: ShoppingBag, label: t('orders') },
    { to: '/products', icon: Package, label: t('products') },
    { to: '/categories', icon: Layers, label: t('categories') },
    { to: '/wilayas', icon: Map, label: t('wilayas') },
    { to: '/about', icon: FileText, label: t('about') },
    { to: '/settings', icon: Settings, label: t('settings') },
  ];

  const joyrideSteps = [
    {
      target: '[data-tour="tour-dashboard"]',
      title: t('tour_step_dashboard_title'),
      content: t('tour_step_dashboard_content'),
    },
    {
      target: '[data-tour="tour-orders"]',
      title: t('tour_step_orders_title'),
      content: t('tour_step_orders_content'),
    },
    {
      target: '[data-tour="tour-products"]',
      title: t('tour_step_products_title'),
      content: t('tour_step_products_content'),
    },
    {
      target: '[data-tour="lang-toggle"]',
      title: t('tour_step_language_title'),
      content: t('tour_step_language_content'),
    },
    {
      target: '#main-content',
      title: t('tour_step_main_title'),
      content: t('tour_step_main_content'),
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = ['finished', 'skipped'];
    if (finishedStatuses.includes(status)) {
      setRunTour(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex font-sans text-gray-900" dir={dir}>
      <Joyride
        steps={joyrideSteps}
        run={runTour}
        continuous
        showSkipButton
        showProgress
        callback={handleJoyrideCallback}
        styles={{
          options: {
            zIndex: 100000,
          },
        }}
        locale={{
          next: t('next'),
          back: t('back'),
          close: t('close'),
          skip: t('skip'),
          last: t('done'),
        }}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 z-50 bg-white text-gray-900 transition-transform duration-200 ease-in-out shadow-lg print:hidden',
          isCollapsed ? 'w-20' : 'w-64',
          // mobile visibility
          language === 'ar' 
            ? (isSidebarOpen ? 'translate-x-0' : 'translate-x-[100%] lg:translate-x-0')
            : (isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'),
          'lg:static lg:inset-auto',
          language === 'ar' ? 'right-0' : 'left-0'
        )}
        aria-expanded={!isCollapsed}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-md hover:bg-gray-100 hidden lg:inline-flex"
              aria-label={isCollapsed ? 'expand sidebar' : 'collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            <span className={cn('text-xl font-serif font-bold tracking-wider transition-opacity', isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100')}>بابيون</span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-black p-2">
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const tourKey = item.to === '/' ? 'tour-dashboard' : `tour-${item.to.replace('/', '')}`;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                data-tour={tourKey}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm',
                    isActive ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                  )
                }
              >
                <div className="p-2 rounded-md flex-shrink-0 bg-gray-50">
                  <item.icon size={18} />
                </div>
                <span className={cn(isCollapsed ? 'hidden' : 'truncate')}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-3">
          <button className={cn('flex items-center gap-3 px-3 py-2 rounded-lg w-full text-sm', isCollapsed ? 'justify-center' : '')}>
            <LogOut size={16} />
            <span className={cn(isCollapsed ? 'hidden' : '')}>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible print:h-auto print:block">
        {/* Header */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shadow-sm print:hidden sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-black p-2">
              <Menu size={20} />
            </button>
            <div className="text-sm text-gray-700 font-semibold hidden lg:block">{/* space for page title if needed */}</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setRunTour(true)}
              className="flex items-center gap-2 px-2 py-1 text-gray-600 hover:text-black hover:bg-gray-50 rounded-md transition-colors text-sm"
              aria-label={t('tour_start')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-help-circle"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>
              <span className="hidden sm:inline text-sm">{t('tour_start')}</span>
            </button>

            <button
              onClick={toggleLanguage}
              data-tour="lang-toggle"
              className="flex items-center gap-2 px-2 py-1 text-gray-600 hover:text-black hover:bg-gray-50 rounded-md transition-colors text-sm"
            >
              <Languages size={18} />
              <span className="hidden sm:inline text-sm">{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            <NotificationBell />

            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-900">المدير العام</p>
              <p className="text-xs text-gray-500">مشرف النظام</p>
            </div>

            <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold shadow-md ring-2 ring-gray-100">
              م
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main id="main-content" className="flex-1 overflow-y-auto p-4 lg:p-6 print:overflow-visible print:h-auto print:p-0">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
