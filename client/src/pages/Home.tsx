import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { DollarSign, Wallet, TrendingUp, Users } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-black border-b-2 border-[#ffd700] shadow-lg shadow-[#ffd700]/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#ffd700] to-[#00ff88] rounded-lg flex items-center justify-center font-bold text-black">
              MB
            </div>
            <h1 className="text-2xl font-bold text-[#ffd700]">MINIBITCOIN</h1>
          </div>

          <nav className="hidden md:flex gap-6">
            <button
              onClick={() => navigate("/wallet")}
              className="hover:text-[#00ff88] transition"
            >
              Wallet
            </button>
            <button
              onClick={() => navigate("/investments")}
              className="hover:text-[#00ff88] transition"
            >
              Investments
            </button>
            <button
              onClick={() => navigate("/earnings")}
              className="hover:text-[#00ff88] transition"
            >
              Earnings
            </button>
          </nav>

          <div className="flex gap-3">
            {isAuthenticated ? (
              <>
                <Button
                  onClick={() => navigate("/profile")}
                  className="bg-[#00ff88] text-black hover:bg-[#00dd77]"
                >
                  Profile
                </Button>
                <Button
                  onClick={() => navigate("/wallet")}
                  className="bg-[#ffd700] text-black hover:bg-[#ffed4e]"
                >
                  Wallet
                </Button>
              </>
            ) : (
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                className="bg-[#00ff88] text-black hover:bg-[#00dd77]"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ffd700]/5 to-[#00ff88]/5" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-[#ffd700]">Earn</span> +{" "}
            <span className="text-[#00ff88]">Invest</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Grow your wealth through smart investments and passive earning opportunities.
            Join thousands of investors building their financial future.
          </p>
            {!isAuthenticated && (
              <Button
                onClick={() => (window.location.href = getLoginUrl())}
                size="lg"
                className="bg-[#00ff88] text-black hover:bg-[#00dd77] text-lg px-8 py-6"
              >
                Get Started Now
              </Button>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-4 gap-6 mt-16">
            <Card className="bg-[#111] border-[#222] p-6 hover:border-[#ffd700] transition">
              <DollarSign className="w-12 h-12 text-[#ffd700] mb-4" />
              <h3 className="text-xl font-bold mb-2">Passive Income</h3>
              <p className="text-gray-400">
                Earn money without active work through investments
              </p>
            </Card>

            <Card className="bg-[#111] border-[#222] p-6 hover:border-[#00ff88] transition">
              <Wallet className="w-12 h-12 text-[#00ff88] mb-4" />
              <h3 className="text-xl font-bold mb-2">Secure Wallet</h3>
              <p className="text-gray-400">
                Manage funds with instant deposits and withdrawals
              </p>
            </Card>

            <Card className="bg-[#111] border-[#222] p-6 hover:border-[#ffd700] transition">
              <TrendingUp className="w-12 h-12 text-[#ffd700] mb-4" />
              <h3 className="text-xl font-bold mb-2">Investment Plans</h3>
              <p className="text-gray-400">
                Multiple plans with different ROI and lock-in periods
              </p>
            </Card>

            <Card className="bg-[#111] border-[#222] p-6 hover:border-[#00ff88] transition">
              <Users className="w-12 h-12 text-[#00ff88] mb-4" />
              <h3 className="text-xl font-bold mb-2">Community</h3>
              <p className="text-gray-400">
                Connect with thousands of investors worldwide
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {isAuthenticated && user && (
        <section className="py-16 px-4 bg-[#0a0a0a] border-t border-[#222]">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl font-bold mb-8 text-center text-[#ffd700]">
              Your Dashboard
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-[#111] border border-[#222] rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-[#ffd700] mb-2">
                  ₹0
                </div>
                <div className="text-gray-400">Wallet Balance</div>
              </div>
              <div className="bg-[#111] border border-[#222] rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-[#00ff88] mb-2">
                  0
                </div>
                <div className="text-gray-400">Active Investments</div>
              </div>
              <div className="bg-[#111] border border-[#222] rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-[#ffd700] mb-2">
                  ₹0
                </div>
                <div className="text-gray-400">Total Invested</div>
              </div>
              <div className="bg-[#111] border border-[#222] rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-[#00ff88] mb-2">
                  ₹0
                </div>
                <div className="text-gray-400">Total Profit</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#ffd700]/10 to-[#00ff88]/10 border-t border-[#222]">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-6">Ready to Start Investing?</h3>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of investors earning passive income through smart
            investment plans
          </p>
          {!isAuthenticated && (
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              size="lg"
              className="bg-[#00ff88] text-black hover:bg-[#00dd77] text-lg px-8 py-6"
            >
              Sign Up Now
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-[#222] py-8 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-500">
          <p>&copy; 2026 Minibitcoin. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
