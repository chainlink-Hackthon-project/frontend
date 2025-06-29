"use client";
import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  RefreshCw,
  Plus,
  Minus,
  PiggyBank,
  Target,
  Zap,
  Trophy,
  Calendar,
  Activity,
  Eye,
  EyeOff,
  Sparkles,
  Star,
  Gift,
  Coins,
  Calculator,
} from "lucide-react";
import { useAccount } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { ethers } from "ethers";

const LendingInterface = () => {
  const { address, isConnected } = useAccount();
  const [currentView, setCurrentView] = useState("deposit");
  const [lendAmount, setLendAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [animateStats, setAnimateStats] = useState(false);
  const [UserLendingData, setUserLendingData] = useState(null);
  const [DisplayNewUserInterface, setDisplayNewUserInterface] = useState(true);
  const [loading, setLoading] = useState(true);

  const [Network, setNetwork] = useState(null);

  // Add useState for rates instead of const values
  const [interestRate, setInterestRate] = useState(8); // Default value

  // fetching lenders info
  useEffect(() => {
    // api call and fetching the data
    const fetchLendersData = async () => {
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
              userType: "lender",
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);

        let userLendingData = {
          // if user status === 0 , then itsa new user will not collateral , else has some collateral
          hasLending: data?.userStatus === 0 ? false : true,
          LendingAmount: data?.lendedAmount,
          interestRate: interestRate,
          repaymentHistory: [
            { date: "2025-06-01", amount: 100, type: "interest" },
            { date: "2025-05-15", amount: 50, type: "partial" },
          ],
        };

        setUserLendingData(userLendingData);

        if (!userLendingData?.hasCollateral) {
          setDisplayNewUserInterface(true);
        }

        // if user already has lended some amount  , the he will be redirected to borrowing dashboard
        // if (userCollateralData?.hasCollateral) {
        //   router.push(`${address}/dashboard`);
        // }

        // setLenderData(userCollateralData);
        setLoading(false);
      } catch (error) {
        console.log("getting error in fetching the account details", error);
      }
    };

    fetchLendersData();
  }, [address]);

  // Move getNetwork inside useEffect
  useEffect(() => {
    const getNetwork = async () => {
      try {
        if (typeof window.ethereum !== "undefined") {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const network = await provider.getNetwork();
          setNetwork(network);
        }
      } catch (error) {
        console.error("Error getting network:", error);
      }
    };

    getNetwork();
  }, []); // Run once on mount

  // fetching rates dynamically
  useEffect(() => {
    // Contract ABI for the view functions
    const contractABI = ["function borrowAPR() public view returns (uint256)"];

    //  Getting APR
    const getContractRates = async () => {
      try {
        console.log("I am in the calling function");

        // Check if MetaMask is installed
        if (typeof window.ethereum !== "undefined") {
          // Request account access
          await window.ethereum.request({ method: "eth_requestAccounts" });

          // Create provider
          const provider = new ethers.BrowserProvider(window.ethereum);

          // Get signer (required for some operations)
          const signer = await provider.getSigner();

          console.log("I am after signer");

          // Create contract instance
          const contract = new ethers.Contract(
            process.env.NEXT_PUBLIC_AVALANCHE_ADDRESS,
            contractABI,
            provider
          );

          console.log("I am after contract instance");

          const network = await provider.getNetwork();
          const AVALANCHE_CHAIN_ID = 43113; // Use 43113 for testnet

          console.log("this is the network chain id ", network.chainId);

          console.log(
            "Contract address:",
            process.env.NEXT_PUBLIC_AVALANCHE_ADDRESS
          );
          console.log("Testing borrowAPR...");

          // Call functions individually to debug
          const aprBps = await contract.borrowAPR();
          console.log("borrowAPR result (raw):", aprBps);
          console.log("borrowAPR result (string):", aprBps.toString());

          // Proper BigInt handling
          const aprBpsNumber = Number(aprBps.toString());

          // Convert to percentages (basis points to percentage)
          const aprPercentage = (aprBpsNumber / 100).toFixed(2);

          console.log("APR percentage:", aprPercentage);

          // Update state variables instead of returning
          setInterestRate(parseFloat(aprPercentage));

          const result = {
            apr: {
              basisPoints: aprBps.toString(),
              percentage: aprPercentage,
            },
          };

          console.log("Contract rates:", result);
          return result;
        } else {
          throw new Error("MetaMask is not installed");
        }
      } catch (error) {
        console.error("Error getting contract rates:", error);

        // More detailed error logging
        if (error.code) {
          console.error("Error code:", error.code);
        }
        if (error.reason) {
          console.error("Error reason:", error.reason);
        }
        if (error.data) {
          console.error("Error data:", error.data);
        }

        throw error;
      }
    };

    // Only call if we have a network
    if (Network?.chainId) {
      getContractRates();
    }
  }, [Network?.chainId]);

  // Mock lender data
  const [lenderData, setLenderData] = useState({
    totalLent: 25000,
    interestEarned: 1875.5,
    currentAPY: 7.5,
    activeDuration: 127, // days
    compoundingGains: 245.3,
    totalWithdrawable: 26875.5,
    recentTransactions: [
      {
        date: "2025-06-28",
        type: "interest",
        amount: 156.25,
        status: "completed",
      },
      {
        date: "2025-06-21",
        type: "interest",
        amount: 156.25,
        status: "completed",
      },
      {
        date: "2025-06-14",
        type: "deposit",
        amount: 5000,
        status: "completed",
      },
      {
        date: "2025-05-30",
        type: "deposit",
        amount: 20000,
        status: "completed",
      },
    ],
  });

  // Animated counter effect
  const [displayAmount, setDisplayAmount] = useState(0);
  const [displayInterest, setDisplayInterest] = useState(0);

  useEffect(() => {
    if (currentView === "dashboard") {
      setAnimateStats(true);

      // Animate total lent
      const lentInterval = setInterval(() => {
        setDisplayAmount((prev) => {
          const target = lenderData.totalLent;
          const increment = target / 100;
          if (prev < target) {
            return Math.min(prev + increment, target);
          }
          clearInterval(lentInterval);
          return target;
        });
      }, 20);

      // Animate interest earned
      const interestInterval = setInterval(() => {
        setDisplayInterest((prev) => {
          const target = lenderData.interestEarned;
          const increment = target / 100;
          if (prev < target) {
            return Math.min(prev + increment, target);
          }
          clearInterval(interestInterval);
          return target;
        });
      }, 25);

      return () => {
        clearInterval(lentInterval);
        clearInterval(interestInterval);
      };
    }
  }, [currentView, lenderData.totalLent, lenderData.interestEarned]);

  const handleLend = async () => {
    setIsProcessing(true);

    try {
      // todo
      // Hardcoded repayment amount (100 USDT)
      // LendingAmount
      const LendingAmount = 350;

      // Convert to proper units (assuming USDT has 6 decimals)
      // const amountInWei = ethers.parseUnits(repaymentAmount.toString(), 6);
      const amountInWei = LendingAmount * 1000000;

      const provider = new ethers.BrowserProvider(window.ethereum);

      // Get the signer (connected wallet)
      const signer = await provider.getSigner();

      const CONTRACT_ABI = ["function deposit(uint256 amount) external"];
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
        process.env.NEXT_PUBLIC_AVALANCHE_ADDRESS
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
      console.log("Calling deposit function...");
      const depositTx = await contractWithSigner.deposit(amountInWei);
      console.log("Amount lended successfully:", repayTx.hash);

      // Wait for transaction confirmation
      const receipt = await depositTx?.wait();
      console.log("amount Lended successfully", receipt);

      //  calling backend for lender
      try {
        const backendResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_ADDRESS}/lender-update/update-lending-details`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userAddress: address,
              usdtAmount: LendingAmount,
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
          `Successfully lended ${LendingAmount} USDT!`
        );

        router.push(`lender/${address}/dashboard`);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
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

  if (currentView === "deposit") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="relative">
                <PiggyBank className="w-12 h-12 text-green-400" />
                <Sparkles className="w-6 h-6 text-green-300 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                Earn with USDT Lending
              </h1>
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Put your USDT to work and earn competitive returns through our
              secure lending protocol
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Lending Form */}
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 overflow-hidden backdrop-blur-lg">
                <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-6 h-6" />
                    <h2 className="text-2xl font-bold">Start Lending</h2>
                  </div>
                  <p className="opacity-90">
                    Deposit USDT and start earning immediately
                  </p>
                </div>

                <div className="p-8 space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Lending Amount (USDT)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={lendAmount}
                        onChange={(e) => setLendAmount(e.target.value)}
                        className="w-full px-4 py-4 text-2xl font-bold bg-gray-900 border-2 border-gray-600 text-white rounded-xl focus:border-green-400 focus:outline-none transition-all duration-300 placeholder-gray-500"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <span className="text-gray-400 font-medium">USDT</span>
                      </div>
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="flex gap-2 mt-3">
                      {[1000, 5000, 10000, 25000].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setLendAmount(amount.toString())}
                          className="px-4 py-2 text-sm font-medium bg-gray-700 hover:bg-green-600 hover:text-white text-gray-300 rounded-lg transition-all duration-200 transform hover:scale-105 border border-gray-600"
                        >
                          ${amount.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {lendAmount && (
                    <div className="bg-gradient-to-r from-green-900/50 to-emerald-800/50 border border-green-500/30 rounded-xl p-6 space-y-4 animate-slide-up backdrop-blur-sm">
                      <h3 className="font-semibold text-green-300 flex items-center gap-2">
                        <Calculator className="w-5 h-5" />
                        Earnings Projection
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">
                            {formatCurrency(
                              (parseFloat(lendAmount) * (interestRate / 100)) /
                                12
                            )}
                          </div>
                          <div className="text-sm text-green-300">
                            Monthly Interest
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">
                            {formatCurrency(
                              parseFloat(lendAmount) * (interestRate / 100)
                            )}
                          </div>
                          <div className="text-sm text-green-300">
                            Yearly Interest
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-300">APY Rate:</span>
                        <span className="font-bold text-green-400 text-lg">
                          {interestRate}%
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleLend}
                    disabled={!lendAmount || isProcessing}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold text-lg rounded-xl hover:from-green-700 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/25"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Processing Transaction...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Zap className="w-5 h-5" />
                        Start Earning Now
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Benefits & Stats */}
            <div className="space-y-6">
              {/* Live Stats */}
              <div className="bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 p-8 backdrop-blur-lg">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                  <Activity className="w-6 h-6 text-green-400" />
                  Live Protocol Stats
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-1">
                      $2.4M
                    </div>
                    <div className="text-sm text-gray-400">
                      Total Value Locked
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-400 mb-1">
                      847
                    </div>
                    <div className="text-sm text-gray-400">Active Lenders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-300 mb-1">
                      7.5%
                    </div>
                    <div className="text-sm text-gray-400">Current APY</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-500 mb-1">
                      $189K
                    </div>
                    <div className="text-sm text-gray-400">Interest Paid</div>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 p-8 backdrop-blur-lg">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                  <Star className="w-6 h-6 text-green-400" />
                  Why Choose Our Platform?
                </h3>

                <div className="space-y-4">
                  {[
                    {
                      icon: Shield,
                      title: "Secure & Audited",
                      desc: "Smart contracts audited by top security firms",
                    },
                    {
                      icon: Zap,
                      title: "Instant Liquidity",
                      desc: "Withdraw your funds anytime, no lock periods",
                    },
                    {
                      icon: TrendingUp,
                      title: "Competitive Rates",
                      desc: "Market-leading APY rates up to 7.5%",
                    },
                    {
                      icon: Gift,
                      title: "Compound Interest",
                      desc: "Automatic compounding maximizes your returns",
                    },
                  ].map((benefit, index) => (
                    <div
                      key={index}
                      className="flex gap-4 p-4 rounded-xl hover:bg-gray-700/50 transition-all duration-200 group"
                    >
                      <div className="flex-shrink-0">
                        <benefit.icon className="w-6 h-6 text-green-400 group-hover:text-green-300" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-200">
                          {benefit.title}
                        </h4>
                        <p className="text-sm text-gray-400">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Switch to Dashboard */}
          <div className="text-center">
            <button
              onClick={() => setCurrentView("dashboard")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl transition-all duration-200 text-gray-300 hover:text-green-400"
            >
              <Activity className="w-5 h-5" />
              View Lender Dashboard
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fade-in {
            animation: fade-in 0.6s ease-out;
          }

          .animate-slide-up {
            animation: slide-up 0.4s ease-out;
          }
        `}</style>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Lender Dashboard
            </h1>
            <p className="text-gray-400">
              Track your lending performance and earnings
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentView("deposit")}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl hover:from-green-700 hover:to-emerald-600 transition-all duration-200 flex items-center gap-2 transform hover:scale-105 shadow-lg shadow-green-500/25"
            >
              <Plus className="w-5 h-5" />
              Add More USDT
            </button>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-3 bg-gray-800 border border-gray-600 rounded-xl hover:bg-gray-700 transition-all duration-200 text-gray-300 hover:text-green-400"
            >
              {showBalance ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 p-6 relative overflow-hidden backdrop-blur-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/20 rounded-xl">
                  <Wallet className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-sm font-medium text-gray-400">
                  Total Lent
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {showBalance ? formatCurrency(displayAmount) : "••••••"}
              </div>
              <div className="flex items-center gap-1 text-sm text-green-400">
                <ArrowUpRight className="w-4 h-4" />
                <span>+12.5% this month</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 p-6 relative overflow-hidden backdrop-blur-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-gray-400">
                  Interest Earned
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {showBalance ? formatCurrency(displayInterest) : "••••••"}
              </div>
              <div className="flex items-center gap-1 text-sm text-emerald-400">
                <ArrowUpRight className="w-4 h-4" />
                <span>+7.5% APY</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 p-6 relative overflow-hidden backdrop-blur-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-400/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-400/20 rounded-xl">
                  <Clock className="w-6 h-6 text-green-300" />
                </div>
                <span className="text-sm font-medium text-gray-400">
                  Active Duration
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {lenderData.activeDuration} days
              </div>
              <div className="text-sm text-green-400">Since May 2025</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 p-6 relative overflow-hidden backdrop-blur-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-400/20 rounded-xl">
                  <Coins className="w-6 h-6 text-emerald-300" />
                </div>
                <span className="text-sm font-medium text-gray-400">
                  Available to Withdraw
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {showBalance
                  ? formatCurrency(lenderData.totalWithdrawable)
                  : "••••••"}
              </div>
              <div className="text-sm text-emerald-400">
                Principal + Interest
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Earnings Chart */}
          <div className="lg:col-span-2 bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 p-8 backdrop-blur-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                Earnings Overview
              </h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium border border-green-500/30">
                  7D
                </button>
                <button className="px-4 py-2 bg-gray-700 text-gray-400 rounded-lg text-sm font-medium border border-gray-600">
                  30D
                </button>
                <button className="px-4 py-2 bg-gray-700 text-gray-400 rounded-lg text-sm font-medium border border-gray-600">
                  90D
                </button>
              </div>
            </div>

            {/* Simple chart representation */}
            <div className="h-64 bg-gradient-to-t from-green-500/10 to-transparent rounded-xl flex items-end justify-center border border-gray-700/50">
              <div className="text-center py-8">
                <TrendingUp className="w-16 h-16 text-green-400/60 mx-auto mb-4" />
                <p className="text-gray-400">Earnings trending upward</p>
                <p className="text-2xl font-bold text-green-400 mt-2">
                  +{formatCurrency(lenderData.interestEarned)}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 p-6 backdrop-blur-lg">
              <h3 className="text-xl font-bold text-white mb-6">
                Quick Actions
              </h3>

              <div className="space-y-4">
                <button className="w-full p-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl hover:from-green-700 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-[1.02] shadow-lg shadow-green-500/25">
                  <Plus className="w-5 h-5" />
                  Add More USDT
                </button>

                <button className="w-full p-4 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-[1.02] border border-emerald-500/30">
                  <ArrowDownRight className="w-5 h-5" />
                  Withdraw Earnings
                </button>

                <button className="w-full p-4 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-[1.02] border border-gray-600">
                  <RefreshCw className="w-5 h-5" />
                  Compound Interest
                </button>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 p-6 backdrop-blur-lg">
              <h3 className="text-xl font-bold text-white mb-6">Performance</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Current APY</span>
                  <span className="font-bold text-green-400">
                    {lenderData.currentAPY}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Monthly Return</span>
                  <span className="font-bold text-emerald-400">0.625%</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Compound Gains</span>
                  <span className="font-bold text-green-300">
                    {formatCurrency(lenderData.compoundingGains)}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <Trophy className="w-4 h-4" />
                    <span>Top 10% Performer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-8 bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 p-8 backdrop-blur-lg">
          <h2 className="text-2xl font-bold text-white mb-6">
            Recent Activity
          </h2>

          <div className="space-y-4">
            {lenderData.recentTransactions.map((tx, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 hover:bg-gray-700/50 rounded-xl transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-xl ${
                      tx.type === "deposit"
                        ? "bg-green-500/20"
                        : "bg-emerald-500/20"
                    }`}
                  >
                    {tx.type === "deposit" ? (
                      <ArrowUpRight
                        className={`w-5 h-5 ${
                          tx.type === "deposit"
                            ? "text-green-400"
                            : "text-emerald-400"
                        }`}
                      />
                    ) : (
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-200 capitalize">
                      {tx.type === "deposit"
                        ? "USDT Deposit"
                        : "Interest Payment"}
                    </div>
                    <div className="text-sm text-gray-400">{tx.date}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-bold ${
                      tx.type === "deposit"
                        ? "text-green-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {tx.type === "deposit" ? "+" : "+"}
                    {formatCurrency(tx.amount)}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    <span>Completed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LendingInterface;
