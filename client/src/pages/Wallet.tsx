import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft, Plus, Send } from "lucide-react";

export default function Wallet() {
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
          <h1 className="text-2xl font-bold text-[#ffd700]">My Wallet</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card className="bg-[#111] border-[#222] p-8 mb-6">
          <div className="text-center mb-8">
            <div className="text-5xl font-bold text-[#ffd700] mb-2">₹0.00</div>
            <div className="text-gray-400">Available Balance</div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Button className="bg-[#00ff88] text-black hover:bg-[#00dd77] py-6 flex gap-2 justify-center">
              <Plus className="w-5 h-5" />
              Add Fund
            </Button>
            <Button className="bg-[#ffd700] text-black hover:bg-[#ffed4e] py-6 flex gap-2 justify-center">
              <Send className="w-5 h-5" />
              Withdraw
            </Button>
          </div>
        </Card>

        <Card className="bg-[#111] border-[#222] p-6">
          <h3 className="text-xl font-bold text-[#ffd700] mb-4">Transaction History</h3>
          <div className="text-center py-8 text-gray-400">
            No transactions yet
          </div>
        </Card>
      </div>
    </div>
  );
}
