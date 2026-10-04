import {createHash} from 'crypto'
import type {ContextVersion} from './contextVersion'
export type EngineRun={key:string;status:'running'|'completed'|'failed';attempt:number;startedAt:string;finishedAt?:string;resultId?:number;error?:string}
export function runKey(sourceId:number,context:ContextVersion){return createHash('sha256').update(JSON.stringify([sourceId,context.parts])).digest('hex')}
export function reserveRun(runs:EngineRun[],key:string,retry:boolean){const previous=runs.find(x=>x.key===key);if(previous?.status==='completed')return {reused:previous};if(previous?.status==='running')throw Error('이미 실행 중입니다. 중복 호출하지 않습니다.');if(previous?.status==='failed'&&!retry)throw Error('실패 기록을 확인하고 재시도를 선택해 주세요.');if((previous?.attempt||0)>=3)throw Error('동일 기준 재시도는 3회까지입니다. 실패 원인을 수정한 뒤 실행해 주세요.');const run:EngineRun={key,status:'running',attempt:(previous?.attempt||0)+1,startedAt:new Date().toISOString()};return {run,runs:[...runs.filter(x=>x.key!==key),run].slice(-30)}}
