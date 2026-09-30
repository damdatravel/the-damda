// Logos are stored by project ID; no change to the project table is required.
export function projectLogoUrl(id:number){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL
 return url?`${url.replace(/\/$/,'')}/storage/v1/object/public/discovery-project-logos/${id}/logo?v=${Date.now()}`:null
}
