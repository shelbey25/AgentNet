import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[var(--crimson)] to-[var(--crimson-dark)] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">🔗 AgentNet</h1>
          <p className="text-xl text-white/90 mb-2">Universal Entity Platform</p>
          <p className="text-white/70 max-w-2xl mx-auto mb-8">
            A unified API for discovering, browsing, and interacting with any entity — people, businesses, sites, and opportunities. Build consumer apps on top of AgentNet.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/chat" className="bg-white text-[var(--crimson)] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
              Try the Chat
            </Link>
            <Link href="/search" className="border-2 border-white/50 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors">
              Browse Entities
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Platform Capabilities</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold mb-2">Search & Discovery</h3>
            <p className="text-gray-600 text-sm">Search across all entity types with filters for type, capability, category, and available actions.</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold mb-2">Tiered Browsing (L0/L1/L2)</h3>
            <p className="text-gray-600 text-sm">Progressive disclosure — L0 overview, L1 section details, L2 deep-dive. Efficient for both AI and humans.</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold mb-2">Actions</h3>
            <p className="text-gray-600 text-sm">Book appointments, place orders, send messages, request services, and check availability — all through the API.</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="text-3xl mb-3">🧠</div>
            <h3 className="text-lg font-semibold mb-2">Memory</h3>
            <p className="text-gray-600 text-sm">Per-user key-value memory store. Consumer apps can save context that persists across sessions.</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="text-3xl mb-3">🔌</div>
            <h3 className="text-lg font-semibold mb-2">Webhooks</h3>
            <p className="text-gray-600 text-sm">Entities can register webhooks for real-time notifications on bookings, orders, and messages.</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="text-3xl mb-3">🏗️</div>
            <h3 className="text-lg font-semibold mb-2">Entity CRUD</h3>
            <p className="text-gray-600 text-sm">Create and manage profiles, info sections, capabilities, services, and skills via the entities API.</p>
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section className="bg-gray-100 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">API Endpoints</h2>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Method</th>
                  <th className="text-left px-4 py-3 font-semibold">Endpoint</th>
                  <th className="text-left px-4 py-3 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr><td className="px-4 py-2 text-green-700 font-mono">GET</td><td className="px-4 py-2 font-mono text-xs">/api/v1/search</td><td className="px-4 py-2 text-gray-600">Search entities</td></tr>
                <tr><td className="px-4 py-2 text-green-700 font-mono">GET</td><td className="px-4 py-2 font-mono text-xs">/api/v1/browse/:id</td><td className="px-4 py-2 text-gray-600">Browse entity (L0/L1/L2)</td></tr>
                <tr><td className="px-4 py-2 text-green-700 font-mono">GET</td><td className="px-4 py-2 font-mono text-xs">/api/v1/profile/:id</td><td className="px-4 py-2 text-gray-600">Full profile + capabilities</td></tr>
                <tr><td className="px-4 py-2 text-green-700 font-mono">GET</td><td className="px-4 py-2 font-mono text-xs">/api/v1/memory</td><td className="px-4 py-2 text-gray-600">Get user memories</td></tr>
                <tr><td className="px-4 py-2 text-blue-700 font-mono">POST</td><td className="px-4 py-2 font-mono text-xs">/api/v1/memory</td><td className="px-4 py-2 text-gray-600">Save user memory</td></tr>
                <tr><td className="px-4 py-2 text-blue-700 font-mono">POST</td><td className="px-4 py-2 font-mono text-xs">/api/v1/book</td><td className="px-4 py-2 text-gray-600">Book appointment</td></tr>
                <tr><td className="px-4 py-2 text-blue-700 font-mono">POST</td><td className="px-4 py-2 font-mono text-xs">/api/v1/order</td><td className="px-4 py-2 text-gray-600">Place order</td></tr>
                <tr><td className="px-4 py-2 text-blue-700 font-mono">POST</td><td className="px-4 py-2 font-mono text-xs">/api/v1/message</td><td className="px-4 py-2 text-gray-600">Send message</td></tr>
                <tr><td className="px-4 py-2 text-blue-700 font-mono">POST</td><td className="px-4 py-2 font-mono text-xs">/api/v1/entities/*</td><td className="px-4 py-2 text-gray-600">Create entities (user, profile, info-section, etc.)</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm">
        <p>AgentNet Platform — Built for consumer apps to discover and interact with any entity.</p>
      </footer>
    </div>
  );
}
