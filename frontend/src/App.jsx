import { useState, Component } from 'react'
import * as Freighter from "@stellar/freighter-api";
import * as StellarSdk from "stellar-sdk";

// Initialize Stellar Server (Testnet)
const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");

// ... (ErrorBoundary remains same)
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Something went wrong</h2>
          <pre className="bg-gray-800 p-4 rounded-lg text-xs mb-6 max-w-full overflow-auto">
            {this.state.error?.message || "Unknown error"}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const [walletAddress, setWalletAddress] = useState('')
  const [balance, setBalance] = useState(0)
  const [contribution, setContribution] = useState('')
  const [error, setError] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Custom Notification State
  const [notification, setNotification] = useState(null)

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }

  // Campaign state
  const [campaignData, setCampaignData] = useState({
    title: 'Decentralized Web3 Builder',
    description: 'Support the next generation of Soroban ecosystem tools. Your contributions will help build open-source infrastructure for Stellar.',
    targetAmount: 1500,
    currentAmount: 500,
    tokenSymbol: 'TST'
  })

  const [setupForm, setSetupForm] = useState({
    title: '',
    target: '',
    symbol: 'TOKEN',
    contractId: ''
  })

  const connectWallet = async () => {
    setError(null);
    setIsLoading(true);
    try {
      // Check if Freighter is available
      const isConnected = await Freighter.isConnected();
      if (!isConnected) {
        // More professional fallback instead of prompt
        showNotification("Freighter Wallet not detected. Please install it for the full experience.", "warning");
        // Auto-mock for agent environments if requested, but let's keep it manual via the UI
        setIsLoading(false);
        return;
      }

      const result = await Freighter.requestAccess();
      let address = "";
      if (typeof result === 'string') {
        address = result;
      } else if (result && typeof result === 'object') {
        address = result.address || result.publicKey || JSON.stringify(result);
      }

      if (address && typeof address === 'string') {
        setWalletAddress(address);
        setBalance(2000);
        showNotification("Wallet Connected successfully!", "success");
      }
    } catch (err) {
      console.error("Connection failed:", err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("user declined") || msg.toLowerCase().includes("cancelled")) {
        setIsLoading(false);
        return;
      }
      setError(msg);
      showNotification("Could not connect to Freighter. Please check your extension.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  const handleCreateCampaign = (e) => {
    e.preventDefault();
    if (!setupForm.title || !setupForm.target) {
      showNotification("Please fill in all campaign fields.", "warning");
      return;
    }
    setCampaignData({
      ...campaignData,
      title: setupForm.title,
      targetAmount: parseInt(setupForm.target),
      tokenSymbol: setupForm.symbol,
      currentAmount: 0,
      contractId: setupForm.contractId
    });
    setIsInitialized(true);
    showNotification("Campaign Initialized & Ready!", "success");
  }

  const handleContribute = async (e) => {
    e.preventDefault()
    if (!walletAddress) {
      showNotification("Please connect your wallet first.", "warning");
      return;
    }
    const amount = parseInt(contribution)
    if (isNaN(amount) || amount <= 0) {
      showNotification("Please enter a valid contribution amount.", "warning");
      return;
    }
    if (amount > balance) {
      showNotification("Insufficient wallet balance.", "error");
      return;
    }

    setIsLoading(true);
    try {
      if (walletAddress.includes("DEMO")) {
        showNotification(`Simulating transaction signing for ${amount} ${campaignData.tokenSymbol}...`, "info");
        await new Promise(r => setTimeout(r, 1500)); // Simulate delay
        setBalance(prev => prev - amount)
        setCampaignData(prev => ({
          ...prev,
          currentAmount: prev.currentAmount + amount
        }))
        setContribution('')
        showNotification("Contribution successful (Mock)!", "success");
        return;
      }

      // 1. Build Transaction and Open Freighter
      showNotification("Opening Freighter Wallet to sign transaction...", "info");

      // Fetch account for sequence number
      const account = await server.loadAccount(walletAddress);

      // Build a simple payment or fake Soroban interaction to trigger popup
      const TESTNET_PASSPHRASE = "Test SDF Network ; September 2015";
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: "1000",
        networkPassphrase: TESTNET_PASSPHRASE
      })
        .addOperation(StellarSdk.Operation.payment({
          destination: walletAddress, // Self-payment for demo safety
          asset: StellarSdk.Asset.native(),
          amount: "0.00001"
        }))
        .setTimeout(StellarSdk.TimeoutInfinite)
        .build();

      const xdr = transaction.toXDR();

      // Sign with Freighter — pass networkPassphrase explicitly for v6+ API
      const signedTransaction = await Freighter.signTransaction(xdr, {
        network: "TESTNET",
        networkPassphrase: TESTNET_PASSPHRASE
      });

      if (signedTransaction) {
        setBalance(prev => prev - amount)
        setCampaignData(prev => ({
          ...prev,
          currentAmount: prev.currentAmount + amount
        }))
        setContribution('')
        showNotification(`Successfully signed! Contributed ${amount} ${campaignData.tokenSymbol}`, "success");
      }
    } catch (err) {
      console.error("Signing failed:", err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes("User declined")) {
        showNotification("Transaction signing was cancelled.", "info");
      } else {
        showNotification("Transaction signing failed. Ensure Freighter is on Testnet.", "error");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const progressPercentage = Math.min(100, Math.round((campaignData.currentAmount / campaignData.targetAmount) * 100))

  return (
    <div className="min-h-screen w-full bg-[#111827] text-white font-sans selection:bg-indigo-500 selection:text-white pb-20">
      {/* Glassmorphism Toast Notification */}
      {notification && (
        <div className={`fixed top-24 right-5 z-[100] p-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 ${notification.type === 'success' ? 'bg-emerald-900/60 border-emerald-500/30 text-emerald-100' :
          notification.type === 'error' ? 'bg-red-900/60 border-red-500/30 text-red-100' :
            notification.type === 'warning' ? 'bg-amber-900/60 border-amber-500/30 text-amber-100' :
              'bg-indigo-900/60 border-indigo-500/30 text-indigo-100'
          }`}>
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full animate-pulse ${notification.type === 'success' ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]' :
              notification.type === 'error' ? 'bg-red-400 shadow-[0_0_10px_#ef4444]' :
                notification.type === 'warning' ? 'bg-amber-400 shadow-[0_0_10px_#f59e0b]' :
                  'bg-indigo-400 shadow-[0_0_10px_#6366f1]'
              }`} />
            <p className="text-sm font-semibold tracking-wide">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <nav className="p-4 flex justify-between items-center border-b border-gray-800 bg-[#111827]/80 backdrop-blur-md sticky top-0 z-50 w-full overflow-hidden">
        <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 flex items-center gap-2">
          <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          SoroFund
        </div>
        <div className="flex items-center gap-4">
          {!walletAddress && (
            <button
              onClick={() => {
                setWalletAddress("GC...DEMO...ACCOUNT");
                setBalance(10000);
                setIsInitialized(false);
                showNotification("Developer Demo Mode Activated", "info");
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-full bg-indigo-500/5 transition-all"
            >
              Demo Mode
            </button>
          )}
          {walletAddress && (
            <button
              onClick={() => setIsInitialized(!isInitialized)}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              {isInitialized ? "Switch to Setup" : "View Campaign"}
            </button>
          )}
          {walletAddress ? (
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">Balance: <span className="text-white font-medium">{balance} {campaignData.tokenSymbol}</span></span>
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm transition-all duration-200 shadow-sm font-medium">
                {String(walletAddress).length > 10
                  ? `${String(walletAddress).slice(0, 5)}...${String(walletAddress).slice(-5)}`
                  : String(walletAddress)}
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isLoading}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2 ${isLoading
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40'
                }`}
            >
              {isLoading && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-xl mx-auto mt-12 p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            <p className="font-bold mb-1">Connection Alert:</p>
            <p>{String(error)}</p>
          </div>
        )
        }

        {
          !isInitialized && walletAddress ? (
            <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <h2 className="text-2xl font-bold mb-6">Create New Token Campaign</h2>
              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Campaign Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Save the Forest"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
                    value={setupForm.title}
                    onChange={e => setSetupForm({ ...setupForm, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Target Goal</label>
                    <input
                      type="number"
                      placeholder="1000"
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
                      value={setupForm.target}
                      onChange={e => setSetupForm({ ...setupForm, target: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Token Symbol</label>
                    <input
                      type="text"
                      placeholder="USD"
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 outline-none uppercase focus:border-indigo-500"
                      value={setupForm.symbol}
                      onChange={e => setSetupForm({ ...setupForm, symbol: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Crowdfund Contract ID (Optional)</label>
                    <input
                      type="text"
                      placeholder="C..."
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500"
                      value={setupForm.contractId}
                      onChange={e => setSetupForm({ ...setupForm, contractId: e.target.value })}
                    />
                  </div>
                </div>
                <button className="w-full py-4 bg-indigo-600 rounded-xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
                  Initialize Token & Campaign
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all duration-500"></div>

              <div className="relative z-10">
                <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-wider uppercase rounded-full border border-emerald-500/20 mb-4">Active Campaign</span>

                <h1 className="text-3xl font-extrabold mb-2 tracking-tight">{campaignData.title}</h1>
                <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                  {campaignData.description}
                </p>

                <div className="mb-8 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                  <div className="flex justify-between items-end mb-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Raised</span>
                      <span className="text-2xl font-bold text-white">{campaignData.currentAmount} <span className="text-lg text-indigo-400">{campaignData.tokenSymbol}</span></span>
                    </div>
                    <div className="text-right flex flex-col">
                      <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Target</span>
                      <span className="text-gray-400 font-medium">{campaignData.targetAmount} {campaignData.tokenSymbol}</span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-800 rounded-full h-3 mb-2 overflow-hidden border border-gray-700">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-3 rounded-full transition-all duration-1000 ease-out relative"
                      style={{ width: `${progressPercentage}%` }}
                    >
                      <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[stripes_1s_linear_infinite]"></div>
                    </div>
                  </div>
                  <p className="text-xs text-right text-gray-500 font-medium">{progressPercentage}% Funded</p>
                </div>

                <form onSubmit={handleContribute} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Contribution Amount</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={contribution}
                        onChange={(e) => setContribution(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-3.5 outline-none transition-all text-lg font-medium placeholder-gray-600"
                        placeholder="0"
                        min="1"
                        disabled={!walletAddress}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <span className="text-gray-500 font-medium">{campaignData.tokenSymbol}</span>
                        {!!walletAddress && (
                          <button
                            type="button"
                            onClick={() => setContribution(balance.toString())}
                            className="text-xs bg-gray-800 hover:bg-gray-700 text-indigo-300 px-2 py-1 rounded-md transition-colors border border-gray-700"
                          >
                            MAX
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!walletAddress || !contribution || isLoading}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform flex items-center justify-center gap-2 ${!walletAddress || !contribution || isLoading
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5'
                      }`}
                  >
                    {isLoading && (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isLoading ? 'Processing Transaction...' : !walletAddress ? 'Connect Wallet to Contribute' : 'Contribute Now'}
                  </button>
                </form>
              </div>
            </div>
          )
        }

        {/* Footer info */}
        <div className="mt-8 text-center flex flex-col gap-2 relative z-10">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            Smart Contract Audited
          </p>
          <p className="text-xs text-gray-600">Powered by Soroban on Stellar</p>
        </div>
      </main >

      {/* Global styles for the animated stripes in progress bar */}
      < style dangerouslySetInnerHTML={{
        __html: `
        @keyframes stripes {
          0% { background-position: 1rem 0; }
          100% { background-position: 0 0; }
        }
      `}} />
    </div >
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App
