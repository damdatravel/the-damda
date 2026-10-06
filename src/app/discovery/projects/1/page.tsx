import ProjectPage from '../[id]/page'
export const dynamic='force-dynamic'
export const revalidate=0
// Keep the existing URL while using the same authenticated project workflow as every client.
export default async function DiscoveryPage(){return ProjectPage({params:{id:'1'}})}
