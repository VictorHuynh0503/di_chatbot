export interface ShapResult {
  base_value: number
  values: Record<string, number>
}

export interface GraphNode {
  id: string
  label: string
  type: 'root' | 'factor'
  value?: string
  confidence?: number
  raw_value?: number
  shap_value?: number
  direction?: 'positive' | 'negative'
  importance_pct?: number
}

export interface GraphEdge {
  source: string
  target: string
  weight: number
  direction: 'positive' | 'negative'
}

export interface AnalyzeResult {
  prediction: string
  prediction_index: number
  probabilities: Record<string, number>
  shap: ShapResult
  graph: { nodes: GraphNode[]; edges: GraphEdge[] }
}

export interface ChatResponse {
  routed_intent: string | null
  confidence: string
  message?: string
  context_data: Record<string, unknown> | AnalyzeResult
}

const BASE = '/api'

export async function callAnalyze(params?: Record<string, number>): Promise<AnalyzeResult> {
  const res = await fetch(`${BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params ?? {}),
  })
  return res.json()
}

export async function callChat(message: string): Promise<ChatResponse> {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  return res.json()
}

export async function callEvents() {
  const res = await fetch(`${BASE}/events`)
  return res.json()
}
