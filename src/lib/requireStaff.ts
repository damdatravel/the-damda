import {cookies} from 'next/headers'
import {redirect} from 'next/navigation'
import {createClient} from '@supabase/supabase-js'

export async function requireStaff(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY
 const token=cookies().get('damda_staff_token')?.value
 if(!url||!key||!token)redirect('/staff-login')
 try{
  const supabase=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})
  const{data,error}=await supabase.auth.getUser(token)
  if(error||!data.user)redirect('/staff-login')
  return data.user
 }catch{redirect('/staff-login')}
}
