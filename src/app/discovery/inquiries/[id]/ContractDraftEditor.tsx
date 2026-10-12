'use client'
import {contractText} from '../../../../lib/contractDocument'
import ContractDispatch from './ContractDispatch'
import ContractPaper from '../../../../components/ContractPaper'
import {contractPrintHtml} from '../../../../lib/contractPresentation'
import {useEffect,useState} from 'react'
import {ContractDraft,Quotation,quoteTotals} from '../../../../lib/quotation'
const defaults:ContractDraft={customerType:'individual',businessNumber:'',representative:'',signer:'',position:'',authority:'representative',authorityEvidence:'',publishing:false,media:'',usage:'합의한 서비스 제공에 필요한 고객 제공 원고·사진·영상의 편집 및 게시. 고객은 제공 자료의 사용 권한을 확인하며, 공개 전 사실 확인과 게시 승인을 진행합니다.',revenue:'더담다 소유 매체에서 발생한 광고 수익은 더담다에 귀속됩니다. 고객 소유 채널의 수익은 고객에 귀속됩니다.',afterEnd:'계약 종료 후 게시물 유지 기간·수정·삭제 요청 방법과 처리 기한을 협의해 기재합니다.',termination:'중도 종료 통보 기한, 이미 수행한 작업·미집행 광고비의 정산 및 자료 인계 기준을 협의해 기재합니다.',authentication:'basic',sealPreview:true}
const field='mt-1 w-full rounded-lg border border-gray-200 bg-white p-2 text-sm font-normal text-gray-900'
const money=(n:number)=>new Intl.NumberFormat('ko-KR').format(n)+'원'
export default function ContractDraftEditor({quote,onChange,inquiryId,dirty}:{quote:Quotation;onChange:(d:ContractDraft)=>void;inquiryId:number;dirty:boolean}){
 const d={...defaults,...quote.contractDraft,signer:quote.contractDraft?.signer||quote.contact,sealPreview:true}
 const[open,setOpen]=useState(false),[sealError,setSealError]=useState(false),[printError,setPrintError]=useState('')
 const[logo,setLogo]=useState<string|null>(null)
 useEffect(()=>{if(!open)return;let active=true;fetch('/images/damda-discovery-contract-logo.png').then(async r=>{if(!r.ok)throw Error();const b=await r.blob();return await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(b)})}).then(v=>{if(active)setLogo(v)}).catch(()=>{});return()=>{active=false}},[open])
 const[seal,setSeal]=useState<string|null>(null)
 useEffect(()=>{if(!open)return;let active=true;fetch('/api/discovery/company-seal',{cache:'no-store'}).then(async r=>{if(!r.ok)throw Error('직인 조회 실패');const b=await r.blob();return await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(b)})}).then(v=>{if(active){setSeal(v);setSealError(false)}}).catch(()=>{if(active)setSealError(true)});return()=>{active=false}},[open])
 const paper={quote:{...quote,contractDraft:d},text:contractText({...quote,contractDraft:d}),seal,logo,status:'draft'}
 const update=<K extends keyof ContractDraft>(k:K,v:ContractDraft[K])=>onChange({...d,[k]:v})
 const input=(k:'businessNumber'|'representative'|'signer'|'position'|'authorityEvidence'|'media'|'usage'|'revenue'|'afterEnd'|'termination',label:string,multi=false)=><label className="block text-sm font-semibold">{label}{multi?<textarea rows={3} className={field} value={d[k]} onChange={e=>update(k,e.target.value)}/>:<input className={field} value={d[k]} onChange={e=>update(k,e.target.value)}/>}</label>
 function print(){setPrintError('');if(!seal||!logo){setPrintError('로고·직인을 불러온 뒤 인쇄해 주세요. 직원 로그인 상태를 확인하세요.');return}const w=window.open('','_blank');if(!w){setPrintError('팝업을 허용한 뒤 다시 시도하세요.');return}w.document.write(contractPrintHtml(paper,'담다 디스커버리 계약 초안'));w.document.close()}
 const block=(title:string,value:string)=><section><h3 className="mt-5 font-bold">{title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{value||'협의 후 작성'}</p></section>
 return <section className="mt-6 rounded-xl border border-emerald-200 bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-extrabold">견적 기반 계약 초안</h3><p className="mt-1 text-xs text-gray-500">계약 초안을 작성·저장하고 아래에서 고객 서명 링크를 발송하세요.</p></div><button type="button" onClick={()=>setOpen(!open)} className="rounded-lg border px-3 py-2 text-sm font-bold">{open?'계약 화면 접기':'계약서 구성·미리보기'}</button></div>{open&&<div className="mt-5 space-y-5">
 <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold">고객 유형<select className={field} value={d.customerType} onChange={e=>update('customerType',e.target.value as ContractDraft['customerType'])}><option value="individual">개인사업자</option><option value="corporate">법인</option></select></label>{input('businessNumber','사업자등록번호')}{input('representative','대표자 이름')}{input('signer','계약 서명자 이름')}{input('position','서명자 직책')}<label className="text-sm font-semibold">서명 권한<select className={field} value={d.authority} onChange={e=>update('authority',e.target.value as ContractDraft['authority'])}><option value="representative">대표자 직접 서명</option><option value="delegate">권한 있는 담당자 서명</option></select></label></div>
 {d.authority==='delegate'&&input('authorityEvidence','계약 권한 확인 방법·위임 자료 확인 기록',true)}
 <label className="block text-sm font-semibold"><input type="checkbox" checked={d.publishing} onChange={e=>update('publishing',e.target.checked)}/> 더담다 운영 매체 게시를 계약 범위에 포함하는 초안</label><p className="text-xs text-gray-500">이 체크는 내부 초안 설정이며 고객의 동의 기록이 아닙니다. 게시를 포함할 때 매체·수량·이용 조건을 합의하세요.</p>
 {d.publishing&&<div className="space-y-3">{input('media','게시 매체와 원고 제작·채널별 게시 수량',true)}{input('usage','고객 자료 사용·편집·게시 범위',true)}{input('revenue','매체 소유 및 광고 수익 귀속',true)}{input('afterEnd','종료 후 게시물 유지·수정·삭제 기준',true)}</div>}
 {input('termination','중도 종료·정산·자료 인계 조건',true)}
 <label className="block text-sm font-semibold">계약 인증 방식<select className={field} value={d.authentication} onChange={e=>update('authentication',e.target.value as ContractDraft['authentication'])}><option value="basic">지정 휴대폰 문자 인증 + 서명</option><option value="identity" disabled>추가 본인 확인(PASS·간편인증) + 서명</option></select></label><p className="text-xs text-gray-500">상담 문자 인증과 명의 본인 확인은 다릅니다. 이 계약은 수신 번호 문자 인증과 고객 서명으로 진행하며 PASS 명의 본인 확인은 연동 전입니다.</p>
 <p className="text-xs text-gray-500">회사 직인 원본을 초안과 새 발송 계약의 제공자 서명란에 자동 표시합니다. 초안 직인 표시는 계약 체결을 의미하지 않습니다.</p>{sealError&&<p className="text-sm text-red-700">직인을 불러오지 못했습니다. 직원 로그인 상태를 확인해 주세요.</p>}
 <ContractPaper data={paper}/>
 <button type="button" onClick={print} className="rounded-lg border px-4 py-2 text-sm font-bold">계약 초안 인쇄 / PDF 저장</button>{printError&&<p className="text-red-700">{printError}</p>}
 <ContractDispatch inquiryId={inquiryId} dirty={dirty}/>
 </div>}</section>
}
