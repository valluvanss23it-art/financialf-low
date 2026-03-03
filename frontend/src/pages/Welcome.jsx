import { Link } from 'react-router-dom';
import {
  ArrowRight,
  TrendingUp,
  PiggyBank,
  Target,
  Shield,
  Calculator,
  BookOpen,
  Wallet,
  BarChart3,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const features = [
  {
    icon: TrendingUp,
    title: 'Track Income & Expenses',
    description: 'Monitor your cash flow with detailed categorization and insights.',
  },
  {
    icon: PiggyBank,
    title: 'Smart Savings',
    description: 'Build your emergency fund and track savings progress automatically.',
  },
  {
    icon: Target,
    title: 'Goal Planning',
    description: 'Set financial goals with recurring contributions and deadline tracking.',
  },
  {
    icon: Wallet,
    title: 'Net Worth Tracking',
    description: 'See your complete financial picture with assets and liabilities.',
  },
  {
    icon: Shield,
    title: 'Insurance Management',
    description: 'Keep track of all your insurance policies and premium schedules.',
  },
  {
    icon: Calculator,
    title: 'Financial Calculators',
    description: 'SIP, EMI, FD calculators to plan your investments and loans.',
  },
];

const benefits = [
  'Free to use with no hidden fees',
  'Bank-grade security for your data',
  'Beautiful charts and visualizations',
  'Mobile-friendly design',
  'Tax planning assistance',
  'Educational resources included',
];

export default function Welcome() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.15),transparent_50%)]" />
        
        <nav className="relative z-10 container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-display">FinanceFlow</span>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <Button asChild>
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">Get Started Free</Link>
                </Button>
              </>
            )}
          </div>
        </nav>

        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Your Personal Finance Companion
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display mb-6 leading-tight">
            Take Control of Your{' '}
            <span className="gradient-text">Financial Future</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Track expenses, plan investments, achieve goals, and build wealth with India's most intuitive personal finance app.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="text-lg px-8">
              <Link to={user ? '/dashboard' : '/auth'}>
                {user ? 'Open Dashboard' : 'Start Free Today'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8">
              <Link to="/learn">
                <BookOpen className="w-5 h-5 mr-2" />
                Learn Finance
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              Everything You Need to Manage Money
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful tools designed for the Indian investor, from beginners to experts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-6">
                Why Choose FinanceFlow?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Built specifically for Indian users with features that matter - from tax planning under Indian laws to tracking investments in INR.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
              <div className="relative bg-card border border-border rounded-2xl p-8 shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <span className="text-muted-foreground">Monthly Savings</span>
                    <span className="text-xl font-bold text-primary">₹45,000</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <span className="text-muted-foreground">Investment Growth</span>
                    <span className="text-xl font-bold text-success">+12.5%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                    <span className="text-muted-foreground">Goals Achieved</span>
                    <span className="text-xl font-bold text-accent">3 of 5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Start Your Financial Journey Today
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            Join thousands of Indians who are taking control of their finances with FinanceFlow.
          </p>
          <Button size="lg" asChild className="text-lg px-10">
            <Link to={user ? '/dashboard' : '/auth'}>
              {user ? 'Go to Dashboard' : 'Create Free Account'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2024 FinanceFlow. Built for Indians, by Indians. 🇮🇳</p>
        </div>
      </footer>
    </div>
  );
}
