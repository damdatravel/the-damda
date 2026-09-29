import {measureExternal} from '../measure-external'
export const maxDuration=60
export async function POST(req:Request){return measureExternal(req,'Perplexity API')}
