"use client";
import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Wallet,
  Shield,
  Zap,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

const WalletConnectionModal = ({ userType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { connectors, connect, status, error } = useConnect();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();

  // Determine user type and redirect path
  const getUserType = () => {
    if (userType) {
      return { type: userType };
    }
  };

  const handleRedirectAfterConnection = () => {
    if (isConnected && address) {
      const { type } = getUserType();
      setIsOpen(false);

      // Small delay to ensure modal closes smoothly
      setTimeout(() => {
        router.push(`${type}/${address}`);
      }, 100);
    }
  };

  const handleConnect = (connector) => {
    connect({ connector });
  };

  const handleDisconnect = () => {
    disconnect();
    setIsOpen(false);
  };

  // Handle redirect when wallet connects successfully
  useEffect(() => {
    if (isConnected && status === "success" && address) {
      handleRedirectAfterConnection();
    }
  }, [isConnected, status, address]);

  const getWalletIcon = (connectorName) => {
    const name = connectorName.toLowerCase();
    if (name.includes("metamask")) return "🦊";
    if (name.includes("walletconnect")) return "📱";
    if (name.includes("coinbase")) return "🔵";
    if (name.includes("phantom")) return "👻";
    if (name.includes("injected")) return "🔌";
    return "💼";
  };

  const isPopularWallet = (connectorName) => {
    const popular = ["MetaMask", "WalletConnect", "Coinbase Wallet"];
    return popular.some((p) => connectorName.includes(p));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full group">
          {isConnected ? "Wallet Connected" : "Connect Wallet to Start"}
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold flex items-center justify-center gap-2">
            <Wallet className="w-6 h-6" />
            {isConnected ? "Wallet Connected" : "Connect Your Wallet"}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            {isConnected
              ? "Your wallet is successfully connected"
              : "Choose a wallet to connect to the application"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message || "Failed to connect wallet. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {isConnected ? (
          <div className="space-y-4 mt-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-600">
                    Connected Successfully
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your wallet is ready to use
                  </p>
                </div>
              </div>
            </Card>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleDisconnect}
            >
              Disconnect Wallet
            </Button>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {connectors.map((connector) => (
              <Card
                key={connector.uid}
                className="relative cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
              >
                <Button
                  variant="ghost"
                  className="w-full h-auto p-4 justify-start"
                  onClick={() => handleConnect(connector)}
                  disabled={status === "pending"}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="text-2xl">
                      {getWalletIcon(connector.name)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{connector.name}</span>
                        {isPopularWallet(connector.name) && (
                          <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {connector.name.includes("WalletConnect")
                          ? "Scan with mobile wallet"
                          : `Connect using ${connector.name}`}
                      </p>
                    </div>
                    {status === "pending" ? (
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </Button>
              </Card>
            ))}
          </div>
        )}

        {!isConnected && (
          <>
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-foreground mb-1">
                    Secure Connection
                  </p>
                  <p className="text-muted-foreground">
                    We never store your private keys. Your wallet remains secure
                    and under your control.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Fast & Easy
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                100% Secure
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnectionModal;
