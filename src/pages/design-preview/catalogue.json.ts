import { prototypeContent, lessonPath } from '../../prototype/model';
import { TAXONOMY } from '../../lib/taxonomy';

export async function GET() {
 const lessons=await prototypeContent();
 const data=lessons.map(l=>{
 const t=TAXONOMY.find(t=>t.token===l.metadata.topic)!;
 return {id:l.metadata.id,slug:l.metadata.slug,publishedAt:l.metadata.publishedAt,topic:t.token,topicLabel:t.label,subtopic:l.metadata.subtopic,subtopicLabel:t.subtopics.find(s=>s.token===l.metadata.subtopic)!.label,synthetic:false,concepts:l.metadata.concepts,
 adult:{...l.adult,path:lessonPath('adult',l.metadata.slug)},teen:{...l.teen,path:lessonPath('teen',l.metadata.slug)}};
 });
 return new Response(JSON.stringify(data),{headers:{'content-type':'application/json'}});
}
