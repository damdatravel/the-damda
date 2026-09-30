import Link from 'next/link'
import {requireStaff} from '../../../../lib/requireStaff'
import StaffInquiryForm from './StaffInquiryForm'
export default async function NewInquiry(){await requireStaff();return <main className="min-h-screen bg-[#F4F7F6] px-5 pb-12 pt-24"><div className="mx-auto max-w-4xl"><Link href="/discovery/inquiries" className="text-sm text-emerald-700">← 상담 업체 목록</Link><h1 className="mt-4 text-3xl font-extrabold">직원용 상담 등록</h1><p className="mt-3 text-sm text-gray-500">전화·대면 상담이나 내부 테스트 업체를 직접 등록합니다. 관리 프로젝트는 계약 후 생성됩니다.</p><StaffInquiryForm/></div></main>}
