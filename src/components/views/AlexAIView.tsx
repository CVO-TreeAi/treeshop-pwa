"use client";

import { useState, useRef, useEffect } from 'react';
import { useAction, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useMockMutation } from '@/hooks/useMockConvex';
import { 
  PaperAirplaneIcon, 
  MicrophoneIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  assessmentData?: any;
  showAssessmentCard?: boolean;
}

interface AssessmentResult {
  tree_measurements: {
    height: number;
    canopy_radius: number;
    dbh: number;
    species: string;
    condition: string;
  };
  afiss_assessment: {
    access_score: number;
    fall_zone_score: number;
    interference_score: number;
    severity_score: number;
    site_conditions_score: number;
    composite_score: number;
  };
  business_estimates: {
    estimated_hours: number;
    estimated_cost: number;
    crew_type: string;
    equipment_required: string[];
    safety_protocols: string[];
    isa_certified_required: boolean;
  };
  complexity: {
    level: string;
    multiplier: number;
    factors: string[];
  };
  treescore: {
    base_score: number;
    total_score: number;
  };
  reasoning: string;
}

export function AlexAIView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm Alex, the TreeAI Operations Commander. I'm an advanced autonomous agent specializing in complete tree service operations management.\n\n🌳 **My Capabilities:**\n• TreeScore Calculations with AFISS risk assessment\n• Comprehensive project assessments\n• Crew optimization and equipment loadout recommendations\n• Safety protocol determination\n• Real-time business intelligence\n\nI have access to 340+ AFISS risk factors and can provide instant analysis of any tree service project. Just describe your project, and I'll deliver a complete operational assessment!\n\n**Try saying:** \"Assess this project: Large oak tree removal, 60 feet tall, near house with power lines, residential area\"",
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Try Convex first, fallback to mock
  const convexAssessment = useAction(api.alexAI.performAndStoreAssessment);
  const mockAssessment = useMockMutation('alexAI:performAndStoreAssessment');
  const performAssessment = convexAssessment || mockAssessment;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isProjectDescription = (text: string): boolean => {
    const projectKeywords = [
      'tree', 'oak', 'removal', 'trimming', 'stump', 'grinding', 'feet', 'tall', 
      'dbh', 'diameter', 'canopy', 'power lines', 'house', 'residential', 'commercial',
      'inches', 'height', 'assess', 'project', 'estimate', 'quote'
    ];
    
    const textLower = text.toLowerCase();
    const keywordCount = projectKeywords.filter(keyword => textLower.includes(keyword)).length;
    
    return keywordCount >= 3 || textLower.includes('assess this project');
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    const originalInput = inputValue;
    setInputValue('');
    setIsAnalyzing(true);

    try {
      // Check if this looks like a project description for AI assessment
      if (isProjectDescription(originalInput)) {
        // Perform real AI assessment with timeout
        const assessmentPromise = performAssessment({
          projectDescription: originalInput,
          requestId: `alex_${Date.now()}`
        });
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Assessment timeout')), 10000)
        );
        
        const assessmentResult = await Promise.race([assessmentPromise, timeoutPromise]);

        let assistantMessage: Message;

        if (assessmentResult.status === 'success' && assessmentResult.assessment && !assessmentResult.assessment.fallback) {
          const assessment = assessmentResult.assessment as AssessmentResult;
          
          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `# 🎯 **Alex AI Assessment Complete**\n\nI've analyzed your project and here's my comprehensive operational assessment:\n\n## **TreeScore Analysis**\n🌳 **Base TreeScore:** ${assessment.treescore?.base_score?.toFixed(1) || 'Calculating...'} points\n📊 **Total Score:** ${assessment.treescore?.total_score?.toFixed(1) || 'Calculating...'} points\n\n## **AFISS Risk Assessment**\n⚠️ **Composite Risk Score:** ${assessment.afiss_assessment?.composite_score?.toFixed(1) || 'N/A'}%\n\n• **Access Challenges:** ${assessment.afiss_assessment?.access_score?.toFixed(1) || 'N/A'}%\n• **Fall Zone Risks:** ${assessment.afiss_assessment?.fall_zone_score?.toFixed(1) || 'N/A'}%\n• **Interference Factors:** ${assessment.afiss_assessment?.interference_score?.toFixed(1) || 'N/A'}%\n• **Severity Level:** ${assessment.afiss_assessment?.severity_score?.toFixed(1) || 'N/A'}%\n\n## **Business Intelligence**\n💰 **Estimated Cost:** $${assessment.business_estimates?.estimated_cost?.toLocaleString() || 'Calculating...'}\n⏱️ **Estimated Hours:** ${assessment.business_estimates?.estimated_hours || 'N/A'} hours\n👥 **Crew Type:** ${assessment.business_estimates?.crew_type || 'Standard'}\n📋 **ISA Arborist Required:** ${assessment.business_estimates?.isa_certified_required ? 'Yes' : 'No'}\n\n## **Complexity Assessment**\n🎚️ **Level:** ${assessment.complexity?.level?.toUpperCase() || 'MODERATE'}\n📈 **Multiplier:** ${assessment.complexity?.multiplier?.toFixed(2) || '1.5'}x\n\n${assessment.reasoning || ''}\n\nWould you like me to generate a detailed work order or analyze any specific aspect further?`,
            timestamp: Date.now(),
            assessmentData: assessment,
            showAssessmentCard: true
          };
        } else {
          // Fallback response for assessment errors
          assistantMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant', 
            content: `# 🔧 **Assessment in Progress**\n\nI can see this is a tree service project assessment request. I'm processing the following:\n\n**Project Details Identified:**\n${originalInput}\n\n**Alex AI Analysis Framework:**\n• TreeScore calculation (Height × Canopy Radius × 2 × DBH/12)\n• AFISS risk assessment across 5 domains\n• Crew optimization based on complexity\n• Equipment loadout recommendations\n• Safety protocol determination\n\n*Note: Full AI assessment requires API configuration. In the meantime, I can help with TreeScore calculations, crew planning, and operational guidance based on the project details you've provided.*\n\nWhat specific aspect would you like me to focus on first?`,
            timestamp: Date.now()
          };
        }

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Handle general conversation
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: getContextualResponse(originalInput),
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Assessment error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `# ⚠️ **Assessment Error**\n\nI encountered an issue processing your request. However, as your TreeAI Operations Commander, I can still assist with:\n\n• Manual TreeScore calculations\n• Crew recommendations based on project complexity\n• Equipment loadout suggestions\n• Safety protocol guidance\n• Operational best practices\n\nPlease try rephrasing your project description, or let me know how else I can help with your tree service operations!`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getContextualResponse = (input: string): string => {
    const inputLower = input.toLowerCase();
    
    if (inputLower.includes('treescore') || inputLower.includes('calculate')) {
      return `# 🧮 **TreeScore Calculation System**\n\nI can help you calculate TreeScore using the formula:\n**TreeScore = Height × (Canopy Radius × 2) × (DBH ÷ 12)**\n\nPlus AFISS bonus points based on:\n• Access challenges\n• Fall zone considerations \n• Interference factors\n• Severity assessment\n• Site conditions\n\nTo get started, please provide:\n• Tree height (feet)\n• Canopy radius (feet)\n• DBH - Diameter at Breast Height (inches)\n• Project location and hazards\n\n**Example:** "Calculate TreeScore for 80-foot oak, 25-foot canopy radius, 36-inch DBH, near power lines"`;
    }
    
    if (inputLower.includes('crew') || inputLower.includes('team')) {
      return `# 👥 **Crew Optimization Guidelines**\n\nAs your operations commander, here's my crew assignment framework:\n\n**🟢 LOW Complexity (1.12-1.28x multiplier):**\n• 2-3 crew members\n• Standard crew acceptable\n• 250-350 PpH expected\n\n**🟡 MODERATE Complexity (1.45-1.85x multiplier):**\n• 3-4 crew members\n• Experienced crew preferred\n• 350-450 PpH expected\n\n**🔴 HIGH Complexity (2.1-2.8x multiplier):**\n• 4-6 crew members\n• Expert crew required\n• ISA Certified Arborist mandatory\n• 450-550 PpH expected\n\n**🟣 EXTREME Complexity (2.5-3.5x multiplier):**\n• 5+ specialized crew members\n• Multiple ISA Arborists\n• Enhanced safety protocols\n• Specialist equipment required\n\nWhat's your project complexity level?`;
    }
    
    if (inputLower.includes('equipment') || inputLower.includes('loadout')) {
      return `# 🚛 **Equipment Loadout Intelligence**\n\nI manage optimal equipment combinations for maximum efficiency:\n\n**Forestry Mulching Loadout:**\n• CAT 265 Skid Steer + Fecon Blackhawk Mulcher\n• Expected: 0.64 acres/hour (including transport)\n• Crew: 2-3 members\n\n**Tree Removal - High Complexity:**\n• Crane + Chipper + Multiple Chainsaws\n• Expert crew with ISA Arborist\n• Enhanced safety protocols\n\n**Stump Grinding Standard:**\n• Self-propelled stump grinder\n• 2-person crew\n• High efficiency on residential sites\n\nDescribe your project type and I'll recommend the optimal loadout configuration!`;
    }
    
    if (inputLower.includes('safety') || inputLower.includes('protocol')) {
      return `# 🛡️ **Safety Protocol Matrix**\n\nSafety always comes first. My protocol determination system:\n\n**Base Requirements (All Projects):**\n• Pre-job safety briefing\n• PPE inspection and verification\n• Emergency contact protocols\n\n**Power Line Proximity:**\n• Utility coordination mandatory\n• Line clearance verification\n• Electrical hazard training\n\n**Residential/Structure Proximity:**\n• Property protection setup\n• Exclusion zone establishment\n• Customer communication protocols\n\n**High/Extreme Complexity:**\n• ISA Certified Arborist supervision\n• Enhanced communication systems\n• Emergency response plan activation\n• Detailed documentation required\n\nWhat safety considerations do you need guidance on?`;
    }
    
    return `# 🤖 **Alex - TreeAI Operations Commander**\n\nI understand you're asking about "${input}". Here's how I can assist with your tree service operations:\n\n**🎯 Project Assessment:**\nDescribe any tree project for instant AFISS analysis\n\n**📊 TreeScore Calculations:**\nPrecise point calculations with risk multipliers\n\n**👥 Crew Optimization:**\nOptimal team configurations for any complexity\n\n**🚛 Equipment Intelligence:**\nLoadout recommendations and efficiency metrics\n\n**🛡️ Safety Protocols:**\nComprehensive risk mitigation strategies\n\n**📈 Business Intelligence:**\nCost analysis, timeline optimization, performance tracking\n\n**Try a specific request like:**\n• "Assess 60-foot oak removal near house"\n• "Calculate TreeScore for maple trimming"\n• "Recommend crew for high-complexity project"\n\nHow can I optimize your operations today?`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (content: string) => {
    // Convert markdown-style formatting to JSX
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('# ')) {
        return <h3 key={index} className="text-lg font-bold text-foreground mb-2">{line.substring(2)}</h3>;
      } else if (line.startsWith('## ')) {
        return <h4 key={index} className="text-base font-semibold text-foreground mb-1 mt-3">{line.substring(3)}</h4>;
      } else if (line.startsWith('• ')) {
        return <div key={index} className="ml-4 text-sm text-muted-foreground">{line}</div>;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return <div key={index} className="font-medium text-foreground text-sm mb-1">{line.substring(2, line.length - 2)}</div>;
      } else if (line.trim() === '') {
        return <div key={index} className="h-2"></div>;
      } else {
        return <div key={index} className="text-sm text-card-foreground">{line}</div>;
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Alex AI Operations Commander</h2>
              <p className="text-sm text-muted-foreground">TreeAI Autonomous Operations Agent</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-xs text-muted-foreground">AI Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl px-4 py-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-card-foreground'
              }`}
            >
              {message.role === 'assistant' ? (
                <div className="space-y-1">
                  {renderMessage(message.content)}
                </div>
              ) : (
                <p className="text-sm">{message.content}</p>
              )}
              
              <div className={`flex items-center justify-between mt-2 pt-2 border-t ${
                message.role === 'user' 
                  ? 'border-primary-foreground/20' 
                  : 'border-border'
              }`}>
                <p className={`text-xs ${
                  message.role === 'user' 
                    ? 'text-primary-foreground/70' 
                    : 'text-muted-foreground'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
                
                {message.showAssessmentCard && message.assessmentData && (
                  <div className="flex space-x-2">
                    <button className="text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition-colors">
                      Create Work Order
                    </button>
                    <button className="text-xs bg-success/10 text-success px-2 py-1 rounded hover:bg-success/20 transition-colors">
                      Generate Quote
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isAnalyzing && (
          <div className="flex justify-start">
            <div className="bg-card border border-border text-card-foreground max-w-xs lg:max-w-md px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-muted-foreground">Alex is analyzing your project...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="border-t border-border p-4">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Quick Commands:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { text: "Assess this project: 80-foot oak removal", icon: ChartBarIcon },
              { text: "Calculate TreeScore", icon: ChartBarIcon },
              { text: "Recommend crew for high complexity", icon: UserGroupIcon },
              { text: "Safety protocols for power lines", icon: ExclamationTriangleIcon },
              { text: "Equipment loadout for forestry mulching", icon: WrenchScrewdriverIcon },
              { text: "Optimize today's schedule", icon: ClockIcon },
              { text: "Generate performance report", icon: ChartBarIcon },
              { text: "Check equipment availability", icon: CheckCircleIcon }
            ].map((action, index) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => setInputValue(action.text)}
                  className="flex items-center space-x-2 p-2 bg-muted text-muted-foreground rounded-lg text-xs hover:bg-muted/80 transition-colors"
                >
                  <IconComponent className="w-3 h-3" />
                  <span className="truncate">{action.text.split(':')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input */}
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your tree service project for instant AI assessment..."
              className="w-full bg-input border border-border rounded-lg px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-ring text-foreground resize-none"
              rows={2}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isAnalyzing}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
                !inputValue.trim() || isAnalyzing
                  ? 'text-muted-foreground cursor-not-allowed'
                  : 'text-primary hover:text-primary/80 hover:bg-primary/10'
              }`}
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
          
          <button className="p-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors">
            <MicrophoneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}