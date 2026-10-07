// Retry only authentication failures, before the endpoint performs its work.
let refreshing:Promise<boolean>|null=null
export async function staffFetch(input:string,init?:RequestInit):Promise<Response>{
 const response=await fetch(input,init)
 if(response.status!==401)return response
 if(!refreshing)refreshing=fetch('/api/staff/refresh',{method:'POST'}).then(r=>r.ok).catch(()=>false).finally(()=>{refreshing=null})
 if(!await refreshing)return response
 return fetch(input,init)
}
