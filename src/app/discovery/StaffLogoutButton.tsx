'use client'
import {useRouter} from 'next/navigation'
export default function StaffLogoutButton(){
 const router=useRouter()
 async function logout(){await fetch('/api/staff/logout',{method:'POST'});router.replace('/staff-login');router.refresh()}
 return <button onClick={logout} className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold">로그아웃</button>
}