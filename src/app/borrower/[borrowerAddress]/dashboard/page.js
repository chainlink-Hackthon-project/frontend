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
  Zap,
  Target,
  Activity,
  BarChart3,
  Sparkles,
  ChevronDown,
  ExternalLink,
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
import { useRouter } from "next/navigation";
import { ethers } from "ethers";

const BorrowerDashboard = () => {
  const { address, isConnected } = useAccount();
  const [borrowerData, setBorrowerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [repaymentAmount, setRepaymentAmount] = useState("");
  const [collateralAmount, setCollateralAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [animateValue, setAnimateValue] = useState(false);

  const [currentEthValueInUSD, setcurrentEthValueInUSD] = useState();

  const router = useRouter();

  //   fetching the user details from the backend
  useEffect(() => {
    // / fetching current eth value in usdt from the api call
    const getEthCurrentValue = async () => {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      const data = await response.json();

      // this is the collateral equivalent in usd
      setcurrentEthValueInUSD(data?.ethereum?.usd);
      console.log("this is the current eth value in usd", data);

      return data.ethereum.usd;
    };
    const fetchBorrowerData = async () => {
      //   if (!address) return;

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
        console.log("this is the data from the database", data);

        let userCollateralData = {
          // if user status === 0 , then itsa new user will not collateral , else has some collateral
          hasCollateral: data?.userStatus === 0 ? false : true,
          collateralAmount: data?.collateralAmount,
          collateralToken: "ETH", //fixed
          borrowedAmount: 10, //data?.borrowedAmount, //todo
          borrowedToken: "USDT",
          interestRate: 8.5,
          liquidationPrice: data?.liquidationPrice,
          totalInterest: 85.5,
          repaymentHistory: [
            { date: "2025-06-01", amount: 100, type: "interest" },
            { date: "2025-05-15", amount: 50, type: "partial" },
          ],
        };

        setBorrowerData(userCollateralData);
        setLoading(false);
      } catch (error) {
        console.log("getting error in fetching the account details", error);
      }
    };

    fetchBorrowerData();

    getEthCurrentValue();
    fetchBorrowerData();
  }, [address]);

  // Animated counter hook
  const useAnimatedCounter = (value, duration = 1000) => {
    const [count, setCount] = useState(0);

    // card animation
    // number progress animation
    useEffect(() => {
      if (value) {
        let start = 0;
        const end = parseFloat(value) || 0;
        const increment = end / (duration / 16);
        const timer = setInterval(() => {
          start += increment;
          if (start >= end) {
            setCount(end);
            clearInterval(timer);
          } else {
            setCount(start);
          }
        }, 16);
        return () => clearInterval(timer);
      }
    }, [value, duration]);

    return count;
  };

  const animatedCollateral = useAnimatedCounter(
    borrowerData?.collateralAmount,
    1500
  );
  const animatedBorrowed = useAnimatedCounter(
    borrowerData?.borrowedAmount,
    1800
  );
  const animatedLiquidation = useAnimatedCounter(2000, 2000);

  const handleRepayment = async () => {
    setIsProcessing(true);

    try {
      // todo
      // Hardcoded repayment amount (100 USDT)
      const repaymentAmount = 35;

      // Convert to proper units (assuming USDT has 6 decimals)
      // const amountInWei = ethers.parseUnits(repaymentAmount.toString(), 6);
      const amountInWei = repaymentAmount;

      const provider = new ethers.BrowserProvider(window.ethereum);

      // Get the signer (connected wallet)
      const signer = await provider.getSigner();

      const CONTRACT_ABI = ["function repay(uint256 amount) external"];
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_AVALANCHE_ADDRESS,
        CONTRACT_ABI,
        provider
      );

      // Connect to your contract
      const contractWithSigner = contract.connect(signer);

      // First, approve the contract to spend USDT tokens
      const usdtContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS, // Your USDT contract address
        [
          "function approve(address spender, uint256 amount) external returns (bool)",
          "function allowance(address owner, address spender) external view returns (uint256)",
        ],
        signer
      );

      // Get user address
      const userAddress = await signer.getAddress();

      // Check current allowance
      const currentAllowance = await usdtContract.allowance(
        userAddress,
        process.env.NEXT_PUBLIC_AVALANCHE_ADDRESS // Your main contract address (not USDT)
      );

      console.log(
        "Current allowance:",
        ethers.formatUnits(currentAllowance, 6)
      );
      console.log("Required amount:", ethers.formatUnits(amountInWei, 6));

      // If allowance is insufficient, approve the contract
      if (currentAllowance < amountInWei) {
        console.log("Approving USDT spend...");
        const approveTx = await usdtContract.approve(
          process.env.NEXT_PUBLIC_AVALANCHE_ADDRESS, // Approve your main contract, not USDT
          amountInWei
        );
        console.log("Approval transaction sent:", approveTx.hash);
        await approveTx.wait();
        console.log("USDT approval confirmed");
      }

      // Now call the repay function
      console.log("Calling repay function...");
      const repayTx = await contractWithSigner.repay(amountInWei);
      console.log("Repay transaction sent:", repayTx.hash);

      // Wait for transaction confirmation
      const receipt = await repayTx.wait();
      console.log("Repayment successful!", receipt);

    //   calling 
      try {
        const backendResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_ADDRESS}/borrowers-update/repayment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userAddress: address,
              usdtAmount: repaymentAmount,
            }),
          }
        );

        if (!backendResponse.ok) {
          throw new Error(`Backend API error: ${backendResponse.status}`);
        }

        const apiResult = await backendResponse.json();
        console.log("Backend API response:", apiResult);

        // Success feedback
        alert(
          `Successfully borrowed ${currentBorrowAmount} USDT! Transaction: ${tx.hash}`
        );

        router.push(`borrower/${address}/dashboard`);
      } catch (apiError) {
        console.error("Backend API call failed:", apiError);
        // Transaction succeeded but API failed
        alert(
          `Borrow successful but failed to record in database. Transaction: ${tx.hash}`
        );
      }

      // Update UI state
      setRepaymentAmount("");

      // Optional: Show success message to user
      // setSuccessMessage("Repayment of 100 USDT successful!");
    } catch (error) {
      console.error("Repayment failed:", error);

      // Handle specific error cases
      if (error.message.includes("BR: overpay")) {
        console.error("Repayment amount exceeds your debt");
      } else if (error.message.includes("insufficient allowance")) {
        console.error("Please approve USDT spending first");
      } else if (error.code === "ACTION_REJECTED") {
        console.error("Transaction rejected by user");
      } else {
        console.error("Repayment failed. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  //   calclulating how usdt does user taken loan compared to the eth on collateral
  const calculateLTV = () => {
    if (!borrowerData?.collateralAmount || !borrowerData?.borrowedAmount)
      return 0;
    return (
      (borrowerData.borrowedAmount /
        (borrowerData.collateralAmount * currentEthValueInUSD)) *
      100
    ).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <div
            className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin animate-pulse"
            style={{ animationDuration: "1.5s", animationDirection: "reverse" }}
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 container mx-auto p-6 max-w-7xl">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 bg-white/10 backdrop-blur-lg rounded-full border border-white/20">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
            <span className="text-white font-medium">
              DeFi Lending Protocol
            </span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-4 animate-fadeIn">
            Borrower Dashboard
          </h1>
          <p
            className="text-xl text-slate-300 animate-fadeIn"
            style={{ animationDelay: "0.2s" }}
          >
            Manage your collateral and optimize your lending position
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Collateral Card */}
          <div
            className="group relative animate-fadeIn"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-all duration-500"></div>
            <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl group">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-500">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                    Active
                  </Badge>
                </div>
                <div>
                  <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">
                    Total Collateral
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                      {animatedCollateral.toFixed(2)}
                    </span>
                    <span className="text-blue-300 text-lg font-medium">
                      ETH
                    </span>
                  </div>
                  <div className="text-slate-300 text-sm mt-2">
                    ≈ $
                    {(
                      animatedCollateral * currentEthValueInUSD
                    ).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Borrowed Card */}
          <div
            className="group relative animate-fadeIn"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-all duration-500"></div>
            <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl group">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-500">
                    <DollarSign className="w-7 h-7 text-white" />
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                    Borrowed
                  </Badge>
                </div>
                <div>
                  <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">
                    Amount Borrowed
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                      ${animatedBorrowed?.toLocaleString()}
                    </span>
                    <span className="text-green-300 text-lg font-medium">
                      USDT
                    </span>
                  </div>
                  <div className="text-slate-300 text-sm mt-2">
                    LTV: {calculateLTV()}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liquidation Price Card */}
          <div
            className="group relative animate-fadeIn"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-all duration-500"></div>
            <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl group">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-orange-400 to-red-600 rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-500">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-400/30">
                    Alert
                  </Badge>
                </div>
                <div>
                  <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">
                    Liquidation Price
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                      ${animatedLiquidation.toLocaleString()}
                    </span>
                    <span className="text-orange-300 text-lg font-medium">
                      USDT
                    </span>
                  </div>
                  <div className="text-slate-300 text-sm mt-2">
                    Current: ${currentEthValueInUSD}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="animate-fadeIn" style={{ animationDelay: "0.6s" }}>
          <Tabs defaultValue="repayment" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-xl border-white/20 p-2">
              <TabsTrigger
                value="repayment"
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-slate-300 transition-all duration-300"
              >
                <Zap className="w-4 h-4 mr-2" />
                Repayment
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-slate-300 transition-all duration-300"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Details
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-slate-300 transition-all duration-300"
              >
                <History className="w-4 h-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="repayment"
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Repayment Card */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:border-white/40 transition-all duration-500">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-xl">
                        Make Repayment
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Reduce your debt and improve your position
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="repayment"
                      className="text-white font-medium"
                    >
                      Repayment Amount (USDT)
                    </Label>
                    <Input
                      id="repayment"
                      type="number"
                      placeholder="0.00"
                      value={repaymentAmount}
                      onChange={(e) => setRepaymentAmount(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-400 transition-all duration-300"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {["25%", "50%", "75%", "MAX"].map((percent, index) => (
                      <Button
                        key={percent}
                        variant="outline"
                        size="sm"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40 transition-all duration-300"
                        onClick={() => {
                          const multiplier =
                            percent === "MAX" ? 1 : parseFloat(percent) / 100;
                          setRepaymentAmount(
                            (
                              borrowerData?.borrowedAmount * multiplier
                            ).toString()
                          );
                        }}
                      >
                        {percent}
                      </Button>
                    ))}
                  </div>

                  {repaymentAmount && (
                    <div className="p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-400/30 backdrop-blur-sm animate-fadeIn">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Remaining Debt:</span>
                        <span className="font-bold text-white text-lg">
                          $
                          {(
                            borrowerData?.borrowedAmount -
                            parseFloat(repaymentAmount)
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                    onClick={handleRepayment}
                    disabled={!repaymentAmount || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Processing Transaction...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Repay {repaymentAmount} USDT
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Loan Summary Card */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:border-white/40 transition-all duration-500">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <Calculator className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-white text-xl">
                      Loan Summary
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                      <span className="text-slate-400">Total Borrowed:</span>
                      <span className="font-bold text-white text-lg">
                        ${borrowerData?.borrowedAmount?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                      <span className="text-slate-400">Collateral Value:</span>
                      <span className="font-bold text-white text-lg">
                        $
                        {(
                          borrowerData?.collateralAmount * currentEthValueInUSD
                        )?.toLocaleString()}
                      </span>
                    </div>
                    <Separator className="bg-white/20" />
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-400/30">
                      <span className="font-medium text-white">LTV Ratio:</span>
                      <div className="text-right">
                        <span className="font-bold text-white text-xl">
                          {calculateLTV()}%
                        </span>
                        <div className="text-cyan-300 text-sm">Max: 75%</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Liquidation Risk:</span>
                      <span className="text-orange-400 font-medium">
                        ${borrowerData?.liquidationPrice}
                      </span>
                    </div>
                    <Progress
                      value={
                        ((currentEthValueInUSD -
                          borrowerData?.liquidationPrice) /
                          currentEthValueInUSD) *
                        100
                      }
                      className="h-2 bg-white/20"
                    />
                    <div className="text-xs text-slate-400">
                      Current ETH: ${currentEthValueInUSD} • Safety Buffer: $
                      {currentEthValueInUSD - borrowerData?.liquidationPrice}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details">
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-2xl flex items-center gap-3">
                    <Activity className="w-6 h-6 text-purple-400" />
                    Detailed Position Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-white text-lg mb-4 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-blue-400" />
                          Collateral Information
                        </h4>
                        <div className="space-y-3">
                          {[
                            {
                              label: "Token",
                              value: borrowerData?.collateralToken,
                            },
                            {
                              label: "Amount",
                              value: `${borrowerData?.collateralAmount} ETH`,
                            },
                            {
                              label: "USD Value",
                              value: `$${(
                                borrowerData?.collateralAmount *
                                currentEthValueInUSD
                              )?.toLocaleString()}`,
                            },
                            { label: "Price Feed", value: "Chainlink Oracle" },
                          ].map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-3 bg-white/5 rounded-lg"
                            >
                              <span className="text-slate-400">
                                {item.label}:
                              </span>
                              <span className="text-white font-medium">
                                {item.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-white text-lg mb-4 flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-green-400" />
                          Loan Information
                        </h4>
                        <div className="space-y-3">
                          {[
                            {
                              label: "Borrowed",
                              value: `${borrowerData?.borrowedAmount} USDT`,
                            },
                            { label: "LTV Ratio", value: `${calculateLTV()}%` },
                            { label: "Max LTV", value: "75%" },
                            { label: "Network", value: "Avalanche C-Chain" },
                          ].map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-3 bg-white/5 rounded-lg"
                            >
                              <span className="text-slate-400">
                                {item.label}:
                              </span>
                              <span className="text-white font-medium">
                                {item.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="text-white text-2xl flex items-center gap-3">
                    <History className="w-6 h-6 text-purple-400" />
                    Transaction History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {borrowerData?.repaymentHistory?.length > 0 ? (
                    <div className="space-y-4">
                      {borrowerData?.repaymentHistory?.map((tx, index) => (
                        <div
                          key={index}
                          className="group flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <ArrowUpRight className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-white">
                                Repayment
                              </p>
                              <p className="text-slate-400 text-sm">
                                {tx.date}
                              </p>
                              <p className="text-slate-500 text-xs font-mono">
                                {tx.hash}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-green-500/20 text-green-300 border-green-400/30 text-lg px-3 py-1">
                              ${tx.amount}
                            </Badge>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-slate-400 text-xs">
                                View on Explorer
                              </span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <History className="w-10 h-10 text-slate-400" />
                      </div>
                      <p className="text-slate-400 text-lg">
                        No transaction history yet
                      </p>
                      <p className="text-slate-500 text-sm mt-2">
                        Your repayments will appear here
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default BorrowerDashboard;
