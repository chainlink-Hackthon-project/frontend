"use client";
import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import {
  Wallet,
  TrendingUp,
  DollarSign,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Plus,
  History,
  Calculator,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import BorrowerDashboard from "@/components/BorrowerDashboard";
import { ethers } from "ethers";
import BorrowUSDT from "@/components/BorrowUsdt";
import TransactionLoadingAnimation from "@/components/txnProcessingLoadingState";
import { useRouter } from "next/navigation";

const page = () => {
  const { address, isConnected } = useAccount();
  const [borrowerData, setBorrowerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [repaymentAmount, setRepaymentAmount] = useState("");
  const [collateralAmount, setCollateralAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // when backend give confirmation , then it will be true and we will show usdt loan taking screen
  const [CollateralRecieved, setCollateralRecieved] = useState(false);

  const [DisplayNewUserInterface, setDisplayNewUserInterface] = useState(false);
  const [collateralGiven, setcollateralGiven] = useState(0);

  const router = useRouter();

  // this is the lock id of the txn
  const [LockId, setLockId] = useState("");

  // this will be set true after txn is sent to the user wallet
  const [loadingStateAftertxnSent, setloadingStateAftertxnSent] =
    useState(false);

  // state variabel for txn loading state
  const [transactionConfirmed, settransactionConfirmed] = useState(false);

  // API call to check borrower status
  useEffect(() => {
    // api call and fetching the data
    const fetchBorrowerData = async () => {
      if (!address) return;

      console.log("this is the address", address);

      // loading state is on , because we are fetching the data
      setLoading(true);

      // calling the backend to create/get the user details
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_ADDRESS}/user/getUserDetails`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userAddress: address,
              userType: "borrower",
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);

        // Mock data - replace with actual API call
        let userCollateralData = {
          // if user status === 0 , then itsa new user will not collateral , else has some collateral
          hasCollateral: data?.userStatus === 0 ? false : true,
          collateralAmount: data?.collateralAmount,
          collateralToken: "ETH", //fixed
          borrowedAmount: data?.borrowedAmount,
          borrowedToken: "USDT", // tard codedhis is h
          interestRate: 8.5, // we will fetch from contract
          dueDate: "2025-07-24", //no due date
          healthFactor: 1.45, // no heath factor
          liquidationPrice: data?.liquidationPrice,
          totalInterest: 85.5,
          repaymentHistory: [
            { date: "2025-06-01", amount: 100, type: "interest" },
            { date: "2025-05-15", amount: 50, type: "partial" },
          ],
        };

        if (!userCollateralData?.hasCollateral) {
          setDisplayNewUserInterface(true);
        }

        // if user already has loan , the he will be redirected to borrowing dashboard
        if (userCollateralData?.hasCollateral) {
          router.push(`${address}/dashboard`);
        }

        setBorrowerData(userCollateralData);
        setLoading(false);
      } catch (error) {
        console.log("getting error in fetching the account details", error);
      }
    };

    fetchBorrowerData();
  }, [address]);

  // transfering eth from the user to the eth contract
  const transferETH = async (contractAddress, amountInETH) => {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== "undefined") {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // Create provider and signer
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Convert ETH to Wei
        const amountInWei = ethers.parseEther(amountInETH.toString());
        console.log(
          "Amount in ETH:",
          amountInETH,
          "Amount in Wei:",
          amountInWei
        );

        // Contract ABI for the deposit function
        const contractABI = [
          "function deposit() external payable returns (bytes32 lockId)",
        ];

        // Create contract instance
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        // Update UI state before transaction
        setDisplayNewUserInterface(false);
        setCollateralRecieved(false); // Set to false initially, will be true after confirmation

        // Call the deposit function
        const tx = await contract.deposit({
          value: amountInWei, // Send ETH with the transaction
        });
        console.log(
          "Transaction sent:",
          tx.hash,
          contractAddress,
          amountInETH,
          amountInWei
        );

        // Wait for confirmation
        const receipt = await tx.wait();
        if (receipt?.status === 1) {
          // Check transaction status instead of blockNumber
          console.log("Transaction confirmed at block:", receipt.blockNumber);

          // Update borrower data
          setBorrowerData((prev) => ({
            ...(prev || {}),
            hasCollateral: true,
            collateralAmount: amountInETH,
          }));

          // Call backend for confirmation with the transaction hash
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_ADDRESS}/indexer/thisTxn`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error(
              `Backend error: ${response.status} ${response.statusText}`
            );
          }

          const data = await response.json();

          console.log("Transaction result from backend:", data);

          // Update UI based on backend confirmation
          setcollateralGiven(amountInETH);
          setCollateralRecieved(data?.success || true);
          setLockId(data?.lockId);
        } else {
          throw new Error("Transaction failed");
        }

        console.log("Transaction confirmed:", receipt);

        return {
          txHash: tx.hash,
          receipt: receipt,
        };
      } else {
        throw new Error("MetaMask is not installed");
      }
    } catch (error) {
      console.error("Error calling deposit function:", error);

      // Reset UI state on error
      setCollateralRecieved(false);
      setDisplayNewUserInterface(true);

      throw error;
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <Wallet className="w-12 h-12 text-muted-foreground" />
            <p className="text-center text-muted-foreground">
              Please connect your wallet to continue
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">
              Loading your borrower profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // New Borrower UI
  // DisplayNewUserInterface;
  if (false) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to DeFi Lending</h1>
          <p className="text-muted-foreground">
            Deposit collateral and borrow USDT on Avalanche chain
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Deposit Collateral
              </CardTitle>
              <CardDescription>
                Secure your loan by depositing ETH as collateral
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="collateral">Collateral Amount (ETH)</Label>
                <Input
                  id="collateral"
                  type="number"
                  placeholder="0.0"
                  value={collateralAmount}
                  onChange={(e) => setCollateralAmount(e.target.value)}
                />
              </div>

              {collateralAmount && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Collateral Value:</span>
                    <span className="font-medium">
                      ${parseFloat(collateralAmount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Max Borrow (50% LTV):</span>
                    <span className="font-medium text-green-600">
                      ${(parseFloat(collateralAmount) * 0.5).toLocaleString()}{" "}
                      USDT
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Interest Rate:</span>
                    <span className="font-medium">3% APR</span>
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                onClick={
                  () =>
                    transferETH(
                      "0x4B0CCc3E3246807F6380BCE3ff04A917CC7ee374",
                      0.01
                    )
                  // setEthAddress('0x6c52B63D1F656417Bef90D136D3498A53959C13e' , '0x855B2c5A63f9F7CF9F01809327837BE0aeE5a951')
                }
                disabled={!collateralAmount || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Deposit
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Deposit Collateral</h4>
                  <p className="text-sm text-muted-foreground">
                    Secure your loan with ETH collateral
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Borrow USDT</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive up to 60% of collateral value in USDT
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Manage & Repay</h4>
                  <p className="text-sm text-muted-foreground">
                    Monitor your position and make repayments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Alert className="mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Risk Warning:</strong> Your collateral may be liquidated if
            its value falls below the liquidation threshold. Always monitor your
            health factor.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // if (loadingStateAftertxnSent) {
  //   return (
  //     // Show until confirmed
  //     // when loading state after txn variable set to true then it will show confirm animation
  //     // and ends it
  //     <TransactionLoadingAnimation
  //       isConfirmed={loadingStateAftertxnSent}

  //       // undestand this , what is happening here
  //       onComplete={() => {}} // Optional callback when animation exits
  //     />
  //   );
  // }

  // CollateralRecieved
  if (true) {
    return (
      <BorrowUSDT
        collateral_Amount={collateralGiven}
        lock_id={LockId}
      />
    );
  }
};

export default page;
