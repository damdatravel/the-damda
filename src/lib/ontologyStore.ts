import {projectEngagement} from './engagementStore'
import type {SupabaseClient} from '@supabase/supabase-js'
import type {Graph} from './ontology'
export async function readOntology(s:SupabaseClient,projectId:number){const r=await s.from('discovery_ontologies').select('document,updated_at').eq('project_id',projectId).maybeSingle();if(r.error&&!['42P01','PGRST205'].includes(r.error.code))throw Error('개념 관계를 조회하지 못했습니다.');if(!r.data)return null;const graph=r.data.document as Graph,context=await projectEngagement(s,projectId),changed=(graph.confirmedFactsVersion||'[]')!==JSON.stringify(context?.confirmedFacts||[]);return{graph:changed?{...graph,edges:graph.edges.map(e=>({...e,review:'pending' as const}))}:graph,updatedAt:r.data.updated_at}}
