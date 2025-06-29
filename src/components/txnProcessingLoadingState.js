import React, { useState, useEffect } from 'react';
import { Wallet, Zap, Server, CheckCircle, Globe, Network, Shield, Cpu } from 'lucide-react';

const TransactionLoadingAnimation = ({ isConfirmed , onComplete }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [shouldExit, setShouldExit] = useState(false);

  const processes = [
    {
      id: 'blockchain',
      title: 'Blockchain Network',
      description: 'Broadcasting and validating...',
      icon: Globe,
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 'mining',
      title: 'Network Consensus',
      description: 'Miners confirming transaction...',
      icon: Cpu,
      color: 'from-green-400 to-green-600'
    },
    {
      id: 'backend',
      title: 'Backend Verification',
      description: 'Server-side confirmation...',
      icon: Server,
      color: 'from-purple-400 to-purple-600'
    }
  ];

  useEffect(() => {
    if (isConfirmed && !showSuccess) {
      // Wait 1 second, then show success, then exit
      setTimeout(() => {
        setShowSuccess(true);
        setTimeout(() => {
          setShouldExit(true);
          if (onComplete) onComplete();
        }, 1500); // Show success for 1.5 seconds then exit
      }, 1000);
    }
  }, [isConfirmed, showSuccess, onComplete]);

  if (shouldExit) return null;

  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${2 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  );

  const NetworkVisualization = () => (
    <div className="flex justify-center items-center mb-8 relative">
      <div className="relative w-80 h-40">
        {/* Central Transaction Node */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 shadow-lg transition-all duration-1000 ${
            showSuccess 
              ? 'bg-green-600 border-green-400' 
              : 'bg-gradient-to-r from-gray-600 to-gray-800 border-gray-500'
          }`}>
            {showSuccess ? (
              <CheckCircle className="w-8 h-8 text-white" />
            ) : (
              <Zap className="w-8 h-8 text-white animate-pulse" />
            )}
          </div>
          <div className={`absolute -top-2 -left-2 w-20 h-20 border-2 rounded-full animate-ping opacity-20 ${
            showSuccess ? 'border-green-400' : 'border-gray-400'
          }`} />
        </div>

        {/* Process Nodes */}
        {processes.map((process, index) => {
          const angle = (index * 120) - 90;
          const radius = 100;
          const x = Math.cos(angle * Math.PI / 180) * radius;
          const y = Math.sin(angle * Math.PI / 180) * radius;
          const Icon = process.icon;

          return (
            <div key={process.id}>
              {/* Connection Line */}
              <div
                className={`absolute top-1/2 left-1/2 origin-left transition-all duration-1000 ${
                  showSuccess ? 'border-green-400 opacity-80' : 'border-gray-600 opacity-30'
                }`}
                style={{
                  width: `${radius}px`,
                  height: '2px',
                  transform: `rotate(${angle}deg)`,
                  borderTop: '2px solid'
                }}
              />
              
              {/* Process Node */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`
                }}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-1000 ${
                  showSuccess 
                    ? 'bg-green-600 scale-110' 
                    : `bg-gradient-to-r ${process.color} animate-pulse`
                }`}>
                  {showSuccess ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <Icon className="w-6 h-6 text-white animate-spin" style={{animationDuration: `${2 + index}s`}} />
                  )}
                </div>
                
                {/* Process Status */}
                <div className="absolute top-14 left-1/2 transform -translate-x-1/2 text-center min-w-max">
                  <p className={`text-xs font-medium transition-colors duration-1000 ${
                    showSuccess ? 'text-green-400' : 'text-gray-300'
                  }`}>
                    {process.title}
                  </p>
                  <p className={`text-xs transition-colors duration-1000 ${
                    showSuccess ? 'text-green-300' : 'text-gray-500'
                  }`}>
                    {showSuccess ? 'Confirmed ✓' : process.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0.3; }
          50% { transform: translateY(-15px); opacity: 0.6; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(75, 85, 99, 0.5); }
          50% { box-shadow: 0 0 40px rgba(75, 85, 99, 0.8), 0 0 60px rgba(75, 85, 99, 0.3); }
        }
        @keyframes success-glow {
          0%, 100% { box-shadow: 0 0 30px rgba(34, 197, 94, 0.6); }
          50% { box-shadow: 0 0 50px rgba(34, 197, 94, 0.9), 0 0 80px rgba(34, 197, 94, 0.4); }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .success-glow {
          animation: success-glow 2s ease-in-out infinite;
        }
        .slide-up {
          animation: slideUp 0.5s ease-out;
        }
      `}</style>
      
      <FloatingParticles />
      
      <div className="max-w-3xl w-full bg-gray-900/90 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 relative shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
              showSuccess ? 'bg-green-600 success-glow' : 'bg-gray-600 pulse-glow'
            }`} />
            <div className="absolute inset-2 bg-black rounded-full flex items-center justify-center">
              {showSuccess ? (
                <CheckCircle className="w-8 h-8 text-green-400 slide-up" />
              ) : (
                <Network className="w-8 h-8 text-gray-300 animate-pulse" />
              )}
            </div>
          </div>
          <h2 className={`text-3xl font-bold mb-2 transition-colors duration-1000 ${
            showSuccess ? 'text-green-400' : 'text-white'
          }`}>
            {showSuccess ? 'Transaction Confirmed!' : 'Processing Transaction'}
          </h2>
          <p className={`transition-colors duration-1000 ${
            showSuccess ? 'text-green-300' : 'text-gray-300'
          }`}>
            {showSuccess ? 'Your transaction has been successfully processed' : 'Verification processes are running...'}
          </p>
        </div>

        {/* Network Visualization */}
        <NetworkVisualization />

        {/* Process Status Cards */}
        <div className="space-y-4 mb-8">
          {processes.map((process, index) => {
            const Icon = process.icon;
            
            return (
              <div key={process.id} className={`flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700 transition-all duration-1000 ${
                showSuccess ? 'bg-green-900/20 border-green-700/50' : ''
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-1000 ${
                  showSuccess ? 'bg-green-600' : `bg-gradient-to-r ${process.color}`
                }`}>
                  {showSuccess ? (
                    <CheckCircle className="w-5 h-5 text-white slide-up" style={{animationDelay: `${index * 0.1}s`}} />
                  ) : (
                    <Icon className="w-5 h-5 text-white animate-spin" style={{animationDuration: `${2 + index * 0.5}s`}} />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-medium transition-colors duration-1000 ${
                    showSuccess ? 'text-green-400' : 'text-white'
                  }`}>
                    {process.title}
                  </h3>
                  <p className={`text-sm transition-colors duration-1000 ${
                    showSuccess ? 'text-green-300' : 'text-gray-400'
                  }`}>
                    {showSuccess ? 'Process completed successfully' : process.description}
                  </p>
                </div>
                
                <div className="text-right">
                  {showSuccess ? (
                    <span className="text-green-400 text-sm font-medium slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                      Confirmed ✓
                    </span>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                      <span className="text-blue-400 text-sm">Processing</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
          <Shield className="w-4 h-4" />
          <span>Secured by blockchain technology</span>
        </div>

        {showSuccess && (
          <div className="mt-6 text-center slide-up">
            <div className="inline-flex items-center space-x-2 bg-green-600/20 text-green-400 px-6 py-3 rounded-full border border-green-600/30">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Transaction recorded on blockchain</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionLoadingAnimation;