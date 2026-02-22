import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (!isAuthenticated || user?.role !== "admin") {
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
      <header className="bg-black border-b-2 border-[#ffd700] py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-[#111] rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-[#ffd700]">Admin Dashboard</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111] border border-[#222] p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-[#ffd700]">0</div>
            <div className="text-gray-400 mt-2">Total Users</div>
          </div>
          <div className="bg-[#111] border border-[#222] p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-[#00ff88]">0</div>
            <div className="text-gray-400 mt-2">Pending Payments</div>
          </div>
          <div className="bg-[#111] border border-[#222] p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-[#ffd700]">₹0</div>
            <div className="text-gray-400 mt-2">Total Balance</div>
          </div>
          <div className="bg-[#111] border border-[#222] p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-[#00ff88]">0</div>
            <div className="text-gray-400 mt-2">Active Tournaments</div>
          </div>
        </div>

        <div className="bg-[#111] border border-[#222] p-6 rounded-lg text-center py-16">
          <div className="text-gray-400">Admin panel features coming soon</div>
        </div>
      </div>
    </div>
  );
}
