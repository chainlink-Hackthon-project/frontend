import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Coins, TrendingUp, Shield, Zap, Globe, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const SelectUser = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const router = useRouter();

  const chains = [
    { name: 'Ethereum', color: 'bg-blue-500', delay: '0s' },
    { name: 'Polygon', color: 'bg-purple-500', delay: '0.5s' },
    { name: 'BSC', color: 'bg-yellow-500', delay: '1s' },
    { name: 'Avalanche', color: 'bg-red-500', delay: '1.5s' },
    { name: 'Arbitrum', color: 'bg-blue-400', delay: '2s' },
  ];

  const handleUserTypeSelect = (userType) => {
    // Add your navigation logic here
    console.log(`Selected: ${userType}`);
    router.push(`/${userType}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Chain Icons */}
        {chains.map((chain, index) => (
          <div
            key={chain.name}
            className={`absolute w-3 h-3 ${chain.color} rounded-full opacity-20 animate-bounce`}
            style={{
              left: `${20 + index * 15}%`,
              top: `${30 + (index % 2) * 40}%`,
              animationDelay: chain.delay,
              animationDuration: '3s'
            }}
          />
        ))}
        
        {/* Cross-chain Connection Lines */}
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2">
          <svg className="w-full h-full opacity-10" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(59, 130, 246)" />
                <stop offset="100%" stopColor="rgb(147, 51, 234)" />
              </linearGradient>
            </defs>
            <path
              d="M20,100 Q100,20 180,100 Q100,180 20,100"
              fill="none"
              stroke="url(#gradient1)"
              strokeWidth="2"
              className="animate-pulse"
            />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <Globe className="w-4 h-4" />
            Cross-Chain DeFi Platform
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
            Choose Your Path
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Enter the future of decentralized finance. Lend your assets to earn yield or borrow against your collateral across multiple blockchains.
          </p>

          {/* Chain Network Display */}
          <div className="flex justify-center items-center gap-4 mt-8">
            {chains.slice(0, 4).map((chain, index) => (
              <div key={chain.name} className="flex items-center gap-2">
                <div className={`w-2 h-2 ${chain.color} rounded-full animate-pulse`} 
                     style={{ animationDelay: `${index * 0.2}s` }} />
                {index < 3 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </div>

        {/* User Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Borrower Card */}
          <Card 
            className={`group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl border-2 hover:border-primary/50 relative overflow-hidden ${
              hoveredCard === 'borrower' ? 'shadow-2xl border-primary/50 scale-105' : ''
            }`}
            onMouseEnter={() => setHoveredCard('borrower')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleUserTypeSelect('borrower')}
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <CardContent className="p-8 relative z-10">
              <div className="text-center space-y-6">
                {/* Icon */}
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping group-hover:animate-pulse" />
                  <div className="relative z-10 w-full h-full bg-blue-500/10 rounded-full flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <TrendingUp className="w-10 h-10 text-blue-500" />
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-foreground group-hover:text-blue-500 transition-colors">
                  I'm a Borrower
                </h2>

                {/* Description */}
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Access instant liquidity by borrowing against your crypto assets across multiple chains. Get competitive rates with flexible terms.
                </p>

                {/* Features */}
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span>Collateralized borrowing</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span>Instant cross-chain access</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Coins className="w-4 h-4 text-blue-500" />
                    <span>Multiple asset support</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button 
                size={"lg"}
                  className="w-full group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 text-lg py-6"
                  variant="outline"
                >
                  Start Borrowing
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lender Card */}
          <Card 
            className={`group cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl border-2 hover:border-primary/50 relative overflow-hidden ${
              hoveredCard === 'lender' ? 'shadow-2xl border-primary/50 scale-105' : ''
            }`}
            onMouseEnter={() => setHoveredCard('lender')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleUserTypeSelect('lender')}
          >
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <CardContent className="p-8 relative z-10">
              <div className="text-center space-y-6">
                {/* Icon */}
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping group-hover:animate-pulse" />
                  <div className="relative z-10 w-full h-full bg-green-500/10 rounded-full flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                    <Coins className="w-10 h-10 text-green-500" />
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-foreground group-hover:text-green-500 transition-colors">
                  I'm a Lender
                </h2>

                {/* Description */}
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Earn attractive yields by providing liquidity to borrowers. Diversify across chains and maximize your DeFi returns safely.
                </p>

                {/* Features */}
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>High yield opportunities</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Secure & audited protocols</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="w-4 h-4 text-green-500" />
                    <span>Cross-chain diversification</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button 
                size={"lg"}
                  className="w-full group-hover:bg-green-500 group-hover:text-white transition-all duration-300 text-lg py-6"
                  variant="outline"
                >
                  Start Lending
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">$2.5B+</div>
            <div className="text-sm text-muted-foreground">Total Value Locked</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">50K+</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">12%</div>
            <div className="text-sm text-muted-foreground">Average APY</div>
          </div>
        </div>
      </div>
    </div>
  );
};