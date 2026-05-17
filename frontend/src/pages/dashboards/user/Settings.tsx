import React, { useState, useEffect } from "react";
import { Save, Key, Bell, Moon, Sun, User, Mail, Shield } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { userApi } from "../services/api";

const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [apiKeys, setApiKeys] = useState<
    { id: string; name: string; key: string }[]
  >([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const response = await userApi.getApiKeys();
      setApiKeys(response.data || []);
    } catch (err) {
      console.error("Failed to fetch API keys", err);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({ name, email });
      setMessage({ type: "success", text: "Profile updated successfully" });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setSaving(false);
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
        <p className="text-blue-200">Manage your account and preferences</p>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg ${
            message.type === "success"
              ? "bg-green-900/50 text-green-300"
              : "bg-red-900/50 text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Section */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5" /> Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2"
            >
              <Save className="w-4 h-4" />{" "}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" /> Notifications
          </h2>
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-300">
              Email alerts for critical events
            </span>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notifications ? "bg-blue-600" : "bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  notifications ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-300">Dark mode</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 bg-gray-700 rounded-lg"
            >
              {darkMode ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* API Keys */}
        <div className="lg:col-span-2 bg-gray-800/50 rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Key className="w-5 h-5" /> API Keys
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
          {apiKeys.length === 0 ? (
            <div className="text-gray-400 text-sm">No API keys yet.</div>
          ) : (
            <div className="space-y-2">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg"
                >
                  <div>
                    <div className="text-white font-medium">{key.name}</div>
                    <code className="text-xs text-gray-400">{key.key}</code>
                  </div>
                  <button
                    onClick={() => revokeApiKey(key.id)}
                    className="px-2 py-1 bg-red-600/50 hover:bg-red-600 rounded text-sm"
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
