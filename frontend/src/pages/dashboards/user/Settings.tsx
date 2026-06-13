// src/pages/dashboards/user/Settings.tsx
import React, { useState, useEffect } from "react";
import {
  Save,
  Key,
  Bell,
  Moon,
  Sun,
  User,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { userApi } from "../../../services/api/user";
const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [notifications, setNotifications] = useState(
    user?.notifications ?? true,
  );
  const [darkMode, setDarkMode] = useState(user?.darkMode ?? true);
  const [twoFactor, setTwoFactor] = useState(user?.twoFactor ?? false);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [loadingApiKeys, setLoadingApiKeys] = useState(true);

  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const response = await userApi.getApiKeys();
        setApiKeys(response.data || []);
      } catch (err) {
        console.error("Failed to fetch API keys", err);
      } finally {
        setLoadingApiKeys(false);
      }
    };
    fetchApiKeys();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      if (updateProfile) {
        await updateProfile({
          name,
          email,
          notifications,
          darkMode,
          twoFactor,
        });
        setMessage({ type: "success", text: "Profile updated successfully" });
      } else {
        throw new Error("updateProfile not available");
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters",
      });
      return;
    }
    setChangingPassword(true);
    try {
      await userApi.changePassword({ currentPassword, newPassword });
      setMessage({ type: "success", text: "Password changed successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Failed to change password",
      });
    } finally {
      setChangingPassword(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const generateApiKey = async () => {
    if (!newKeyName.trim()) return;
    try {
      const response = await userApi.createApiKey({ name: newKeyName });
      setApiKeys([...apiKeys, response.data]);
      setNewKeyName("");
      setMessage({ type: "success", text: "API key generated" });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to generate key" });
    }
  };

  const revokeApiKey = async (id: string) => {
    if (
      !window.confirm("Revoke this API key? It will stop working immediately.")
    )
      return;
    try {
      await userApi.revokeApiKey(id);
      setApiKeys(apiKeys.filter((k) => k.id !== id));
      setMessage({ type: "success", text: "API key revoked" });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to revoke key" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-blue-200">
          Manage your account, security, and preferences
        </p>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg ${
            message.type === "success"
              ? "bg-green-900/50 text-green-300 border border-green-700"
              : "bg-red-900/50 text-red-300 border border-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" /> Profile Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />{" "}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-green-400" /> Security
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Current Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="text-sm text-blue-400"
              >
                {showPassword ? "Hide" : "Show"} passwords
              </button>
              <button
                onClick={handleChangePassword}
                disabled={changingPassword || !currentPassword || !newPassword}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white disabled:opacity-50"
              >
                {changingPassword ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-400" /> Preferences
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-white font-medium">
                  Email Notifications
                </div>
                <div className="text-xs text-gray-400">
                  Receive alerts for critical events
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative w-12 h-6 rounded-full transition-colors ${notifications ? "bg-blue-600" : "bg-gray-600"}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications ? "right-1" : "left-1"}`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-white font-medium">Dark Mode</div>
                <div className="text-xs text-gray-400">
                  Switch between light and dark theme
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 bg-gray-700 rounded-lg"
              >
                {darkMode ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-white font-medium">
                  Two-Factor Authentication
                </div>
                <div className="text-xs text-gray-400">
                  Add an extra layer of security
                </div>
              </div>
              <button
                onClick={() => setTwoFactor(!twoFactor)}
                className={`relative w-12 h-6 rounded-full transition-colors ${twoFactor ? "bg-blue-600" : "bg-gray-600"}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${twoFactor ? "right-1" : "left-1"}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-purple-400" /> API Keys
          </h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Key name (e.g., CI/CD)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white"
            />
            <button
              onClick={generateApiKey}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white"
            >
              Generate
            </button>
          </div>
          {loadingApiKeys ? (
            <div className="text-center text-gray-400">Loading API keys...</div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center text-gray-400">
              No API keys yet. Generate your first key.
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg"
                >
                  <div>
                    <div className="text-white font-medium">{key.name}</div>
                    <code className="text-xs text-gray-400">{key.key}</code>
                    <div className="text-xs text-gray-500">
                      Created: {new Date(key.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => revokeApiKey(key.id)}
                    className="px-3 py-1 bg-red-600/50 hover:bg-red-600 rounded-lg text-sm"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
