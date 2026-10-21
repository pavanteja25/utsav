import App from '../../src/main';
export const dynamicParams = false;
export function generateStaticParams(){
  return [
    [],
    ['about'],
    ['services'],
    ['gallery'],
    ['contact'],
    ...['wedding-decor', 'birthday-decor', 'traditional-celebrations', 'house-celebrations', 'weddings', 'birthdays'].map(x => ['services', x]),
    ...['engagement', 'reception', 'pellikoduku-pellikuthuru', 'pellikoduku', 'pellikuthuru', 'haldi', 'mehendi', 'sangeeth', 'wedding-day-decor'].map(x => ['services', 'wedding-decor', x]),
    ...['engagement', 'reception', 'pellikoduku-pellikuthuru', 'pellikoduku', 'pellikuthuru', 'haldi', 'mehendi', 'sangeeth', 'wedding-day-decor'].map(x => ['services', 'weddings', x]),
  ].map(slug => ({ slug }));
}
export default function Page(){ return <App />; }

