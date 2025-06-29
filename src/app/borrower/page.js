'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Shield, Zap, TrendingDown, Clock, Lock, Unlock, ChevronDown, Info, CheckCircle } from 'lucide-react';
import WalletConnectionModal from '@/components/ConnectWalletComponent';

 const BorrowerPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    "Deposit ETH Collateral",
    "Cross-Chain Bridge",
    "Receive USDT on Avalanche"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => (prev + 1) % steps.length);
        setIsAnimating(false);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const CollateralCard = ({ isActive, delay = "0s" }) => (
    <div 
      className={`relative transition-all duration-1000 ${isActive ? 'scale-110 opacity-100' : 'scale-100 opacity-70'}`}
      style={{ animationDelay: delay }}
    >
      <div className="absolute inset-0 bg-blue-500/10 rounded-xl animate-pulse" />
      <Card className="relative z-10 border-blue-500/30 bg-card/80 backdrop-blur">
        <CardContent className="p-4 text-center">
          <div className="w-12 h-12 mx-auto mb-2 bg-blue-500/20 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-blue-500 rounded-full" />
          </div>
          <div className="text-sm font-medium">ETH</div>
          <div className="text-xs text-muted-foreground">Ethereum</div>
        </CardContent>
      </Card>
    </div>
  );

  const LoanCard = ({ isActive, delay = "0s" }) => (
    <div 
      className={`relative transition-all duration-1000 ${isActive ? 'scale-110 opacity-100' : 'scale-100 opacity-70'}`}
      style={{ animationDelay: delay }}
    >
      <div className="absolute inset-0 bg-red-500/10 rounded-xl animate-pulse" />
      <Card className="relative z-10 border-red-500/30 bg-card/80 backdrop-blur">
        <CardContent className="p-4 text-center">
          <div className="w-12 h-12 mx-auto mb-2 bg-red-500/20 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-red-500 rounded-full" />
          </div>
          <div className="text-sm font-medium">USDT</div>
          <div className="text-xs text-muted-foreground">Avalanche</div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}

        {/* Cross-chain Bridge Visual */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-5">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
              <linearGradient id="bridgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(59, 130, 246)" />
                <stop offset="100%" stopColor="rgb(239, 68, 68)" />
              </linearGradient>
            </defs>
            <path
              d="M20,100 C60,60 140,60 180,100"
              fill="none"
              stroke="url(#bridgeGradient)"
              strokeWidth="4"
              className="animate-pulse"
            />
            <circle cx="20" cy="100" r="8" fill="rgb(59, 130, 246)" className="animate-pulse" />
            <circle cx="180" cy="100" r="8" fill="rgb(239, 68, 68)" className="animate-pulse" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            <Lock className="w-4 h-4 mr-2" />
            Cross-Chain Borrowing
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-foreground to-red-500 bg-clip-text text-transparent">
            Unlock Liquidity
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Deposit ETH as collateral on Ethereum and instantly receive USDT loans on Avalanche. 
            Experience seamless cross-chain DeFi borrowing with competitive rates.
          </p>
        </div>

        {/* Main Process Visualization */}
        <div className="mb-16">
          <Card className="max-w-4xl mx-auto border-2 border-primary/20 bg-card/50 backdrop-blur">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">How Cross-Chain Borrowing Works</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {/* Process Steps */}
              <div className="flex items-center justify-between mb-8 relative">
                {steps.map((step, index) => (
                  <div key={step} className="flex flex-col items-center relative z-10">
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-2 transition-all duration-500 ${
                      currentStep === index 
                        ? 'border-primary bg-primary text-primary-foreground scale-110' 
                        : currentStep > index 
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-muted-foreground text-muted-foreground'
                    }`}>
                      {currentStep > index ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <span className="font-bold">{index + 1}</span>
                      )}
                    </div>
                    <span className={`text-sm text-center transition-colors ${
                      currentStep === index ? 'text-primary font-medium' : 'text-muted-foreground'
                    }`}>
                      {step}
                    </span>
                  </div>
                ))}
                
                {/* Progress Line */}
                <div className="absolute top-6 left-6 right-6 h-0.5 bg-muted-foreground/20">
                  <div 
                    className="h-full bg-primary transition-all duration-1000 ease-in-out"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Visual Bridge */}
              <div className="flex items-center justify-between px-8 mb-8">
                <CollateralCard isActive={currentStep >= 0} />
                
                {/* Bridge Animation */}
                <div className="flex-1 mx-8 relative">
                  <div className="h-0.5 bg-gradient-to-r from-blue-500 to-red-500 relative">
                    <div className={`absolute w-4 h-4 rounded-full bg-primary transform -translate-y-1/2 transition-all duration-1000 ${
                      isAnimating ? 'translate-x-full' : 'translate-x-0'
                    }`} style={{ left: `${(currentStep / (steps.length - 1)) * 100}%` }} />
                  </div>
                  
                  <div className="flex justify-center mt-2">
                    <Badge variant="secondary" className="text-xs">
                      Cross-Chain Bridge
                    </Badge>
                  </div>
                </div>
                
                <LoanCard isActive={currentStep >= 2} />
              </div>

              {/* Current Step Description */}
              <div className="text-center p-6 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-2 text-primary">
                  {steps[currentStep]}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {currentStep === 0 && "Secure your ETH collateral on Ethereum network with smart contract protection"}
                  {currentStep === 1 && "Our bridge protocol safely transfers value across chains instantly"}
                  {currentStep === 2 && "Receive USDT directly to your Avalanche wallet - ready to use"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto">
          <Card className="group hover:shadow-lg transition-all duration-300 border-blue-500/20 hover:border-blue-500/40">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/10 rounded-full flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="font-semibold mb-2">Secure Collateral</h3>
              <p className="text-sm text-muted-foreground">
                Your ETH is safely locked in audited smart contracts on Ethereum
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary/40">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Instant Bridge</h3>
              <p className="text-sm text-muted-foreground">
                Cross-chain transactions completed in under 5 minutes
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-red-500/20 hover:border-red-500/40">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                <TrendingDown className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="font-semibold mb-2">Low Interest</h3>
              <p className="text-sm text-muted-foreground">
                Competitive rates starting from 3.5% APR on USDT loans
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Loan Details */}
        <Card className="max-w-2xl mx-auto mb-12 border-2 border-dashed border-primary/30">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
              <Info className="w-10 h-10 text-primary" />
            </div>
            
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6">
              Connect your wallet to begin the cross-chain borrowing process. 
              Our interface will guide you through each step safely.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>~5 min process</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Fully secured</span>
              </div>
            </div>

            {/* Hidden Input Field (as requested) */}
            <div className="hidden">
              <input 
                type="text" 
                placeholder="Collateral amount..." 
                className="w-full p-4 border rounded-lg"
              />
            </div>

            {/* <Button size="lg" className="w-full group">
              Connect Wallet to Start
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button> */}
            <WalletConnectionModal userType = "borrower" />

            <p className="text-xs text-muted-foreground mt-4">
              By proceeding, you agree to our terms of service and privacy policy
            </p>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-center">
          <div className="p-4">
            <div className="text-2xl font-bold text-primary">75%</div>
            <div className="text-xs text-muted-foreground">Max LTV Ratio</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-primary">3.5%</div>
            <div className="text-xs text-muted-foreground">Starting APR</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-primary">24/7</div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold text-primary">$50M+</div>
            <div className="text-xs text-muted-foreground">Liquidity Pool</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowerPage;