import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  PiggyBank,
  TrendingUp,
  Receipt,
  Target,
  Shield,
  CreditCard,
  Wallet,
  ArrowLeft,
  GraduationCap,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/ui/page-header';
import { InfoCard } from '@/components/ui/info-card';
import { Button } from '@/components/ui/button';
import { LearnTopicCard } from '@/components/learn/LearnTopicCard';
import { LearningModule } from '@/components/learn/LearningModule';
import { learningContent } from '@/components/learn/learningContent';

type TopicKey = keyof typeof learningContent;

const topics = [
  {
    id: 'budgeting' as TopicKey,
    icon: <Wallet className="w-6 h-6 text-primary" />,
    title: 'Budgeting Basics',
    description: 'Learn to create and maintain a budget that helps you achieve your financial goals.',
    topics: ['50/30/20 Rule', 'Zero-Based Budgeting', 'Tracking Expenses', 'Monthly Planning'],
    color: 'bg-primary/10',
  },
  {
    id: 'investing' as TopicKey,
    icon: <TrendingUp className="w-6 h-6 text-success" />,
    title: 'Investing Fundamentals',
    description: 'Understand stocks, mutual funds, SIPs, and how to grow your wealth over time.',
    topics: ['SIP Investing', 'Mutual Funds', 'Risk vs Return', 'Asset Allocation'],
    color: 'bg-success/10',
  },
  {
    id: 'tax' as TopicKey,
    icon: <Receipt className="w-6 h-6 text-secondary" />,
    title: 'Tax Planning',
    description: 'Optimize your taxes legally with deductions, exemptions, and smart planning.',
    topics: ['Section 80C', 'HRA Exemption', 'NPS Benefits', 'Tax Regime Choice'],
    color: 'bg-secondary/10',
  },
  {
    id: 'retirement' as TopicKey,
    icon: <Target className="w-6 h-6 text-info" />,
    title: 'Retirement Planning',
    description: 'Plan for a financially secure retirement with proper corpus calculation and investment.',
    topics: ['EPF & PPF', 'NPS', 'Retirement Corpus', '4% Rule'],
    color: 'bg-info/10',
  },
  {
    id: 'emergency' as TopicKey,
    icon: <Shield className="w-6 h-6 text-warning" />,
    title: 'Emergency Fund',
    description: 'Build a safety net to handle unexpected expenses without derailing your finances.',
    topics: ['How Much to Save', 'Where to Keep It', 'Building Gradually', 'When to Use'],
    color: 'bg-warning/10',
  },
  {
    id: 'debt' as TopicKey,
    icon: <CreditCard className="w-6 h-6 text-destructive" />,
    title: 'Debt Management',
    description: 'Learn strategies to manage, reduce, and eliminate debt effectively.',
    topics: ['Good vs Bad Debt', 'Debt Snowball', 'Debt Avalanche', 'Credit Score'],
    color: 'bg-destructive/10',
  },
];

export default function LearnPage() {
  const [selectedTopic, setSelectedTopic] = useState<TopicKey | null>(null);

  const handleSelectTopic = (topicId: TopicKey) => {
    setSelectedTopic(topicId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (selectedTopic && learningContent[selectedTopic]) {
    const content = learningContent[selectedTopic];
    return (
      <Layout>
        <div className="page-container">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setSelectedTopic(null)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Topics
            </Button>
          </div>

          <LearningModule
            title={content.title}
            description={content.description}
            sections={content.sections}
            calculatorLink={'calculatorLink' in content ? content.calculatorLink : undefined}
          />

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Continue Learning</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topics
                .filter((t) => t.id !== selectedTopic)
                .slice(0, 3)
                .map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleSelectTopic(topic.id)}
                    className="finance-card text-left hover:border-primary/50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${topic.color}`}>
                      {topic.icon}
                    </div>
                    <h4 className="font-semibold">{topic.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {topic.description.slice(0, 60)}...
                    </p>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container">
        <PageHeader
          title="Learn"
          description="Master personal finance with our comprehensive learning hub"
          icon={<BookOpen className="w-6 h-6" />}
        />

        {/* Hero Section */}
        <div className="finance-card bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-display font-bold mb-2">
                Welcome to Finance School
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                Whether you're just starting your financial journey or looking to level up,
                our learning modules cover everything from budgeting basics to advanced
                investment strategies. Learn at your own pace and track your progress.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="finance-card text-center">
            <p className="text-3xl font-bold text-primary">6</p>
            <p className="text-sm text-muted-foreground">Learning Modules</p>
          </div>
          <div className="finance-card text-center">
            <p className="text-3xl font-bold text-secondary">25+</p>
            <p className="text-sm text-muted-foreground">Lessons</p>
          </div>
          <div className="finance-card text-center">
            <p className="text-3xl font-bold text-success">50+</p>
            <p className="text-sm text-muted-foreground">Pro Tips</p>
          </div>
          <div className="finance-card text-center">
            <p className="text-3xl font-bold text-info">Free</p>
            <p className="text-sm text-muted-foreground">Forever</p>
          </div>
        </div>

        {/* Topics Grid */}
        <h2 className="text-xl font-semibold mb-6">Choose a Topic</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {topics.map((topic) => (
            <div
              key={topic.id}
              onClick={() => handleSelectTopic(topic.id)}
              className="cursor-pointer"
            >
              <LearnTopicCard
                icon={topic.icon}
                title={topic.title}
                description={topic.description}
                topics={topic.topics}
                color={topic.color}
              />
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoCard title="💡 Learning Tips" variant="tip">
            <p>
              Start with budgeting basics if you're new to personal finance.
              Understanding where your money goes is the foundation of all
              financial planning.
            </p>
          </InfoCard>
          <InfoCard title="🎯 Take Action" variant="info">
            <p>
              Each module includes calculators and practical tools. Don't just
              read—apply what you learn to your own finances for best results.
            </p>
          </InfoCard>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            Ready to put your knowledge into practice?
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild>
              <Link to="/calculators">Try Calculators</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/income">Track Income</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/expense">Track Expenses</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
