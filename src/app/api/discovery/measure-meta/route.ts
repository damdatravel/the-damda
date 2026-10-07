import {measureExternal} from '../measure-external'
export const maxDuration=120
export async function POST(req:Request){return measureExternal(req,'Meta Model API')}
