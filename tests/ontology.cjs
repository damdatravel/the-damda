const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm')
const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/ontology.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports});const o=m.exports
function fixture(service,target,type,relation){const nodes=[{id:1,dimension_type:'SERVICE',dimension_value:service,is_active:true},{id:2,dimension_type:type,dimension_value:target,is_active:true}];const sources={'project:main_services':`${service} 서비스는 ${target}을 대상으로 합니다.`};const edge=(id,from,to,rel)=>({id,from,to,relation:rel,status:'supported',review:'approved',note:'확인',evidence:[{source:'project:main_services',quote:sources['project:main_services']}]});return{version:1,nodes,sources,edges:[edge('provides',0,1,'provides'),edge('target',1,2,relation)]}}
for(const graph of [fixture('캐리어 배송','해외 여행자','FOR_WHOM','serves'),fixture('검색 진단','소상공인','FOR_WHOM','serves')]){
 assert(graph.edges.every(e=>o.validEdge(e,graph.nodes)))
 assert(o.allowsCombination(o.approvedEdges(graph,graph.nodes),[1,2],graph.nodes))
 const pending={...graph,edges:graph.edges.map(e=>({...e,review:'pending'}))}
 assert.equal(o.approvedEdges(pending,graph.nodes).length,0)
 const invalidQuote={...graph,edges:graph.edges.map(e=>({...e,evidence:[{source:'project:main_services',quote:'전국 모든 지역 배송 가능'}]}))}
 assert.equal(o.approvedEdges(invalidQuote,graph.nodes).length,0)
 assert.equal(o.approvedEdges(graph,graph.nodes.map(n=>n.id===2?{...n,dimension_value:'변경된 대상'}:n)).length,1)
 assert.equal(o.approvedEdges(graph,graph.nodes.map(n=>({...n,is_active:false}))).length,0)
 assert.equal(o.approvedEdges({...graph,edges:graph.edges.map(e=>({...e,status:'inferred'}))},graph.nodes).length,0)
 assert.equal(o.analysisContext(pending,graph.nodes).needsReview.length,2)
}
const graph=fixture('배송','공항','WHERE','operates_in'),nodes=[...graph.nodes,{id:3,dimension_type:'SERVICE',dimension_value:'청소',is_active:true},{id:4,dimension_type:'WHERE',dimension_value:'서울',is_active:true}]
assert.equal(o.allowsCombination(graph.edges,[1,4],nodes),false)
assert.equal(o.allowsCombination(graph.edges,[1,2,3],nodes),false)
assert.equal(o.validEdge({...graph.edges[1],relation:'serves'},nodes),false)
assert.equal(o.validEdge({...graph.edges[1],from:2},nodes),false)
console.log('Passed: two industries, evidence validation, approval gates, stale/inactive dimensions, mixed-service rejection, review context.')
const graphState=fixture('캐리어 배송','여행자','FOR_WHOM','serves');graphState.edges.forEach(e=>e.review='pending');let signedIn=true,stored={document:graphState,updated_at:'2026-10-02T00:00:00Z'},saved=false
const db={auth:{getUser:async()=>({data:{user:signedIn?{id:'staff'}:null}})},from(table){return{select(){return this},eq(){return this},maybeSingle:async()=>({data:stored}),then(resolve){resolve({data:graphState.nodes})},update(patch){saved=true;stored={document:patch.document,updated_at:patch.updated_at};return this}}}}
const routeModule={exports:{}},code=ts.transpileModule(fs.readFileSync('src/app/api/discovery/ontology/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText
vm.runInNewContext(code,{module:routeModule,exports:routeModule.exports,process:{env:{NEXT_PUBLIC_SUPABASE_URL:'https://test.invalid',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'public',SUPABASE_SERVICE_ROLE_KEY:'server'}},require:n=>n.endsWith('/ontology')?o:n==='crypto'?require(n):n==='next/server'?{NextResponse:{json:(body,opts)=>({body,status:opts?.status||200})}}:n==='next/headers'?{cookies:()=>({get:()=>({value:'token'})})}:n==='@supabase/supabase-js'?{createClient:()=>db}:require(n),Date,Number,Set,Error})
async function request(edges,updatedAt=stored.updated_at){return routeModule.exports.POST({json:async()=>({projectId:1,action:'review',updatedAt,edges})})}
;(async()=>{
 signedIn=false;assert.equal((await request(graphState.edges)).status,401);signedIn=true
 assert.equal((await request(graphState.edges,'stale')).status,409)
 assert.equal((await request(graphState.edges.map(e=>({...e,status:'unknown',review:'approved'})))).status,422)
 assert.equal((await request(graphState.edges.map(e=>({...e,review:'approved',evidence:[{source:'project:main_services',quote:'존재하지 않는 원문'}]})))).status,422)
 assert.equal(saved,false)
 assert.equal((await request(graphState.edges.map(e=>({...e,review:'approved'})))).status,200)
 assert.equal(saved,true)
 console.log('Passed: staff-only review, optimistic concurrency, unknown/fabricated evidence rejection, approved save.')
})().catch(e=>{console.error(e);process.exitCode=1})
