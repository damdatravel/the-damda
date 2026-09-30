import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {createClient} from '@supabase/supabase-js'

const bucket='discovery-project-logos'
const maxBytes=2*1024*1024
async function context(idText:string){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY,publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 const token=cookies().get('damda_staff_token')?.value
 if(!url||!key||!publishable||!token)return {response:NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})}
 const auth=createClient(url,publishable,{auth:{persistSession:false,autoRefreshToken:false}})
 const {data:{user}}=await auth.auth.getUser(token)
 if(!user)return {response:NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})}
 const id=Number(idText)
 if(!Number.isSafeInteger(id)||id<1)return {response:NextResponse.json({error:'프로젝트를 확인해 주세요.'},{status:400})}
 const client=createClient(url,key,{auth:{persistSession:false}})
 const {data,error}=await client.from('discovery_projects').select('id').eq('id',id).maybeSingle()
 if(error)return {response:NextResponse.json({error:'프로젝트 확인에 실패했습니다.'},{status:500})}
 if(!data)return {response:NextResponse.json({error:'프로젝트를 찾을 수 없습니다.'},{status:404})}
 return {client,path:`${id}/logo`}
}
export async function POST(req:Request,{params}:{params:{id:string}}){
 const ctx=await context(params.id);if(ctx.response)return ctx.response
 if(Number(req.headers.get('content-length'))>maxBytes+65536)return NextResponse.json({error:'로고는 2MB 이하로 등록해 주세요.'},{status:413})
 const form=await req.formData().catch(()=>null),file=form?.get('logo')
 if(!(file instanceof File)||file.size<1||file.size>maxBytes)return NextResponse.json({error:'2MB 이하의 PNG, JPG, WEBP 이미지를 선택해 주세요.'},{status:400})
 const bytes=Buffer.from(await file.arrayBuffer())
 const mime=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'image/png':bytes[0]===255&&bytes[1]===216&&bytes[2]===255?'image/jpeg':bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP'?'image/webp':null
 if(!mime)return NextResponse.json({error:'PNG, JPG, WEBP 이미지 파일만 등록할 수 있습니다.'},{status:400})
 const {data:existing}=await ctx.client.storage.getBucket(bucket)
 if(!existing){
  const {error}=await ctx.client.storage.createBucket(bucket,{public:true,fileSizeLimit:maxBytes,allowedMimeTypes:['image/png','image/jpeg','image/webp']})
  if(error){const {data:created}=await ctx.client.storage.getBucket(bucket);if(!created)return NextResponse.json({error:'로고 저장 공간을 준비하지 못했습니다.'},{status:500})}
 }
 const {error}=await ctx.client.storage.from(bucket).upload(ctx.path,bytes,{contentType:mime,upsert:true,cacheControl:'0'})
 if(error)return NextResponse.json({error:'로고를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.'},{status:500})
 return NextResponse.json({success:true})
}
export async function DELETE(_req:Request,{params}:{params:{id:string}}){
 const ctx=await context(params.id);if(ctx.response)return ctx.response
 const {data:existing}=await ctx.client.storage.getBucket(bucket)
 if(existing){const {error}=await ctx.client.storage.from(bucket).remove([ctx.path]);if(error)return NextResponse.json({error:'로고를 삭제하지 못했습니다.'},{status:500})}
 return NextResponse.json({success:true})
}
