// Original evidence is copied at the boundary. Workflow state never becomes measurement evidence.
export function originalEvidence(observed:unknown):any[]{
 if(!Array.isArray(observed))return []
 return JSON.parse(JSON.stringify(observed.filter(x=>!['improvement-workflow','analysis-context','engine-runs'].includes(x?.kind))))
}
export function measurementReferences(observed:unknown):any[]{
 return originalEvidence(observed).flatMap(x=>x.measurements||[]).map(x=>x.latest||x).filter(x=>x.question_id&&x.channel)
}
export function attachWorkflow(observed:unknown,envelope:unknown):any[]{
 const metadata=Array.isArray(observed)?observed.filter(x=>['analysis-context','engine-runs'].includes(x?.kind)):[]
 return [...originalEvidence(observed),...JSON.parse(JSON.stringify(metadata)),JSON.parse(JSON.stringify(envelope))]
}
