import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, TrendingUp } from "lucide-react";

export default function Earnings() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

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
      <header className="bg-black border-b-2 border-[#ffd700] py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-[#111] rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-[#ffd700]">My Earnings</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-[#111] border-[#222] p-6 text-center">
            <div className="text-3xl font-bold text-[#ffd700] mb-2">₹0</div>
            <div className="text-gray-400">Total Earnings</div>
          </Card>
          <Card className="bg-[#111] border-[#222] p-6 text-center">
            <div className="text-3xl font-bold text-[#00ff88] mb-2">₹0</div>
            <div className="text-gray-400">This Month</div>
          </Card>
          <Card className="bg-[#111] border-[#222] p-6 text-center">
            <div className="text-3xl font-bold text-[#ffd700] mb-2">0%</div>
            <div className="text-gray-400">Avg ROI</div>
          </Card>
        </div>

        <Card className="bg-[#111] border-[#222] p-6">
          <h3 className="text-xl font-bold text-[#ffd700] mb-4">Earning History</h3>
          <div className="text-center py-8 text-gray-400">
            No earnings yet. Start investing to earn passive income.
          </div>
        </Card>
      </div>
    </div>
  );
}
