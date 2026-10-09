import {createHash} from 'node:crypto'
import type {OrganizationCandidate} from './taskOrganization'
export function organizationSignature(goal:any,binding:any,candidates:OrganizationCandidate[],contextParts:any){return createHash('sha256').update(JSON.stringify({goal,binding,candidates,contextParts})).digest('hex')}
