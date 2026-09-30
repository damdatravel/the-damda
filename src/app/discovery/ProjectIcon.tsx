'use client'
import {useState} from 'react'

export default function ProjectIcon({name,website,size='md'}:{name:string|null;website:string|null;size?:'sm'|'md'}){
 const[failedUrl,setFailedUrl]=useState<string|null>(null)
 let icon=''
 try{if(website){const url=new URL(/^https?:\/\//i.test(website)?website:'https://'+website);if(url.protocol==='https:'||url.protocol==='http:')icon=new URL('/favicon.ico',url.origin).toString()}}catch{}
 const initials=(name||'프로젝트').trim().slice(0,2)
 return <span aria-label={`${name||'프로젝트'} 아이콘`} className={'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50 font-extrabold text-[#087A56] '+(size==='sm'?'h-10 w-10 text-xs':'h-16 w-16 text-lg')}><span>{initials}</span>{icon&&failedUrl!==icon&&<img src={icon} alt="" onError={()=>setFailedUrl(icon)} className="absolute inset-0 h-full w-full bg-white object-contain p-2"/>}</span>
}
