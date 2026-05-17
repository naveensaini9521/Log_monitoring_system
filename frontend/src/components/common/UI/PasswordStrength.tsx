// src/components/common/UI/PasswordStrength.jsx
import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

const PasswordStrength = ({ password }) => {
  const getStrength = (pass) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getStrength(password);
  const getStrengthLabel = () => {
    if (strength === 0) return "Weak";
    if (strength <= 2) return "Fair";
    if (strength === 3) return "Good";
    return "Strong";
  };

  const getStrengthColor = () => {
    if (strength === 0) return "bg-red-500";
    if (strength <= 2) return "bg-yellow-500";
    if (strength === 3) return "bg-blue-500";
    return "bg-green-500";
  };

  const checks = [
    { label: "At least 8 characters", regex: /.{8,}/ },
    { label: "Contains uppercase letter", regex: /[A-Z]/ },
    { label: "Contains number", regex: /[0-9]/ },
    { label: "Contains special character", regex: /[^A-Za-z0-9]/ },
  ];

  return (
    <div className="mt-3 space-y-3">
      {/* Strength Bar */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-blue-300">Password strength:</span>
        <span className="text-xs font-medium text-white">
          {getStrengthLabel()}
        </span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${getStrengthColor()} transition-all duration-500`}
          style={{ width: `${(strength / 4) * 100}%` }}
        />
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-2">
        {checks.map((check, index) => {
          const isMet = check.regex.test(password);
          return (
            <div key={index} className="flex items-center space-x-2">
              {isMet ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-500" />
              )}
              <span
                className={`text-xs ${isMet ? "text-green-400" : "text-gray-400"}`}
              >
                {check.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordStrength;
