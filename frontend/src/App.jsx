import { useState } from 'react'

function App() {
  const [walletAddress, setWalletAddress] = useState('')
  const [balance, setBalance] = useState(0)
  const [contribution, setContribution] = useState('')

  // Dummy values for the demo UI
  const targetAmount = 1500;
  const currentAmount = 500;

  const connectWallet = () => {
    // In a real dApp, this integrates with Freighter/Albedo provider.
    // Given the scope, we'll mock the connection.
    setWalletAddress('GCO2V...F4P9L')
    setBalance(2000)
  }

  const handleContribute = (e) => {
    e.preventDefault()
    if (!walletAddress) {
      alert("Please connect your wallet first.")
      return;
    }
    const amount = parseInt(contribution)
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.")
      return;
    }
    if (amount > balance) {
      alert("Insufficient balance.")
      return;
    }

    // Simulate smart contract call
    setBalance(prev => prev - amount)
    setContribution('')
    alert(`Successfully contributed ${amount} tokens to the campaign!`)
  }

  const progressPercentage = Math.min(100, Math.round((currentAmount / targetAmount) * 100))

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <nav className="p-4 flex justify-between items-center border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 flex items-center gap-2">
          <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          SoroFund
        </div>
        {walletAddress ? (
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">Balance: <span className="text-white font-medium">{balance} TST</span></span>
            <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm transition-all duration-200 shadow-sm font-medium">
              {walletAddress}
            </button>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5"
          >
            Connect Wallet
          </button>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-xl mx-auto mt-12 p-6">

        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          {/* Decorative background gradient */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all duration-500"></div>

          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-wider uppercase rounded-full border border-emerald-500/20 mb-4">Active Campaign</span>

            <h1 className="text-3xl font-extrabold mb-2 tracking-tight">Decentralized Web3 Builder</h1>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
              Support the next generation of Soroban ecosystem tools. Your contributions will help build open-source infrastructure for Stellar.
            </p>

            {/* Progress Section */}
            <div className="mb-8 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
              <div className="flex justify-between items-end mb-3">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Raised</span>
                  <span className="text-2xl font-bold text-white">{currentAmount} <span className="text-lg text-indigo-400">TST</span></span>
                </div>
                <div className="text-right flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Target</span>
                  <span className="text-gray-400 font-medium">{targetAmount} TST</span>
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

            {/* Action Form */}
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
                    <span className="text-gray-500 font-medium">TST</span>
                    {walletAddress && (
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
                disabled={!walletAddress || !contribution}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform ${!walletAddress || !contribution
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5'
                  }`}
              >
                {!walletAddress ? 'Connect Wallet to Contribute' : 'Contribute Now'}
              </button>
            </form>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center flex flex-col gap-2 relative z-10">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            Smart Contract Audited
          </p>
          <p className="text-xs text-gray-600">Powered by Soroban on Stellar</p>
        </div>
      </main>

      {/* Global styles for the animated stripes in progress bar */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes stripes {
          0% { background-position: 1rem 0; }
          100% { background-position: 0 0; }
        }
      `}} />
    </div>
  )
}

export default App
