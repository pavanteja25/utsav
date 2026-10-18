import App from '../../src/main';
export const dynamicParams = false;
export function generateStaticParams(){return [[],['about'],['services'],['gallery'],['contact'],...['weddings','birthdays','corporate-events','social-gatherings','theme-events','custom-experiences'].map(x=>['services',x]),...['engagement','pellikoduku','pellikuthuru','haldi','sangeeth','wedding-day-decor'].map(x=>['services','weddings',x]),...['kitty-parties','reunion-parties','traditional-festivals'].map(x=>['services','social-gatherings',x])].map(slug=>({slug}));}
export default function Page(){return <App/>}
