"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  Shield,
  DollarSign,
  Percent,
  Clock,
  AlertTriangle,
  Coins,
  ArrowRight,
  Info,
} from "lucide-react";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

// {collateralAmount}
export default function BorrowUSDT({ collateral_Amount, lock_id }) {
  const [borrowAmount, setBorrowAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);

  const { address, isConnected } = useAccount();

  // collateralValueIn usdt
  const [collateralValue, setcollateralValue] = useState(0);

  // collateral in eth
  const [collateralAmount, setcollateralAmount] = useState(0);
  const [Network, setNetwork] = useState(null);

  // Add useState for rates instead of const values
  const [ltv, setLtv] = useState(75); // Default value
  const [interestRate, setInterestRate] = useState(8); // Default value

  // Mock user data
  // console.log("this is the collaterl incoming", collateral_Amount);

  const router = useRouter();

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



  // fetching ltv and rates dynamically 
  useEffect(() => {
    // Contract ABI for the view functions
    const contractABI = [
      "function borrowAPR() public view returns (uint256)",
      "function currentLTVBps() public view returns (uint256)",
      // "function deposit() external payable returns (bytes32 lockId)",
    ];


    //  Getting both APR and LTV in a single call for efficiency
    
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

          console.log("Testing currentLTVBps...");
          const ltvBps = await contract.currentLTVBps();
          console.log("currentLTVBps result (raw):", ltvBps);
          console.log("currentLTVBps result (string):", ltvBps.toString());

          // Proper BigInt handling
          const aprBpsNumber = Number(aprBps.toString());
          const ltvBpsNumber = Number(ltvBps.toString());

          // Convert to percentages (basis points to percentage)
          const aprPercentage = (aprBpsNumber / 100).toFixed(2);
          const ltvPercentage = (ltvBpsNumber / 100).toFixed(2);

          console.log("APR percentage:", aprPercentage);
          console.log("LTV percentage:", ltvPercentage);

          // Update state variables instead of returning
          setInterestRate(parseFloat(aprPercentage));
          setLtv(parseFloat(ltvPercentage));

          const result = {
            apr: {
              basisPoints: aprBps.toString(),
              percentage: aprPercentage,
            },
            ltv: {
              basisPoints: ltvBps.toString(),
              percentage: ltvPercentage,
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

  // Calculate maxBorrowAmount using state values
  const maxBorrowAmount = (collateralValue * ltv) / 100;

  // initially will be zero, since not taken anything
  const currentBorrowAmount = parseFloat(borrowAmount) || 0;

  // console.log("this is the borrow amount", currentBorrowAmount);

  // calculating how much user want to take loan compared to the collateral given
  const currentLTV =
    collateralValue > 0 ? (currentBorrowAmount / collateralValue) * 100 : 0;

  useEffect(() => {
    // if no address, then we will return
    if (!address) return;

    setAnimateCards(true);

    // Set collateral amount
    setcollateralAmount(collateral_Amount || 10); // Fixed logical OR

    // fetching current eth value in usdt from the api call
    const getEthCurrentValue = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        );
        const data = await response.json();

        // this is the collateral equivalent in usd
        setcollateralValue(data?.ethereum?.usd * (collateral_Amount));
        console.log("this is the current eth value", data);

        return data.ethereum.usd;
      } catch (error) {
        console.error("Error fetching ETH price:", error);
      }
    };

    getEthCurrentValue();
  }, [address, collateral_Amount]); // Add proper dependencies

  // we will call this function when user is ready to take loan on avalanche
  // and accepted all the conditions => rate, underLTV, LIQUIDATION LEVEL
  const handleBorrow = async () => {
    try {
      // Debug logging
      console.log("Starting handleBorrow function");
      console.log("currentBorrowAmount:", currentBorrowAmount);
      console.log(
        "CONTRACT_ADDRESS:",
        process.env?.NEXT_PUBLIC_AVALANCHE_ADDRESS
      );

      setIsLoading(true);

      if (!currentBorrowAmount || currentBorrowAmount <= 0) {
        alert("Please enter a valid borrow amount");
        setIsLoading(false);
        return;
      }

      // Check if wallet is connected
      if (!window.ethereum) {
        alert("Please install MetaMask to continue");
        setIsLoading(false);
        return;
      }

      // Get Web3 provider and user address
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      console.log("User address:", address);

      // Network validation
      const network = await provider.getNetwork();
      const AVALANCHE_CHAIN_ID = 43113; // Use 43113 for testnet

      console.log("network chain id", network.chainId);

      // if (network.chainId !== AVALANCHE_CHAIN_ID) {
      //   alert("Please switch to Avalanche network");
      //   setIsLoading(false);
      //   return;
      // }

      // Contract setup
      const CONTRACT_ADDRESS = process.env?.NEXT_PUBLIC_AVALANCHE_ADDRESS;

      // Check if contract address is defined
      if (!CONTRACT_ADDRESS) {
        alert(
          "Contract address not configured. Please check your environment variables."
        );
        setIsLoading(false);
        return;
      }

      console.log("Contract address:", CONTRACT_ADDRESS);

      const CONTRACT_ABI = [
        "function borrowWithLock(bytes32 lockId, uint256 amount) external",
      ];

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      // todo
      // user will enter in usdt , we will convert it into our smallest units
      const borrowAmountInBaseUnits = 100*1000000;
      // const borrowAmountInBaseUnits = currentBorrowAmount*1000000;


      // todo uncommment this
      // if(!lock_id){
      //   console.log("no lock id found");
      //   throw new Error("no lock Id found");
        
      // }
      // Hardcoded lockId for testing
      const hardcodedLockId =
        "0xb4f325f65032e5f8a7edfecab988142a2cec8231c84a909d45667485c868b72e";

      // Call the contract function
      const tx = await contract.borrowWithLock(
        hardcodedLockId, // lock_id
        borrowAmountInBaseUnits
      );
      console.log("Transaction submitted:", tx.hash);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      // Success feedback
      alert(`Successfully borrowed! Transaction: ${tx.hash}`);

      
      

      // After successful transaction, call backend API
      try {
        const backendResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_ADDRESS}/borrowers-update/update-borrowing-details`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userAddress: userAddress,
              usdtAmount: currentBorrowAmount,
              lockId: hardcodedLockId,
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
    } catch (error) {
      console.error("Borrow transaction failed:", error);

      // Handle different error types
      if (error.code === 4001) {
        alert("Transaction rejected by user");
      } else if (error.code === -32603) {
        alert("Transaction failed. Please check your gas fees and try again.");
      } else if (error.message?.includes("insufficient funds")) {
        alert("Insufficient funds for gas fees");
      } else if (error.message?.includes("execution reverted")) {
        alert("Transaction reverted. Please check contract conditions.");
      } else {
        alert(`Transaction failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // progress bar colour changing function
  const getLTVColor = (ltv) => {
    if (ltv < 50) return "text-green-500";
    if (ltv < 70) return "text-yellow-500";
    return "text-red-500";
  };

  // progress bar bg colour changing function
  const getLTVBgColor = (ltv) => {
    if (ltv < 50) return "from-green-500/20 to-green-600/20";
    if (ltv < 70) return "from-yellow-500/20 to-yellow-600/20";
    return "from-red-500/20 to-red-600/20";
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div
          className={`transition-all duration-1000 ${
            animateCards
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Borrow Against Collateral
            </h1>
            <p className="text-slate-400">
              Secure your liquidity with our DeFi lending protocol
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Collateral Info */}
          <div
            className={`lg:col-span-1 transition-all duration-1000 delay-200 ${
              animateCards
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-slate-200">
                  <Shield className="h-5 w-5 text-blue-400" />
                  Your Collateral
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-white">
                    {collateralAmount} ETH
                  </div>
                  <div className="text-slate-400">
                    ${collateralValue?.toLocaleString()}
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-blue-500/20 text-blue-300 border-blue-500/30"
                  >
                    Deposited
                  </Badge>
                </div>

                <Separator className="bg-slate-700/50" />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Max LTV</span>
                    <span className="text-white font-medium">{ltv}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">
                      Interest Rate
                    </span>
                    <span className="text-green-400 font-medium">
                      {interestRate}% APR
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Max Borrow</span>
                    <span className="text-white font-medium">
                      ${maxBorrowAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Borrow Interface */}
          <div
            className={`lg:col-span-2 transition-all duration-1000 delay-400 ${
              animateCards
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-200">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  Borrow USDT
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Borrow Input */}
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">
                    Amount to Borrow (USDT)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={borrowAmount}
                      onChange={(e) => setBorrowAmount(e.target.value)}
                      className="bg-slate-800/50 border-slate-600/50 text-white text-lg h-12 pr-20 focus:border-purple-500/50 focus:ring-purple-500/20"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <Coins className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-slate-400">USDT</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Available: ${maxBorrowAmount.toLocaleString()}</span>
                    <button
                      onClick={() =>
                        setBorrowAmount(maxBorrowAmount.toString())
                      }
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Max
                    </button>
                  </div>
                </div>

                {/* LTV Indicator */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      Loan-to-Value Ratio
                    </span>
                    <span className={`font-bold ${getLTVColor(currentLTV)}`}>
                      {currentLTV.toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative">
                    <Progress
                      value={currentLTV}
                      className={`h-3 bg-slate-800/50 [&>div]:bg-gradient-to-r [&>div]:${getLTVBgColor(
                        currentLTV
                      )} [&>div]:transition-all [&>div]:duration-500`}
                    />
                    <div
                      className="absolute top-0 right-0 w-px h-3 bg-red-500/50"
                      style={{ right: `${100 - ltv}%` }}
                    >
                      <div className="absolute -top-6 -right-8 text-xs text-red-400">
                        Max {ltv}%
                      </div>
                    </div>
                  </div>
                  {currentLTV > 70 && (
                    <div className="flex items-center gap-2 text-orange-400 text-sm animate-pulse">
                      <AlertTriangle className="h-4 w-4" />
                      Approaching liquidation threshold
                    </div>
                  )}
                </div>

                {/* Loan Summary */}
                {currentBorrowAmount > 0 && (
                  <div className="bg-slate-800/30 rounded-lg p-4 space-y-3 animate-in slide-in-from-bottom-4 duration-500">
                    <h4 className="font-medium text-slate-200 flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-400" />
                      Loan Summary
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-slate-400">You'll Receive</div>
                        <div className="text-white font-medium">
                          ${currentBorrowAmount.toLocaleString()} USDT
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400">Annual Interest</div>
                        <div className="text-white font-medium">
                          $
                          {(
                            (currentBorrowAmount * interestRate) /
                            100
                          ).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  onClick={handleBorrow}
                  // disabled={
                  //   !borrowAmount ||
                  //   currentBorrowAmount > maxBorrowAmount ||
                  //   isLoading
                  // }
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-white font-medium group"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group-hover:gap-3 transition-all">
                      Borrow USDT
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Cards */}
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-all duration-1000 delay-600 ${
            animateCards
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          }`}
        >
          <Card className="bg-slate-900/30 backdrop-blur-xl border-slate-700/30 hover:bg-slate-900/50 transition-all duration-300">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <div className="text-slate-400 text-sm">Total Borrowed</div>
                <div className="text-white font-bold">$0</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/30 backdrop-blur-xl border-slate-700/30 hover:bg-slate-900/50 transition-all duration-300">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-slate-400 text-sm">Next Payment</div>
                <div className="text-white font-bold">No active loans</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/30 backdrop-blur-xl border-slate-700/30 hover:bg-slate-900/50 transition-all duration-300">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Percent className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <div className="text-slate-400 text-sm">Health Factor</div>
                <div className="text-green-400 font-bold">Safe</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
