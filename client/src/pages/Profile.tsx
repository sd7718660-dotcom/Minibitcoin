import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, Edit2, Upload } from "lucide-react";
import { useState } from "react";

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const [isEditing, setIsEditing] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Button onClick={() => navigate("/")} className="bg-[#00ff88]">
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <header className="bg-black border-b-2 border-[#ffd700] py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-[#111] rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-[#ffd700]">My Profile</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Profile Card */}
        <Card className="bg-[#111] border-[#222] p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Picture */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-gradient-to-br from-[#ffd700] to-[#00ff88] rounded-full flex items-center justify-center text-4xl font-bold text-black mb-4">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <Button
                className="bg-[#ffd700] text-black hover:bg-[#ffed4e] flex gap-2"
                size="sm"
              >
                <Upload className="w-4 h-4" />
                Upload Photo
              </Button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">{user?.name}</h2>
                <p className="text-gray-400">{user?.email}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#222]">
                  <div className="text-sm text-gray-400 mb-1">Phone</div>
                  <div className="text-lg font-bold">
                    {user?.phone || "Not set"}
                  </div>
                </div>
                <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#222]">
                  <div className="text-sm text-gray-400 mb-1">Gaming Name</div>
                  <div className="text-lg font-bold">
                    {user?.gamingName || "Not set"}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-[#00ff88] text-black hover:bg-[#00dd77] flex gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#111] border-[#222] p-6 text-center">
            <div className="text-3xl font-bold text-[#ffd700] mb-2">₹0</div>
            <div className="text-gray-400">Wallet Balance</div>
          </Card>
          <Card className="bg-[#111] border-[#222] p-6 text-center">
            <div className="text-3xl font-bold text-[#00ff88] mb-2">₹0</div>
            <div className="text-gray-400">Total Invested</div>
          </Card>
          <Card className="bg-[#111] border-[#222] p-6 text-center">
            <div className="text-3xl font-bold text-[#ffd700] mb-2">₹0</div>
            <div className="text-gray-400">Total Profit</div>
          </Card>
          <Card className="bg-[#111] border-[#222] p-6 text-center">
            <div className="text-3xl font-bold text-[#00ff88] mb-2">₹0</div>
            <div className="text-gray-400">Total Loss</div>
          </Card>
        </div>

        {/* Payment Methods */}
        <Card className="bg-[#111] border-[#222] p-6 mb-6">
          <h3 className="text-xl font-bold text-[#ffd700] mb-4">
            Payment Methods
          </h3>

          <div className="space-y-4">
            {/* UPI ID */}
            <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#222]">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-400">UPI ID (For Winnings)</div>
                <Button
                  size="sm"
                  className="bg-[#ffd700] text-black hover:bg-[#ffed4e]"
                >
                  Update
                </Button>
              </div>
              <div className="text-lg font-mono">
                {user?.upiId ? `${user.upiId.substring(0, 3)}****${user.upiId.substring(user.upiId.length - 4)}` : "Not set"}
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#222]">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-400">Payment QR Code</div>
                <Button
                  size="sm"
                  className="bg-[#ffd700] text-black hover:bg-[#ffed4e]"
                >
                  Upload
                </Button>
              </div>
              <div className="text-lg">
                {user?.qrUrl ? "✅ QR Code Uploaded" : "❌ No QR Code"}
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={() => navigate("/wallet")}
            className="bg-[#00ff88] text-black hover:bg-[#00dd77] flex-1"
          >
            Go to Wallet
          </Button>
          <Button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="bg-[#ff4444] text-white hover:bg-[#ff2222] flex-1"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
