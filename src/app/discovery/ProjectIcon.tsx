'use client'
import {useState} from 'react'

export default function ProjectIcon({name,website,logo=null,size='md'}:{name:string|null;website:string|null;logo?:string|null;size?:'sm'|'md'}){
 const [failed,setFailed]=useState<string[]>([])
 let favicon=''
 try{if(website){const url=new URL(/^https?:\/\//i.test(website)?website:'https://'+website);if(url.protocol==='https:'||url.protocol==='http:')favicon=new URL('/favicon.ico',url.origin).toString()}}catch{}
 const icon=[logo,favicon].find(src=>src&&!failed.includes(src))
 const initials=(name||'프로젝트').trim().slice(0,2)
 return <span aria-label={`${name||'프로젝트'} 로고`} className={'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-100 bg-white font-extrabold text-[#087A56] '+(size==='sm'?'h-10 w-10 text-xs':'h-16 w-16 text-lg')}><span>{initials}</span>{icon&&<img key={icon} src={icon} alt="" onError={()=>setFailed(previous=>[...previous,icon])} className="absolute inset-0 h-full w-full bg-white object-contain p-1"/>}</span>
}
