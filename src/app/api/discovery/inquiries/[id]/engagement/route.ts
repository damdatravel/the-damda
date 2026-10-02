import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {createClient} from '@supabase/supabase-js'
import {randomBytes} from 'crypto'
import {ensureEngagement} from '../../../../../../lib/engagementStore'
import {applyEngagement} from '../../../../../../lib/engagement'
export async function POST(req:Request,{params}:{params:{id:string}}){try{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,pub=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,key=process.env.SUPABASE_SERVICE_ROLE_KEY,token=cookies().get('damda_staff_token')?.value
 if(!url||!pub||!key||!token)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 const auth=await createClient(url,pub,{auth:{persistSession:false}}).auth.getUser(token);if(!auth.data.user||auth.error)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 const id=Number(params.id),body=await req.json().catch(()=>({}));if(!Number.isSafeInteger(id)||id<1)return NextResponse.json({error:'상담 번호를 확인해 주세요.'},{status:400})
 const s=createClient(url,key,{auth:{persistSession:false}}),i=await s.from('discovery_inquiries').select('id,status,project_id').eq('id',id).maybeSingle()
 if(i.error||!i.data)return NextResponse.json({error:'상담을 찾지 못했습니다.'},{status:404})
 const row=await ensureEngagement(s,id)
 if(body.action==='read')return NextResponse.json({row})
 if(body.revision!==row.revision)return NextResponse.json({error:'고객 답변이나 다른 수정이 있습니다. 다시 불러와 주세요.'},{status:409})
 if(body.action==='request'&&i.data.status==='closed')return NextResponse.json({error:'종료된 상담은 확인 요청을 보낼 수 없습니다.'},{status:409})
 const next=applyEngagement(row.document,body,new Date().toISOString(),randomBytes(12).toString('hex'))
 const patch:any={document:next,revision:row.revision+1}
 if(body.action==='request'||body.action==='revoke')patch.public_token=randomBytes(32).toString('base64url')
 const saved=await s.from('discovery_engagements').update(patch).eq('inquiry_id',id).eq('revision',row.revision).select('*').maybeSingle()
 if(saved.error||!saved.data)return NextResponse.json({error:'저장 중 자료가 변경되었습니다. 다시 불러와 주세요.'},{status:409})
 return NextResponse.json({row:saved.data})
}catch(e:any){return NextResponse.json({error:e?.message||'고객 목표 처리 실패'},{status:400})}}
