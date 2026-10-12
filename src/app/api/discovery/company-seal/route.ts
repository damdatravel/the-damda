import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {createClient} from '@supabase/supabase-js'
import {readFile} from 'node:fs/promises'
import path from 'node:path'
export const dynamic='force-dynamic'
export async function GET(){
 const token=cookies().get('damda_staff_token')?.value,url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 if(!token||!url||!key)return new NextResponse(null,{status:401})
 const auth=await createClient(url,key,{auth:{persistSession:false}}).auth.getUser(token)
 if(auth.error||!auth.data.user)return new NextResponse(null,{status:401})
 try{return new NextResponse(await readFile(path.join(process.cwd(),'private-assets/company-seal.png')),{headers:{'Content-Type':'image/png','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}})}catch{return new NextResponse(null,{status:404})}
}
