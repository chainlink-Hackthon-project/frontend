'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, DollarSign, Globe, Shield, Zap, BarChart3, Wallet, PiggyBank, Target, CheckCircle, Clock } from 'lucide-react';
import WalletConnectionModal from '@/components/ConnectWalletComponent';

const LenderPage = () => {
  const [currentPool, setCurrentPool] = useState(0);
  const [earnings, setEarnings] = useState(1000);

  const pools = [
    { name: 'USDT Pool', chain: 'Avalanche', apy: '12.5%', tvl: '$45.2M', color: 'bg-red-500', risk: 'Low' },
    { name: 'USDC Pool', chain: 'Polygon', apy: '9.8%', tvl: '$32.1M', color: 'bg-purple-500', risk: 'Low' },
    { name: 'DAI Pool', chain: 'Ethereum', apy: '11.2%', tvl: '$28.7M', color: 'bg-blue-500', risk: 'Medium' },
    { name: 'BUSD Pool', chain: 'BSC', apy: '10.5%', tvl: '$19.4M', color: 'bg-yellow-500', risk: 'Low' }
  ];

  const benefits = [
    { icon: TrendingUp, title: 'High Yields', desc: 'Earn up to 15% APY on your digital assets', color: 'text-green-500' },
    { icon: Shield, title: 'Secure Protocol', desc: 'Audited smart contracts with insurance coverage', color: 'text-blue-500' },
    { icon: Globe, title: 'Multi-Chain', desc: 'Diversify across 5+ blockchain networks', color: 'text-purple-500' },
    { icon: Zap, title: 'Instant Deposits', desc: 'Start earning immediately with no lock-up period', color: 'text-orange-500' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPool((prev) => (prev + 1) % pools.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const earningsInterval = setInterval(() => {
      setEarnings(prev => prev + Math.random() * 0.1);
    }, 2000);

    return () => clearInterval(earningsInterval);
  }, []);

  const YieldCard = ({ pool, isActive, index }) => (
    <Card className={`transition-all duration-500 border-2 ${
      isActive 
        ? 'border-primary shadow-lg scale-105 bg-primary/5' 
        : 'border-muted hover:border-primary/50'
    }`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 ${pool.color} rounded-full ${isActive ? 'animate-pulse' : ''}`} />
            <div>
              <div className="font-semibold">{pool.name}</div>
              <div className="text-sm text-muted-foreground">{pool.chain}</div>
            </div>
          </div>
          <Badge variant={pool.risk === 'Low' ? 'secondary' : 'outline'} className="text-xs">
            {pool.risk} Risk
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">APY</span>
            <span className="font-bold text-green-500 text-lg">{pool.apy}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">TVL</span>
            <span className="font-medium">{pool.tvl}</span>
          </div>
        </div>
        
        {isActive && (
          <div className="mt-4 p-3 bg-primary/10 rounded-lg">
            <div className="text-xs text-primary font-medium text-center animate-pulse">
              Currently Featured Pool
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Money Icons */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-bounce opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <DollarSign className="w-6 h-6 text-green-500" />
          </div>
        ))}

        {/* Yield Growth Chart Background */}
        <div className="absolute bottom-10 right-10 w-64 h-32 opacity-5">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            <path
              d="M10,80 C30,70 50,60 70,45 C90,30 110,35 130,25 C150,15 170,20 190,10"
              fill="none"
              stroke="rgb(34, 197, 94)"
              strokeWidth="3"
              className="animate-pulse"
            />
          </svg>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            <PiggyBank className="w-4 h-4 mr-2" />
            Cross-Chain Lending
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-green-500 via-foreground to-emerald-600 bg-clip-text text-transparent">
            Earn While You Sleep
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Lend your crypto assets across multiple blockchain networks and earn attractive yields. 
            Your funds work harder while you enjoy passive income from DeFi protocols.
          </p>
        </div>

        {/* Live Earnings Counter */}
        <Card className="max-w-md mx-auto mb-12 border-2 border-green-500/20 bg-green-500/5">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500 animate-pulse" />
              <span className="text-sm font-medium text-green-500">Live Earnings Demo</span>
            </div>
            <div className="text-3xl font-bold text-green-500 mb-1">
              ${earnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Simulated earnings from $10,000 deposit
            </p>
          </CardContent>
        </Card>

        {/* Pool Showcase */}
        <div className="mb-16">
          <Card className="max-w-5xl mx-auto border-2 border-primary/20 bg-card/50 backdrop-blur">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Featured Lending Pools
              </CardTitle>
              <p className="text-muted-foreground">
                Diversify across multiple chains for optimal risk-adjusted returns
              </p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {pools.map((pool, index) => (
                  <YieldCard 
                    key={pool.name} 
                    pool={pool} 
                    isActive={currentPool === index}
                    index={index}
                  />
                ))}
              </div>

              {/* Pool Rotation Indicator */}
              <div className="flex justify-center gap-2">
                {pools.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentPool === index ? 'bg-primary scale-125' : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">How Lending Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: 1, title: 'Deposit Assets', desc: 'Transfer your crypto to our secure lending pools', icon: Wallet },
              { step: 2, title: 'Earn Interest', desc: 'Your assets are lent to borrowers at competitive rates', icon: TrendingUp },
              { step: 3, title: 'Withdraw Anytime', desc: 'Access your funds plus earned interest 24/7', icon: Target }
            ].map(({ step, title, desc, icon: Icon }) => (
              <Card key={step} className="text-center group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="w-8 h-8 mx-auto mb-3 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                    {step}
                  </div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose Our Platform</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {benefits.map(({ icon: Icon, title, desc, color }) => (
              <Card key={title} className="group hover:shadow-lg transition-all duration-300 border-muted hover:border-primary/30">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-muted/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className={`w-8 h-8 ${color}`} />
                  </div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Portfolio Simulation */}
        <Card className="max-w-3xl mx-auto mb-12 border-2 border-dashed border-primary/30">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Potential Earnings Calculator</CardTitle>
            <p className="text-muted-foreground">See how much you could earn with different deposit amounts</p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {[
                { amount: '$1,000', daily: '$0.34', monthly: '$10.42', yearly: '$125' },
                { amount: '$10,000', daily: '$3.42', monthly: '$104.17', yearly: '$1,250' },
                { amount: '$50,000', daily: '$17.12', monthly: '$520.83', yearly: '$6,250' }
              ].map(({ amount, daily, monthly, yearly }) => (
                <Card key={amount} className="text-center border-green-500/20 hover:border-green-500/40 transition-colors">
                  <CardContent className="p-4">
                    <div className="text-lg font-bold text-primary mb-2">{amount}</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Daily:</span>
                        <span className="font-medium text-green-500">{daily}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly:</span>
                        <span className="font-medium text-green-500">{monthly}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Yearly:</span>
                        <span className="font-bold text-green-500">{yearly}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Hidden Input Field */}
            <div className="hidden">
              <input 
                type="number" 
                placeholder="Enter deposit amount..." 
                className="w-full p-4 border rounded-lg"
              />
            </div>

            <div className="text-center">
              <Button size="lg" className="group">
                <Wallet className="w-5 h-5 mr-2" />

                <WalletConnectionModal userType = "lender" />
                
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                *Calculations based on 12.5% average APY. Returns may vary.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-green-500">$125M+</div>
            <div className="text-xs text-muted-foreground">Total Value Locked</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-green-500">12.5%</div>
            <div className="text-xs text-muted-foreground">Average APY</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-green-500">99.9%</div>
            <div className="text-xs text-muted-foreground">Uptime</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-green-500">25K+</div>
            <div className="text-xs text-muted-foreground">Active Lenders</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LenderPage;
