import type {ReactNode} from 'react'
import Link from 'next/link'
import StaffLogoutButton from './StaffLogoutButton'
import {cookies} from 'next/headers'
export default function DiscoveryLayout({children}:{children:ReactNode}){
 return <>{cookies().get('damda_staff_token')&&<div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 pt-20 pb-4"><Link href="/discovery" className="text-sm font-bold">회사 대시보드</Link><StaffLogoutButton/></div>}{children}</>
}
