export default function DocsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">API Documentation</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-8">
        {/* Overview */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Overview</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            AgentNet is a normalized action layer between AI agents and businesses.
            Businesses register capabilities and endpoints. The platform exposes a
            single standardized API that agents use. Agents never interact with
            business APIs directly.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mt-3 text-sm text-gray-600 font-mono">
            Agent → Platform API → Action Adapter → Business Endpoint
          </div>
        </section>

        {/* Chat API */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Chat API (GPT-Powered)</h2>
          <p className="text-gray-600 text-sm mb-3">
            Send natural language messages and the AI will search, discover, and
            take actions through the platform API automatically.
          </p>
          <EndpointDoc
            method="POST"
            path="/api/chat"
            description="Send messages to the GPT-powered agent. It has MCP access to all platform endpoints."
            params={[
              { name: "messages", desc: "Array of {role, content} — conversation history" },
              { name: "session_id", desc: "Optional session ID for persistence" },
            ]}
            example={`curl -X POST http://localhost:3000/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{"messages":[{"role":"user","content":"Find me a barber near campus"}]}'`}
          />
        </section>

        {/* Search & Discovery */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Search & Discovery</h2>
          <div className="space-y-4">
            <EndpointDoc
              method="GET"
              path="/api/v1/search"
              description="Search businesses, people, and services. Returns capabilities and action URLs."
              params={[
                { name: "q", desc: "Text query" },
                { name: "type", desc: "'person' or 'business'" },
                { name: "status", desc: "'available', 'looking_for_work', 'hiring'" },
                { name: "capability", desc: "'ordering', 'booking', 'quotes', 'availability'" },
              ]}
              example={`GET /api/v1/search?q=barber&type=business&capability=booking`}
            />
            <EndpointDoc
              method="GET"
              path="/api/v1/profile/:id"
              description="Full profile with capabilities, services, and available endpoints"
              params={[]}
              example={`GET /api/v1/profile/abc-123`}
            />
          </div>
        </section>

        {/* Info System */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Indexable Info System</h2>
          <p className="text-gray-600 text-sm mb-3">
            Businesses expose structured data sections (menu, services, hours, etc.)
            navigable like a webpage hierarchy.
          </p>
          <div className="space-y-4">
            <EndpointDoc
              method="GET"
              path="/api/v1/info/:business_id"
              description="List all info sections for a business"
              params={[]}
              example={`GET /api/v1/info/rest_123`}
            />
            <EndpointDoc
              method="GET"
              path="/api/v1/info/:business_id/:section"
              description="Get specific section data"
              params={[]}
              example={`GET /api/v1/info/rest_123/menu
# Response: {"items":[{"id":"chicken_breast","name":"Chicken Breast","price":6.99}]}`}
            />
          </div>
        </section>

        {/* Action Endpoints */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Action Endpoints</h2>
          <p className="text-gray-600 text-sm mb-3">
            Standardized endpoints for agent actions. The platform routes them through
            the appropriate adapter (local DB or external business API).
          </p>
          <div className="space-y-4">
            <EndpointDoc
              method="GET"
              path="/api/v1/availability"
              description="Check available time slots"
              params={[
                { name: "business_id", desc: "Business profile ID (required)" },
                { name: "date", desc: "YYYY-MM-DD (required)" },
                { name: "service", desc: "Service name (optional)" },
              ]}
              example={`GET /api/v1/availability?business_id=barber_22&date=2026-04-04&service=haircut`}
            />
            <EndpointDoc
              method="POST"
              path="/api/v1/book"
              description="Book an appointment"
              params={[
                { name: "business_id", desc: "Business profile ID" },
                { name: "service", desc: "Service name" },
                { name: "time", desc: "ISO datetime" },
              ]}
              example={`POST /api/v1/book
{"business_id":"barber_22","service":"haircut","time":"2026-04-04T15:00"}`}
            />
            <EndpointDoc
              method="POST"
              path="/api/v1/order"
              description="Place an order"
              params={[
                { name: "business_id", desc: "Business profile ID" },
                { name: "items", desc: "Array of {id, qty}" },
                { name: "pickup_time", desc: "HH:MM" },
              ]}
              example={`POST /api/v1/order
{"business_id":"rest_123","items":[{"id":"chicken_breast","qty":2}],"pickup_time":"18:30"}`}
            />
            <EndpointDoc
              method="POST"
              path="/api/v1/message"
              description="Send a message"
              params={[
                { name: "recipient_id", desc: "User or profile ID" },
                { name: "message", desc: "Message text" },
                { name: "subject", desc: "Subject line" },
              ]}
              example={`POST /api/v1/message
{"recipient_id":"user_21","message":"Are you available for tutoring?"}`}
            />
            <EndpointDoc
              method="POST"
              path="/api/v1/request_service"
              description="Request a service from a provider"
              params={[
                { name: "provider_id", desc: "Provider profile ID" },
                { name: "service", desc: "Service name" },
                { name: "time_preference", desc: "Preferred time" },
              ]}
              example={`POST /api/v1/request_service
{"provider_id":"user_921","service":"math tutoring","time_preference":"evening"}`}
            />
            <EndpointDoc
              method="POST"
              path="/api/v1/get_quote"
              description="Request a price quote"
              params={[
                { name: "business_id", desc: "Business profile ID" },
                { name: "service", desc: "Service name" },
                { name: "details", desc: "Freeform details object" },
              ]}
              example={`POST /api/v1/get_quote
{"business_id":"svc_22","service":"lawn mowing","details":{"yard_size":"0.25 acre"}}`}
            />
          </div>
        </section>

        {/* Onboarding */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Business Onboarding</h2>
          <EndpointDoc
            method="POST"
            path="/api/v1/business/onboard"
            description="Register or update a business profile with capabilities, endpoints, and info"
            params={[
              { name: "name", desc: "Business name (required)" },
              { name: "capabilities", desc: "Array: ordering, booking, messaging, etc." },
              { name: "endpoints", desc: "Object mapping action → external URL" },
              { name: "info_sections", desc: "Object mapping section → data" },
            ]}
            example={`POST /api/v1/business/onboard
{"name":"Tuscaloosa Barber","capabilities":["booking","availability","quotes"],
 "info_sections":{"services":{"services":[{"name":"Haircut","price":25}]}}}`}
            scope="Requires session auth"
          />
        </section>

        {/* Capabilities */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Capabilities</h2>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 font-medium text-gray-700">Capability</th>
                  <th className="text-left p-3 font-medium text-gray-700">Action Endpoint</th>
                  <th className="text-left p-3 font-medium text-gray-700">Example</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["ordering", "POST /api/v1/order", "Place food orders"],
                  ["booking", "POST /api/v1/book", "Book appointments"],
                  ["availability", "GET /api/v1/availability", "Check time slots"],
                  ["quotes", "POST /api/v1/get_quote", "Get price estimates"],
                  ["service_requests", "POST /api/v1/request_service", "Request services"],
                  ["messaging", "POST /api/v1/message", "Send messages"],
                ].map(([cap, endpoint, desc]) => (
                  <tr key={cap} className="border-b border-gray-100">
                    <td className="p-3"><code className="text-xs bg-gray-200 px-2 py-0.5 rounded">{cap}</code></td>
                    <td className="p-3 font-mono text-xs text-gray-700">{endpoint}</td>
                    <td className="p-3 text-gray-600">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Rate Limits */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Rate Limits</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Public endpoints: 30 requests/minute per IP</li>
            <li>• API key endpoints: 60 requests/minute per key</li>
            <li>• Chat API: 20 messages/minute per session</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function EndpointDoc({
  method,
  path,
  description,
  params,
  example,
  scope,
}: {
  method: string;
  path: string;
  description: string;
  params: { name: string; desc: string }[];
  example: string;
  scope?: string;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 flex items-center gap-3">
        <span className={`text-xs font-bold px-2 py-1 rounded ${method === "GET" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{method}</span>
        <code className="text-sm font-medium">{path}</code>
        {scope && <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full ml-auto">{scope}</span>}
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-2">{description}</p>
        {params.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Parameters:</p>
            {params.map((p) => (
              <p key={p.name} className="text-xs text-gray-500">
                <code className="text-gray-700">{p.name}</code> — {p.desc}
              </p>
            ))}
          </div>
        )}
        <code className="block bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">{example}</code>
      </div>
    </div>
  );
}
