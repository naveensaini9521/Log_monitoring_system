import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Brain,
  BarChart3,
  Shield,
  Server,
  Zap,
  Globe,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Play,
  Star,
  Terminal,
  Cpu,
  ShieldCheck,
  Cloud,
  Database,
  Eye,
  Lock,
  Bell,
  Sparkles,
  LogIn,
} from "lucide-react";
import { Button, Card } from "../components/common/UI";
import { useAuth } from "../contexts/AuthContext";
import "./Homepage.css";

const Homepage = () => {
  const [stats] = useState({
    totalLogs: "1.2M",
    anomaliesDetected: 245,
    activeAlerts: 12,
    systemHealth: 98.7,
    uptime: "99.99%",
    avgResponseTime: "45ms",
  });

  const [liveLogs, setLiveLogs] = useState<any[]>([]);
  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate live log updates
    const interval = setInterval(() => {
      const newLog = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        service: ["auth-service", "api-gateway", "database", "cache"][
          Math.floor(Math.random() * 4)
        ],
        level: ["INFO", "WARN", "ERROR"][Math.floor(Math.random() * 3)],
        message: "User authentication successful",
        status: "normal",
      };
      setLiveLogs((prev) => [newLog, ...prev.slice(0, 4)]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleDemoLogin = async () => {
    // Quick demo login with mock credentials
    const result = await login("demo@logsentinel.ai", "demo123");
    if (result.success) {
      navigate("/app/dashboard");
    }
  };

  const handleGetStarted = () => {
    navigate("/signup");
  };

  const handleSignIn = () => {
    navigate("/login");
  };

  const features = [
    {
      icon: <Brain className="w-10 h-10" />,
      title: "AI-Powered Anomaly Detection",
      description:
        "Advanced ML algorithms detect unusual patterns and predict failures before they impact your system.",
      color: "purple",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: <Terminal className="w-10 h-10" />,
      title: "Real-time Log Processing",
      description:
        "Process millions of log events per second with near-zero latency monitoring and analysis.",
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <AlertTriangle className="w-10 h-10" />,
      title: "Predictive Alerting",
      description:
        "Get proactive alerts for potential issues based on historical patterns and AI predictions.",
      color: "orange",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: <BarChart3 className="w-10 h-10" />,
      title: "Advanced Analytics Dashboard",
      description:
        "Interactive visualizations and custom reports for deep insights into your system behavior.",
      color: "green",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: <ShieldCheck className="w-10 h-10" />,
      title: "Security & Compliance",
      description:
        "Enterprise-grade security with encryption, access controls, and compliance reporting.",
      color: "red",
      gradient: "from-red-500 to-pink-500",
    },
    {
      icon: <Cpu className="w-10 h-10" />,
      title: "Scalable Architecture",
      description:
        "Distributed architecture that scales with your infrastructure from startups to enterprises.",
      color: "indigo",
      gradient: "from-indigo-500 to-purple-500",
    },
  ];

  const integrations = [
    { name: "Docker", logo: "🐳", color: "bg-blue-100 dark:bg-blue-900/30" },
    {
      name: "Kubernetes",
      logo: "☸️",
      color: "bg-blue-200 dark:bg-blue-800/30",
    },
    { name: "AWS", logo: "☁️", color: "bg-orange-100 dark:bg-orange-900/30" },
    { name: "Azure", logo: "🔷", color: "bg-blue-100 dark:bg-blue-900/30" },
    { name: "GCP", logo: "☁️", color: "bg-red-100 dark:bg-red-900/30" },
    {
      name: "Python",
      logo: "🐍",
      color: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    { name: "Node.js", logo: "⬢", color: "bg-green-100 dark:bg-green-900/30" },
    { name: "Java", logo: "☕", color: "bg-orange-100 dark:bg-orange-900/30" },
  ];

  const testimonials = [
    {
      name: "Alex Johnson",
      role: "DevOps Lead at TechCorp",
      quote:
        "Reduced our MTTR by 80% with AI-powered anomaly detection. The system predicted 3 major outages before they happened.",
      avatar: "AJ",
      rating: 5,
    },
    {
      name: "Sarah Chen",
      role: "CTO at StartupX",
      quote:
        "Implementation took less than 30 minutes. The dashboard gives us visibility we never had before. Absolutely game-changing.",
      avatar: "SC",
      rating: 5,
    },
    {
      name: "Marcus Rodriguez",
      role: "SRE at CloudScale",
      quote:
        "The predictive analytics saved us from a catastrophic failure that would have cost millions in downtime. ROI was immediate.",
      avatar: "MR",
      rating: 5,
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for small teams",
      features: [
        "Up to 10 servers",
        "1M logs/month",
        "Basic anomaly detection",
        "7-day retention",
        "Email alerts",
        "Community support",
      ],
      buttonText: "Start Free Trial",
      popular: false,
    },
    {
      name: "Professional",
      price: "$99",
      period: "/month",
      description: "For growing businesses",
      features: [
        "Up to 50 servers",
        "10M logs/month",
        "AI-powered detection",
        "30-day retention",
        "Slack & Email alerts",
        "Priority support",
        "Custom dashboards",
        "API access",
      ],
      buttonText: "Most Popular",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations",
      features: [
        "Unlimited servers",
        "Unlimited logs",
        "Advanced AI models",
        "1+ year retention",
        "All integrations",
        "24/7 phone support",
        "SLA guarantee",
        "On-premise option",
        "Custom AI training",
      ],
      buttonText: "Contact Sales",
      popular: false,
    },
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-75"></div>
                <div className="relative bg-gray-900 p-2 rounded-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Log Monitoring System
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Testimonials
              </a>
              <a
                href="#demo"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Demo
              </a>
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <div className="hidden md:flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user?.name || "User"}
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => navigate("/app/dashboard")}
                    className="px-6"
                  >
                    Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="ghost" onClick={handleSignIn}>
                    Sign In
                  </Button>
                  <Button variant="outline" onClick={handleGetStarted}>
                    Sign Up
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleGetStarted}
                    className="px-6"
                  >
                    Get Started Free
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20"></div>
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 mb-8">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Now with Predictive AI Analytics
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 hero-title">
              Intelligent
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
                Log Monitoring
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed hero-subtitle">
              Transform your logs into actionable insights with AI-powered
              anomaly detection, predictive analytics, and real-time monitoring
              for modern cloud infrastructure.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Button
                  size="lg"
                  variant="primary"
                  onClick={() => navigate("/app/dashboard")}
                  className="px-10 py-4 text-lg"
                >
                  <Activity className="mr-3 w-5 h-5" />
                  Go to Live Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    variant="primary"
                    className="px-10 py-4 text-lg group btn-group-hover"
                    onClick={handleGetStarted}
                  >
                    Start Free 14-Day Trial
                    <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-10 py-4 text-lg border-2"
                    onClick={handleDemoLogin}
                  >
                    <LogIn className="mr-3 w-5 h-5" />
                    Quick Demo Login
                  </Button>
                </>
              )}
            </div>

            <p className="mt-6 text-gray-500 dark:text-gray-400 text-sm">
              No credit card required • Setup in 5 minutes • 24/7 Support
            </p>
          </motion.div>

          {/* Live Dashboard Preview */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-20"></div>
            <Card className="relative bg-gradient-to-br from-gray-900 to-gray-800 border-0 overflow-hidden shine-effect">
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 h-1 separator"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-300 font-mono">
                      Live Dashboard Preview
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm">Connected</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {Object.entries(stats).map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                    >
                      <div className="text-gray-400 text-sm uppercase tracking-wider mb-2">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-black/50 rounded-lg p-4 border border-gray-700">
                  <div className="text-gray-400 text-sm mb-2">
                    Live Log Stream
                  </div>
                  <div className="font-mono text-sm h-32 overflow-y-auto">
                    {liveLogs.map((log) => (
                      <div key={log.id} className="mb-1 flex items-center">
                        <span className="text-gray-500 text-xs mr-4">
                          [
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                          ]
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs mr-3 ${
                            log.level === "ERROR"
                              ? "bg-red-900/50 text-red-300"
                              : log.level === "WARN"
                                ? "bg-yellow-900/50 text-yellow-300"
                                : "bg-green-900/50 text-green-300"
                          }`}
                        >
                          {log.level}
                        </span>
                        <span className="text-blue-300 mr-3">
                          {log.service}
                        </span>
                        <span className="text-gray-300">{log.message}</span>
                      </div>
                    ))}
                    <div className="flex items-center mt-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                      <span className="text-gray-500 text-sm">
                        Streaming live logs...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 section-title">
              Trusted by Engineering Teams Worldwide
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Processing over 1 billion logs daily with 99.99% uptime
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="text-center p-8 hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                1.2M+
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Logs Processed Daily
              </div>
            </Card>

            <Card className="text-center p-8 hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                99.9%
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Accuracy Rate
              </div>
            </Card>

            <Card className="text-center p-8 hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800">
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                80%
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                MTTR Reduction
              </div>
            </Card>

            <Card className="text-center p-8 hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800">
              <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                50+
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Countries Served
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 mb-4">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Powerful Features
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 section-title">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              From log collection to predictive analytics, we've built the most
              comprehensive monitoring solution
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="p-8 h-full hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                  <div
                    className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-blue-600 dark:text-blue-400">
                    <span className="text-sm font-medium">Learn more</span>
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
              Seamless Integrations
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Works with your existing tools and infrastructure
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {integrations.map((integration) => (
              <motion.div
                key={integration.name}
                whileHover={{ scale: 1.05 }}
                className={`${integration.color} rounded-xl p-6 flex flex-col items-center justify-center hover:shadow-lg transition-shadow dark:border dark:border-gray-700`}
              >
                <span className="text-3xl mb-2">{integration.logo}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {integration.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="testimonials"
        className="py-20 bg-gray-50 dark:bg-gray-800/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 mb-4">
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Customer Success Stories
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 section-title">
              Loved by Engineering Teams
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 h-full hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800">
                  <div className="flex items-center mb-6">
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {testimonial.avatar}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-lg dark:text-white">
                        {testimonial.name}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 italic mb-6">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 section-title">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Start small, scale as you grow. All plans include core features
              with no hidden fees.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold py-2 px-4 rounded-t-lg text-center">
                      Most Popular
                    </div>
                  </div>
                )}
                <Card
                  className={`p-8 h-full dark:bg-gray-800 ${
                    plan.popular
                      ? "border-2 border-blue-500 dark:border-blue-500"
                      : ""
                  }`}
                >
                  <h3 className="text-2xl font-bold mb-2 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {plan.description}
                  </p>

                  <div className="mb-8">
                    <span className="text-5xl font-bold dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {plan.period}
                    </span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span className="dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.popular ? "primary" : "outline"}
                    className="w-full"
                    onClick={handleGetStarted}
                  >
                    {plan.buttonText}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-shadow-md">
              Ready to Transform Your Log Monitoring?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Join thousands of engineering teams using AI to predict failures,
              reduce downtime, and maintain perfect system health.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="px-10 py-4 text-lg bg-white hover:bg-gray-100 text-gray-900"
                onClick={handleGetStarted}
              >
                {isAuthenticated
                  ? "Go to Dashboard"
                  : "Start Free 14-Day Trial"}
              </Button>
              {!isAuthenticated && (
                <Button
                  size="lg"
                  variant="outline"
                  className="px-10 py-4 text-lg border-2 border-white text-white hover:bg-white/10"
                  onClick={handleDemoLogin}
                >
                  Try Demo Dashboard
                </Button>
              )}
            </div>

            <p className="text-blue-200 mt-8 text-sm">
              🚀 No setup fees • 14-day free trial • Cancel anytime • 24/7
              Support
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <Brain className="w-8 h-8 text-blue-400 animate-float" />
                <span className="text-2xl font-bold">
                  AI Log Monitoring System
                </span>
              </div>
              <p className="text-gray-400 mb-4">
                Intelligent log monitoring powered by artificial intelligence.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Twitter
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  GitHub
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    to="/#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="/#pricing"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    GDPR
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>
              © {new Date().getFullYear()} AI Log Monitoring System. All rights
              reserved.
            </p>
            <p className="mt-2 text-sm">
              Made with ❤️ for developers and DevOps engineers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
