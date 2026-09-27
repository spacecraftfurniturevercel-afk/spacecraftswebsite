import { buildOrganizationCommerceGraph } from '../lib/merchantStructuredData'

export default function OrganizationStructuredData() {
  const graph = buildOrganizationCommerceGraph()
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}
