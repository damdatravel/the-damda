import {contractBody,contractStyles,type ContractPaperData} from '@/lib/contractPresentation'
export default function ContractPaper({data}:{data:ContractPaperData}){return <><style>{contractStyles}</style><div dangerouslySetInnerHTML={{__html:contractBody(data)}}/></>}
