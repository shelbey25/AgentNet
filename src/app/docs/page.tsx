export default function DocsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">API Documentation</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-8">
        {/* Overview */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Overview</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            AgentNet provides a structured API for searching people and businesses in Tuscaloosa.
            Public endpoints allow unauthenticated read access with rate limits.
            Agent endpoints require API keys with scoped permissions.
          </p>
        </section>

        {/* Auth */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Authentication</h2>
          <div className="bg-gray-50 rounded-lg p-4 text-sm">
            <p className="text-gray-600 mb-2"><strong>Public endpoints:</strong> No auth required (30 req/min rate limit)</p>
            <p className="text-gray-600 mb-2"><strong>Agent endpoints:</strong> API key via Authorization header</p>
            <code className="block bg-gray-900 text-green-400 p-3 rounded mt-2 text-xs">
              Authorization: Bearer agn_your_api_key_here
            </code>
          </div>
        </section>

        {/* Public Endpoints */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Public Endpoints</h2>
          <div className="space-y-4">
            <EndpointDoc
              method="GET"
              path="/api/search"
              description="Search across all public profiles"
              params={[
                { name: "q", desc: "Search query (matches name, bio, skills, services)" },
                { name: "type", desc: "Filter: 'person' or 'business'" },
                { name: "status", desc: "Filter: 'available', 'looking_for_work', 'hiring', 'busy'" },
                { name: "page", desc: "Page number (default: 1)" },
                { name: "limit", desc: "Results per page (default: 20, max: 50)" },
              ]}
              example={`GET /api/search?q=math+tutor&type=person&status=available`}
            />
            <EndpointDoc
              method="GET"
              path="/api/profiles/:id"
              description="Get a single public profile by ID"
              params={[]}
              example={`GET /api/profiles/abc-123-uuid`}
            />
          </div>
        </section>

        {/* Agent Endpoints */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Agent Endpoints (API Key Required)</h2>
          <div className="space-y-4">
            <EndpointDoc
              method="GET"
              path="/api/v1/search"
              description="Agent search — same params as public search"
              params={[]}
              example={`curl -H "Authorization: Bearer agn_xxx" https://agentnet.app/api/v1/search?q=tutor`}
              scope="read:search"
            />
            <EndpointDoc
              method="GET"
              path="/api/v1/profiles/:id"
              description="Agent profile read"
              params={[]}
              example={`curl -H "Authorization: Bearer agn_xxx" https://agentnet.app/api/v1/profiles/abc-123`}
              scope="read:profiles"
            />
            <EndpointDoc
              method="POST"
              path="/api/v1/messages/draft"
              description="Create a draft message (human must review before sending)"
              params={[
                { name: "recipientId", desc: "Target user ID (required)" },
                { name: "subject", desc: "Message subject (required)" },
                { name: "body", desc: "Message body (required)" },
              ]}
              example={`curl -X POST -H "Authorization: Bearer agn_xxx" -H "Content-Type: application/json" -d '{"recipientId":"user-123","subject":"Tutoring inquiry","body":"Are you available?"}' https://agentnet.app/api/v1/messages/draft`}
              scope="write:messages.draft"
            />
          </div>
        </section>

        {/* Scopes */}
        <section>
          <h2 className="text-xl font-semibold mb-3">API Key Scopes</h2>
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 font-medium text-gray-700">Scope</th>
                  <th className="text-left p-3 font-medium text-gray-700">Access</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="p-3"><code className="text-xs bg-gray-200 px-2 py-0.5 rounded">read:search</code></td>
                  <td className="p-3 text-gray-600">Search profiles and listings</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-3"><code className="text-xs bg-gray-200 px-2 py-0.5 rounded">read:profiles</code></td>
                  <td className="p-3 text-gray-600">Read individual profile details</td>
                </tr>
                <tr>
                  <td className="p-3"><code className="text-xs bg-gray-200 px-2 py-0.5 rounded">write:messages.draft</code></td>
                  <td className="p-3 text-gray-600">Create draft messages (human review required)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Rate Limits */}
        <section>
          <h2 className="text-xl font-semibold mb-3">Rate Limits</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Public endpoints: 30 requests/minute per IP</li>
            <li>• Agent endpoints: 60 requests/minute per API key (configurable)</li>
            <li>• Messaging: 20 messages/hour, 5 first-contacts/day</li>
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
