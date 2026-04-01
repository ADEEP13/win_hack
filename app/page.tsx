export default function Home() {
  return (
    <div className="space-y-12">
      {/* Top Navigation */}
      <nav className="flex justify-between items-center py-6 px-8 bg-white shadow-sm sticky top-0 z-50">
        <div className="text-2xl font-bold text-agri-green">🌾 JanDhan Plus</div>
        <a
          href="/login"
          className="bg-agri-green text-white px-6 py-2 rounded-lg font-bold hover:opacity-90 transition"
        >
          Login / Sign Up
        </a>
      </nav>

      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold mb-4 text-agri-green">
          Fair Prices. Transparent Supply. Trusted Food.
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          Blockchain-powered agricultural marketplace connecting farmers with buyers directly.
          No middlemen. No hidden costs. Every transaction recorded immutably.
        </p>

        <a
          href="/login"
          className="inline-block bg-agri-green text-white px-8 py-3 rounded-lg text-lg font-bold hover:opacity-90 transition mb-16"
        >
          Get Started Now →
        </a>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16">
          {/* Farmer */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition">
            <div className="text-5xl mb-4">👨‍🌾</div>
            <h2 className="text-2xl font-bold text-agri-green mb-3">For Farmers</h2>
            <p className="text-slate-600 mb-6">
              List your crops at fair prices. Get paid directly. No middlemen taking your profit.
            </p>
            <a
              href="/login"
              className="inline-block bg-agri-green text-white px-6 py-2 rounded-lg hover:opacity-90 transition"
            >
              Login as Farmer
            </a>
          </div>

          {/* Buyer */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition">
            <div className="text-5xl mb-4">🏪</div>
            <h2 className="text-2xl font-bold text-agri-green mb-3">For Buyers</h2>
            <p className="text-slate-600 mb-6">
              Connect directly with farmers. Get fresh produce at fair prices. Verified quality.
            </p>
            <a
              href="/login"
              className="inline-block bg-agri-green text-white px-6 py-2 rounded-lg hover:opacity-90 transition"
            >
              Login as Buyer
            </a>
          </div>

          {/* Consumer */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition">
            <div className="text-5xl mb-4">👤</div>
            <h2 className="text-2xl font-bold text-agri-green mb-3">For Consumers</h2>
            <p className="text-slate-600 mb-6">
              Scan QR codes. See where your food came from. Know you paid fairly. Trust verified.
            </p>
            <a
              href="/login"
              className="inline-block bg-agri-green text-white px-6 py-2 rounded-lg hover:opacity-90 transition"
            >
              Login as Consumer
            </a>
          </div>

          {/* Admin */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-agri-green mb-3">For Admins</h2>
            <p className="text-slate-600 mb-6">
              Monitor all transactions. Detect fraud. See live blockchain records. Full transparency.
            </p>
            <a
              href="/login"
              className="inline-block bg-agri-green text-white px-6 py-2 rounded-lg hover:opacity-90 transition"
            >
              Login as Admin
            </a>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="bg-white rounded-lg shadow-md p-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="text-3xl mb-3">⛓️</div>
          <h3 className="text-xl font-bold mb-2 text-agri-green">Immutable Records</h3>
          <p className="text-slate-600">
            Every transaction recorded on blockchain. Cannot be altered. Complete audit trail.
          </p>
        </div>
        <div>
          <div className="text-3xl mb-3">🛡️</div>
          <h3 className="text-xl font-bold mb-2 text-agri-green">Fraud Detection</h3>
          <p className="text-slate-600">
            AI detects suspicious offers. Protects farmers from exploitation. Voice alerts.
          </p>
        </div>
        <div>
          <div className="text-3xl mb-3">🏦</div>
          <h3 className="text-xl font-bold mb-2 text-agri-green">Direct Payments</h3>
          <p className="text-slate-600">
            Bank transfers (UPI/NEFT). No crypto. Direct to farmer accounts. Fast settlement.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="text-center">
        <h2 className="text-3xl font-bold text-agri-green mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { num: 1, title: 'Farmer Lists', desc: 'Upload crop photo' },
            { num: 2, title: 'Quality Grade', desc: 'AI verifies quality' },
            { num: 3, title: 'Buyer Offers', desc: 'Fair price offer' },
            { num: 4, title: 'Payment', desc: 'UPI/Bank transfer' },
            { num: 5, title: 'Trace', desc: 'Scan & verify' },
          ].map((step) => (
            <div key={step.num} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-3xl font-bold text-agri-green mb-2">{step.num}</div>
              <h3 className="font-bold text-agri-green mb-1">{step.title}</h3>
              <p className="text-sm text-slate-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
