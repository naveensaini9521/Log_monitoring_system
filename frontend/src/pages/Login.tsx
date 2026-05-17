import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  LogIn,
  Eye,
  EyeOff,
  Mail,
  Brain,
  Shield,
  AlertCircle,
  CheckCircle,
  Sparkles,
  UserPlus,
  ArrowRight,
  User,
  Users,
  ShieldCheck,
  Eye as EyeIcon,
  FileText,
  Code,
  Key,
  Settings,
  Activity,
  BarChart,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { authApi } from "../services/api";
import { toast } from "react-hot-toast";
import "./Login.css";

interface LoginFormData {
  email: string;
  password: string;
  organization?: string;
  role?: string;
}

interface UserRole {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  permissions: string[];
  color: string;
  defaultRedirect: string;
  apiEndpoint: string;
}

interface Organization {
  id: string;
  name: string;
  domain: string;
  logo?: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    organization: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showDemoCredentials, setShowDemoCredentials] =
    useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [showOrgSelector, setShowOrgSelector] = useState<boolean>(false);
  const [showRoleSelector, setShowRoleSelector] = useState<boolean>(false);
  const [isSignupMode, setIsSignupMode] = useState<boolean>(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState<boolean>(false);

  const { login, loginWithRole } = useAuth();
  const navigate = useNavigate();

  // All roles defined for reference (UI selection is commented out)
  const userRoles: UserRole[] = [
    {
      id: "super_admin",
      name: "Super Admin",
      description: "Full system access and global management",
      icon: <Settings className="w-5 h-5" />,
      permissions: [
        "manage_all_organizations",
        "global_settings",
        "view_all_logs",
        "manage_users",
        "billing_access",
        "system_configuration",
      ],
      color: "from-red-500 to-pink-600",
      defaultRedirect: "/app/dashboard",
      apiEndpoint: "/api/admin",
    },
    {
      id: "org_admin",
      name: "Organization Admin",
      description: "Manage organization settings and users",
      icon: <Users className="w-5 h-5" />,
      permissions: [
        "manage_org_users",
        "org_settings",
        "view_org_logs",
        "manage_log_sources",
        "create_api_keys",
        "configure_alerts",
      ],
      color: "from-blue-500 to-cyan-600",
      defaultRedirect: "/app/dashboard",
      apiEndpoint: "/api/org",
    },
    {
      id: "security_analyst",
      name: "Security Analyst",
      description: "Monitor security logs and investigate incidents",
      icon: <ShieldCheck className="w-5 h-5" />,
      permissions: [
        "real_time_monitoring",
        "view_security_alerts",
        "incident_investigation",
        "create_dashboards",
        "run_ai_queries",
        "export_reports",
      ],
      color: "from-green-500 to-emerald-600",
      defaultRedirect: "/app/dashboard",
      apiEndpoint: "/api/security",
    },
    {
      id: "devops_engineer",
      name: "DevOps Engineer",
      description: "Manage system performance and deployments",
      icon: <Code className="w-5 h-5" />,
      permissions: [
        "view_system_logs",
        "monitor_performance",
        "configure_agents",
        "manage_integrations",
        "troubleshoot_issues",
        "view_metrics",
      ],
      color: "from-purple-500 to-violet-600",
      defaultRedirect: "/app/dashboard",
      apiEndpoint: "/api/devops",
    },
    {
      id: "ai_analyst",
      name: "AI Analyst",
      description: "Analyze AI models and insights",
      icon: <Brain className="w-5 h-5" />,
      permissions: [
        "train_models",
        "analyze_patterns",
        "create_insights",
        "configure_anomaly_detection",
        "view_ai_metrics",
        "export_analysis",
      ],
      color: "from-indigo-500 to-purple-600",
      defaultRedirect: "/app/dashboard",
      apiEndpoint: "/api/ai",
    },
    {
      id: "viewer",
      name: "Viewer",
      description: "Read-only access to dashboards and reports",
      icon: <EyeIcon className="w-5 h-5" />,
      permissions: [
        "view_dashboards",
        "read_logs",
        "export_reports",
        "view_analytics",
        "no_write_access",
      ],
      color: "from-gray-500 to-gray-600",
      defaultRedirect: "/app/dashboard",
      apiEndpoint: "/api/viewer",
    },
  ];

  // Demo credentials (kept for potential testing, but not used in UI)
  const demoCredentials = {
    super_admin: { email: "admin@logsentinel.ai", password: "Admin@2024" },
    org_admin: { email: "orgadmin@acme.com", password: "OrgAdmin@2024" },
    security_analyst: { email: "security@acme.com", password: "Security@2024" },
    devops_engineer: { email: "devops@acme.com", password: "DevOps@2024" },
    ai_analyst: { email: "ai@logsentinel.ai", password: "AI@2024" },
    viewer: { email: "viewer@acme.com", password: "Viewer@2024" },
  };

  // Sample organizations data
  const sampleOrganizations: Organization[] = [
    { id: "acme", name: "Acme Corporation", domain: "acme.com", logo: "🏢" },
    {
      id: "techcorp",
      name: "TechCorp Inc",
      domain: "techcorp.com",
      logo: "💻",
    },
    {
      id: "cloudscale",
      name: "CloudScale",
      domain: "cloudscale.io",
      logo: "☁️",
    },
    { id: "startupx", name: "StartupX", domain: "startupx.dev", logo: "🚀" },
    {
      id: "logsentinel",
      name: "LogSentinel AI",
      domain: "logsentinel.ai",
      logo: "🧠",
    },
  ];

  // Fetch organizations on mount
  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Auto-detect organization from email domain (optional, can keep)
  useEffect(() => {
    if (formData.email.includes("@")) {
      const domain = formData.email.split("@")[1];
      const org = organizations.find((o) => o.domain === domain);
      if (org) {
        setSelectedOrg(org.id);
        setFormData((prev) => ({ ...prev, organization: org.id }));
      }
    }
  }, [formData.email, organizations]);

  const fetchOrganizations = async () => {
    setLoadingOrgs(true);
    try {
      const response = await fetch("/api/public/organizations");
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations || sampleOrganizations);
      } else {
        setOrganizations(sampleOrganizations);
      }
      console.log("✅ Organizations loaded");
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
      setOrganizations(sampleOrganizations);
    } finally {
      setLoadingOrgs(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  // UPDATED: Simplified login – no role/organization selection
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!formData.email || !formData.password) {
        setError("Please enter both email and password");
        setLoading(false);
        return;
      }

      console.log("🔐 Attempting login with:", { email: formData.email });

      // Call login without role/organization – backend will determine role from user record
      const result = await login(formData.email, formData.password);

      console.log("📥 Login result:", result);

      if (result.success) {
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
          localStorage.setItem("lastEmail", formData.email);
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("lastEmail");
        }

        toast.success("Login successful! Redirecting...");

        // Always redirect to /app/dashboard – dashboard will handle role-based content
        navigate("/app/dashboard");
      } else {
        setError(result.message || "Invalid email or password");
        toast.error(result.message || "Login failed");
      }
    } catch (err: any) {
      console.error("❌ Login error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Login failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Keep demo login function for possible testing, but not exposed in UI
  const handleRoleDemoLogin = async (roleId: string) => {
    const credentials = demoCredentials[roleId as keyof typeof demoCredentials];
    if (!credentials) return;

    setFormData({
      email: credentials.email,
      password: credentials.password,
      organization: selectedOrg,
      role: roleId,
    });

    setSelectedRole(roleId);
    setShowDemoCredentials(true);
    setLoading(true);

    try {
      const result = await loginWithRole(
        credentials.email,
        credentials.password,
        roleId,
        selectedOrg || undefined,
      );

      if (result.success) {
        toast.success(`Demo login successful as ${roleId}!`);
        navigate("/app/dashboard");
      } else {
        setError(`Demo login failed for ${roleId} role`);
        toast.error(`Demo login failed for ${roleId} role`);
      }
    } catch (err: any) {
      setError(err.message || "Demo login failed");
      toast.error("Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOrgSelect = (orgId: string) => {
    setSelectedOrg(orgId);
    setFormData((prev) => ({ ...prev, organization: orgId }));
    setShowOrgSelector(false);
  };

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setFormData((prev) => ({ ...prev, role: roleId }));
    setShowRoleSelector(false);

    const demoCred = demoCredentials[roleId as keyof typeof demoCredentials];
    if (demoCred) {
      setFormData((prev) => ({
        ...prev,
        email: demoCred.email,
        password: demoCred.password,
      }));
    }
  };

  const getSelectedRole = () => {
    return userRoles.find((role) => role.id === selectedRole);
  };

  const toggleSignupMode = () => {
    setIsSignupMode(!isSignupMode);
    setError("");
    setSelectedRole("");
    setFormData({
      email: "",
      password: "",
      organization: "",
      role: "",
    });
  };

  useEffect(() => {
    const remembered = localStorage.getItem("rememberMe");
    const lastEmail = localStorage.getItem("lastEmail");
    if (remembered && lastEmail) {
      setFormData((prev) => ({ ...prev, email: lastEmail }));
      setRememberMe(true);
    }
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative w-full max-w-4xl">
        <motion.div
          {...fadeInUp}
          className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
        >
          <div className="p-8 md:p-12">
            {/* Header with Toggle */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-75"></div>
                  <div className="relative bg-gray-900 p-3 rounded-xl">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {isSignupMode ? "Create Account" : "Welcome Back"}
                  </h1>
                  <p className="text-blue-300 text-sm">
                    {isSignupMode
                      ? "Join LogSentinel AI today"
                      : "Sign in to your account"}
                  </p>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="inline-flex items-center bg-gray-800/50 rounded-full p-1 mb-8">
                <button
                  onClick={() => setIsSignupMode(false)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    !isSignupMode
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsSignupMode(true)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    isSignupMode
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center space-x-3 p-4 rounded-xl bg-red-900/30 border border-red-800 text-red-200 mb-6"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {!isSignupMode ? (
              /* LOGIN FORM - Role selection removed */
              <>
                {/* ============================================================ */}
                {/* ROLE SELECTION UI - COMMENTED OUT (Auto-detect from backend) */}
                {/* ============================================================ */}
                {/* 
                <div className="mb-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Select Your Role
                    </h3>
                    <p className="text-blue-200 text-sm">
                      Choose the role that matches your responsibilities
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {userRoles.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => handleRoleSelect(role.id)}
                        className={`p-3 rounded-xl border transition-all hover:scale-[1.02] ${
                          selectedRole === role.id
                            ? `border-transparent bg-gradient-to-r ${role.color} bg-opacity-20`
                            : "bg-gray-800/50 border-gray-700 hover:bg-gray-800"
                        }`}
                      >
                        <div className="flex flex-col items-center text-center space-y-2">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              selectedRole === role.id
                                ? `bg-gradient-to-r ${role.color}`
                                : "bg-gray-700"
                            }`}
                          >
                            {role.icon}
                          </div>
                          <p className="text-white text-xs font-medium">
                            {role.name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                */}

                {/* Selected Role Display - COMMENTED OUT */}
                {/* 
                {selectedRole && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6"
                  >
                    <div className={`p-4 rounded-xl bg-gradient-to-r ${getSelectedRole()?.color} bg-opacity-10 border border-white/10`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getSelectedRole()?.color} flex items-center justify-center`}>
                            {getSelectedRole()?.icon}
                          </div>
                          <div>
                            <p className="text-white font-semibold">Selected Role</p>
                            <p className="text-blue-200 text-sm">{getSelectedRole()?.name}</p>
                          </div>
                        </div>
                        <button onClick={() => setSelectedRole("")} className="text-gray-400 hover:text-white transition-colors">
                          ✕
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
                */}

                {/* Standard Login Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-blue-200"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="you@company.com"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-blue-200"
                      >
                        Password
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-12 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="••••••••"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-800"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-blue-200"
                    >
                      Remember me for 30 days
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative w-full flex items-center justify-center space-x-3 py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl">
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-white font-semibold">
                            Signing in...
                          </span>
                        </>
                      ) : (
                        <>
                          <LogIn className="w-5 h-5" />
                          <span className="text-white font-semibold text-lg">
                            Sign In
                          </span>
                        </>
                      )}
                    </div>
                  </button>
                </form>

                {/* Demo Login Button - COMMENTED OUT */}
                {/* 
                {selectedRole && (
                  <button
                    type="button"
                    onClick={() => handleRoleDemoLogin(selectedRole)}
                    disabled={loading}
                    className="w-full mt-4 flex items-center justify-center space-x-3 py-3 px-6 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl text-white font-semibold transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Try Demo Account for {getSelectedRole()?.name}</span>
                  </button>
                )}
                */}

                {/* Sign Up Link */}
                <div className="mt-8 text-center">
                  <p className="text-blue-200">
                    Don't have an account?{" "}
                    <button
                      onClick={toggleSignupMode}
                      className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </>
            ) : (
              /* SIGN UP MODE – unchanged */
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Join LogSentinel AI
                  </h2>
                  <p className="text-blue-200 mb-8">
                    Create your account to start monitoring with AI-powered
                    insights
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-blue-300" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          Enterprise Security
                        </h3>
                        <p className="text-blue-200 text-sm">
                          Bank-level encryption and security protocols
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-violet-600/20 rounded-xl flex items-center justify-center">
                        <BarChart className="w-6 h-6 text-purple-300" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          AI-Powered Insights
                        </h3>
                        <p className="text-blue-200 text-sm">
                          Predictive analytics and anomaly detection
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-xl flex items-center justify-center">
                        <Activity className="w-6 h-6 text-green-300" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          Real-time Monitoring
                        </h3>
                        <p className="text-blue-200 text-sm">
                          Monitor logs and metrics in real-time
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500/20 to-red-600/20 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-orange-300" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          Team Collaboration
                        </h3>
                        <p className="text-blue-200 text-sm">
                          Share dashboards and collaborate with your team
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <Link to="/signup" className="w-full relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative w-full flex items-center justify-center space-x-3 py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 shadow-lg hover:shadow-xl">
                      <UserPlus className="w-5 h-5" />
                      <span className="text-white font-semibold text-lg">
                        Create Free Account
                      </span>
                    </div>
                  </Link>

                  <button
                    onClick={toggleSignupMode}
                    className="w-full py-3 px-6 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-xl text-white font-medium transition-all duration-200 hover:shadow-lg"
                  >
                    Already have an account? Sign in
                  </button>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-800/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">
                        14-Day Free Trial
                      </p>
                      <p className="text-blue-300 text-sm">
                        No credit card required
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">$0</p>
                      <p className="text-blue-300 text-sm">Start today</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Back to Home */}
            <div className="mt-8 text-center">
              <Link
                to="/"
                className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors group"
              >
                <span className="mr-2">←</span>
                Back to homepage
                <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  🏠
                </span>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-pink-900/30 border-t border-white/10">
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">Secure Login</span>
              </div>
              <div className="h-4 w-px bg-gray-700"></div>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">24/7 Support</span>
              </div>
              <div className="h-4 w-px bg-gray-700"></div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">GDPR Compliant</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
