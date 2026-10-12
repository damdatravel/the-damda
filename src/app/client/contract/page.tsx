import {Suspense} from 'react'
import ContractSigning from './ContractSigning'
export const metadata={title:'계약 확인 및 서명',robots:{index:false,follow:false},referrer:'no-referrer' as const}
export const dynamic='force-dynamic'
export default function Page(){return <Suspense fallback={<p className="p-8">계약을 확인하고 있습니다.</p>}><ContractSigning/></Suspense>}
