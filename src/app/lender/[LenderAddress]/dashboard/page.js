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

const page = () => {
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

  // Backend data states
  const [backendData, setBackendData] = useState({
    totalLent: 0,
    lendingStartDate: null,
    interestEarned: 0,
    currentAPY: 0,
  });

  // Animated counter states
  const [displayAmount, setDisplayAmount] = useState(0);
  const [displayInterest, setDisplayInterest] = useState(0);

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
          setDisplayInterest(parseFloat(aprPercentage));

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

  // Function to get current APY from contract
  const getCurrentAPY = async () => {
    try {
      // TODO: Implement contract call to get current APY
      const provider = new ethers.BrowserProvider(window.ethereum);
      const CONTRACT_ABI = [
        // Add your contract ABI methods here
        "function getCurrentAPY() external view returns (uint256)",
      ];

      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_AVALANCHE_ADDRESS,
        CONTRACT_ABI,
        provider
      );

      // const apy = await contract.getCurrentAPY();
      // return Number(apy) / 100; // Convert from basis points to percentage

      // Placeholder return for now
      return 7.5;
    } catch (error) {
      console.error("Error fetching current APY:", error);
      return 7.5; // Default APY
    }
  };

  // Calculate active duration in days
  const calculateActiveDuration = (startDate) => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // fetching lenders info
  useEffect(() => {
    const fetchLendersData = async () => {
      if (!address) return;

      console.log("this is the address", address);
      setLoading(true);

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
        console.log("Backend data:", data);

        // Get interest earned and APY from contract
        const interestEarned = displayInterest;
        const currentAPY = await getCurrentAPY();

        // Calculate active duration
        const activeDuration = calculateActiveDuration(data?.lendingStartDate);

        // Set backend data
        setBackendData({
          totalLent: data?.lendedAmount,
          lendingStartDate: data?.lendingStartDate,
          interestEarned: interestEarned,
          currentAPY: currentAPY,
          activeDuration: activeDuration,
        });

        let userLendingData = {
          hasLending: data?.userStatus === 0 ? false : true,
          LendingAmount: data?.lendedAmount,
          interestRate: currentAPY,
          repaymentHistory: [
            { date: "2025-06-01", amount: 100, type: "interest" },
            { date: "2025-05-15", amount: 50, type: "partial" },
          ],
        };

        setUserLendingData(userLendingData);

        setLoading(false);
      } catch (error) {
        console.log("getting error in fetching the account details", error);
        setLoading(false);
      }
    };

    fetchLendersData();
  }, [address]);



  // Animated counter effect
  useEffect(() => {
    if (currentView === "dashboard") {
      setAnimateStats(true);

      // Animate total lent
      const lentInterval = setInterval(() => {
        setDisplayAmount((prev) => {
          const target = backendData?.totalLent;
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
          const target = backendData.interestEarned;
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
  }, [currentView, backendData.totalLent, backendData.interestEarned]);

    // Hardcoded recent transactions data
  const recentTransactions = [
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
  ];

    const withdrawlending = async () => {
    setIsProcessing(true);

    try {
      // Get the amount of shares (LP tokens) to withdraw
      // You might want to get this from user input or calculate based on their balance
      const withdrawamount = 100; // Replace with actual shares amount

      // Convert to proper units if needed
      const amountInWei = withdrawamount*1000000;

      const provider = new ethers.BrowserProvider(window.ethereum);

      // Get the signer (connected wallet)
      const signer = await provider.getSigner();

      const CONTRACT_ABI = [
        "function withdraw(uint256 shares) external",
        "function balanceOf(address account) external view returns (uint256)", // To check user's LP token balance
        "function totalSupply() external view returns (uint256)", // Optional: to calculate withdrawal preview
      ];

      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_AVALANCHE_ADDRESS,
        CONTRACT_ABI,
        provider
      );

      // Connect to your contract
      const contractWithSigner = contract.connect(signer);

      // Get user address
      const userAddress = await signer.getAddress();

      // Optional: Check user's LP token balance before withdrawal
      const userBalance = await contract.balanceOf(userAddress);
      console.log(
        "User token balance:",
        ethers.formatUnits(userBalance, 6)
      ); // Assuming 18 decimals for LP tokens

      // Validate that user has enough shares
      if (userBalance < amountInWei) {
        throw new Error("Insufficient LP token balance for withdrawal");
      }

      // Call the withdraw function
      console.log("Calling withdraw function...");
      const withdrawTx = await contractWithSigner.withdraw(amountInWei);
      console.log("Withdraw transaction sent:", withdrawTx.hash);

      // Wait for transaction confirmation
      const receipt = await withdrawTx.wait();
      console.log("Withdrawal successful!", receipt);

      // Call backend API to update records
      try {
        const backendResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_ADDRESS}/lenders-update/withdrawal`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userAddress: address,
              sharesAmount: withdrawamount,
              transactionHash: withdrawTx.hash,
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
          `Successfully withdrew ${sharesToWithdraw} shares! Transaction: ${withdrawTx.hash}`
        );

        // Redirect to dashboard or refresh the page
        router.push(`lender/${address}/dashboard`);
      } catch (apiError) {
        console.error("Backend API call failed:", apiError);
        // Transaction succeeded but API failed
        // alert(
        //   `Withdrawal successful but failed to record in database. Transaction: ${withdrawTx.hash}`
        // );
      }

      // Update UI state
      // setWithdrawAmount(""); // If you have a state for withdrawal amount

      // Optional: Show success message to user
      // setSuccessMessage(`Withdrawal of ${sharesToWithdraw} shares successful!`);
    } catch (error) {
      console.error("Withdrawal failed:", error);

      // Handle specific error cases
      if (error.message.includes("Liquidity: zero withdraw")) {
        console.error("Cannot withdraw zero shares");
      } else if (error.message.includes("Liquidity: zero output")) {
        console.error("Withdrawal would result in zero output");
      } else if (error.message.includes("Insufficient LP token balance")) {
        console.error("You don't have enough LP tokens to withdraw");
      } else if (error.code === "ACTION_REJECTED") {
        console.error("Transaction rejected by user");
      } else {
        console.error("Withdrawal failed. Please try again.");
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
              Loading your lender profile...
            </p>
          </div>
        </div>
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

        {/* Main Stats - Updated to 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                {showBalance ? backendData?.totalLent : "••••••"}
              </div>
              <div className="flex items-center gap-1 text-sm text-green-400">
                <ArrowUpRight className="w-4 h-4" />
                <span>Active Investment</span>
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
                <span>{backendData.currentAPY}% APY</span>
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
                {backendData.activeDuration} days
              </div>
              <div className="text-sm text-green-400">
                {backendData.lendingStartDate
                  ? `Since ${new Date(
                      backendData.lendingStartDate
                    ).toLocaleDateString()}`
                  : "Not started"}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Earnings Chart - Placeholder */}
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

            {/* Chart Placeholder */}
            <div className="h-64 bg-gradient-to-t from-green-500/10 to-transparent rounded-xl flex items-center justify-center border border-gray-700/50">
              <div className="text-center py-8">
                <TrendingUp className="w-16 h-16 text-green-400/60 mx-auto mb-4" />
                <p className="text-gray-400">Chart coming soon</p>
                <p className="text-lg text-gray-500 mt-2">
                  Earnings visualization will be implemented
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

                <button
                onClick={() => withdrawlending()}
                  className="w-full p-4 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-[1.02] border border-emerald-500/30"
                >
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
                    {backendData.currentAPY}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Monthly Return</span>
                  <span className="font-bold text-emerald-400">
                    {(backendData.currentAPY / 12).toFixed(3)}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Interest</span>
                  <span className="font-bold text-green-300">
                    {formatCurrency(backendData.interestEarned)}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <Trophy className="w-4 h-4" />
                    <span>Active Lender</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions - Hardcoded */}
        <div className="mt-8 bg-gray-800 rounded-3xl shadow-2xl border border-gray-700 p-8 backdrop-blur-lg">
          <h2 className="text-2xl font-bold text-white mb-6">
            Recent Activity
          </h2>

          <div className="space-y-4">
            {recentTransactions.map((tx, index) => (
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

export default page;
