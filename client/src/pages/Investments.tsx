import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, TrendingUp } from "lucide-react";

export default function Investments() {
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
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-[#111] rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-[#ffd700]">Investment Plans</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Silver", min: 1000, max: 10000, roi: 5, days: 30 },
            { name: "Gold", min: 10000, max: 100000, roi: 10, days: 60 },
            { name: "Platinum", min: 100000, max: 1000000, roi: 15, days: 90 },
          ].map((plan) => (
            <Card key={plan.name} className="bg-[#111] border-[#222] p-6 hover:border-[#ffd700] transition">
              <h3 className="text-2xl font-bold text-[#ffd700] mb-4">{plan.name}</h3>
              <div className="space-y-3 mb-6">
                <div>
                  <div className="text-sm text-gray-400">Min - Max</div>
                  <div className="font-bold">₹{plan.min} - ₹{plan.max}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">ROI</div>
                  <div className="font-bold text-[#00ff88]">{plan.roi}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Lock-in Period</div>
                  <div className="font-bold">{plan.days} Days</div>
                </div>
              </div>
              <Button className="w-full bg-[#00ff88] text-black hover:bg-[#00dd77]">
                <TrendingUp className="w-4 h-4 mr-2" />
                Invest Now
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
