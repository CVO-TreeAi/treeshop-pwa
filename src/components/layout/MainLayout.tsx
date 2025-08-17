"use client";

import { useState } from 'react';
import { 
  UserGroupIcon,
  ClipboardDocumentListIcon,
  BuildingOffice2Icon,
  CpuChipIcon,
  DocumentTextIcon,
  CogIcon,
  SunIcon,
  MoonIcon,
  DocumentChartBarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { 
  UserGroupIcon as UserGroupSolidIcon,
  ClipboardDocumentListIcon as ClipboardSolidIcon,
  BuildingOffice2Icon as BuildingSolidIcon,
  CpuChipIcon as CpuSolidIcon,
  DocumentTextIcon as DocumentSolidIcon,
  CogIcon as CogSolidIcon,
  DocumentChartBarIcon as DocumentChartBarSolidIcon,
  CalendarIcon as CalendarSolidIcon
} from '@heroicons/react/24/solid';
import { useTheme } from '@/contexts/ThemeContext';
import { AuthButton } from '@/components/auth/AuthButton';
import { LeadsView } from '@/components/views/LeadsView';
import { ProposalsView } from '@/components/views/ProposalsView';
import { WorkOrdersView } from '@/components/views/WorkOrdersView';
import { CalendarView } from '@/components/views/CalendarView';
import { OperationsView } from '@/components/views/OperationsView';
import { AlexAIView } from '@/components/views/AlexAIView';
import { InvoicesView } from '@/components/views/InvoicesView';
import { SettingsView } from '@/components/views/SettingsView';

type TabItem = 'leads' | 'proposals' | 'work-orders' | 'calendar' | 'operations' | 'alex-ai' | 'invoices' | 'settings';

const tabs = [
  {
    id: 'leads' as TabItem,
    name: 'Leads',
    icon: UserGroupIcon,
    iconSolid: UserGroupSolidIcon,
  },
  {
    id: 'proposals' as TabItem,
    name: 'Proposals',
    icon: DocumentChartBarIcon,
    iconSolid: DocumentChartBarSolidIcon,
  },
  {
    id: 'work-orders' as TabItem,
    name: 'Work Orders',
    icon: ClipboardDocumentListIcon,
    iconSolid: ClipboardSolidIcon,
  },
  {
    id: 'calendar' as TabItem,
    name: 'Calendar',
    icon: CalendarIcon,
    iconSolid: CalendarSolidIcon,
  },
  {
    id: 'operations' as TabItem,
    name: 'Operations',
    icon: BuildingOffice2Icon,
    iconSolid: BuildingSolidIcon,
  },
  {
    id: 'alex-ai' as TabItem,
    name: 'Alex AI',
    icon: CpuChipIcon,
    iconSolid: CpuSolidIcon,
  },
  {
    id: 'invoices' as TabItem,
    name: 'Invoices',
    icon: DocumentTextIcon,
    iconSolid: DocumentSolidIcon,
  },
  {
    id: 'settings' as TabItem,
    name: 'Settings',
    icon: CogIcon,
    iconSolid: CogSolidIcon,
  },
];

export function MainLayout() {
  const [activeTab, setActiveTab] = useState<TabItem>('leads');
  const { theme, toggleTheme } = useTheme();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'leads':
        return <LeadsView />;
      case 'proposals':
        return <ProposalsView />;
      case 'work-orders':
        return <WorkOrdersView />;
      case 'calendar':
        return <CalendarView />;
      case 'operations':
        return <OperationsView />;
      case 'alex-ai':
        return <AlexAIView />;
      case 'invoices':
        return <InvoicesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <LeadsView />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 treeai-gradient rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">🌳</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">TreeAI</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <AuthButton />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5 text-foreground" />
              ) : (
                <MoonIcon className="w-5 h-5 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {renderActiveView()}
      </main>

      {/* Bottom Tab Navigation */}
      <nav className="bg-card border-t border-border px-2 py-2">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const IconComponent = isActive ? tab.iconSolid : tab.icon;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors min-w-0 flex-1 max-w-[100px] ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <IconComponent className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium truncate">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}