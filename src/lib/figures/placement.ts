/** Input is only sanitized HTML from our Markdown renderer. Never accepts raw lesson HTML. */
export function figurePosition(html: string, afterParagraph=1): {opening:string;rest:string} {
  const paragraphs: {index:number;html:string}[]=[];
  const stack: string[]=[];
  let paragraphStart: number|undefined;
  for(const match of html.matchAll(/<(\/)?([a-z0-9]+)(?:\s[^>]*)?>/gi)) {
    const closing=!!match[1],name=match[2].toLowerCase(),index=match.index!;
    if(closing) {
      if(stack.at(-1)!==name)throw Error('Figure placement received malformed sanitized HTML.');
      stack.pop();
      if(name==='p'&&paragraphStart!==undefined&&stack.length===0) {
        paragraphs.push({index:paragraphStart,html:html.slice(paragraphStart,index+match[0].length)});
        paragraphStart=undefined;
      }
    } else if(name!=='br') {
      if(name==='p'&&stack.length===0)paragraphStart=index;
      stack.push(name);
    }
  }
  if(stack.length||paragraphStart!==undefined)throw Error('Figure placement received malformed sanitized HTML.');
  if(!Number.isInteger(afterParagraph)||afterParagraph<1||afterParagraph>paragraphs.length)throw Error('Figure position must follow an existing prose paragraph.');
  const paragraph=paragraphs[afterParagraph-1],end=paragraph.index+paragraph.html.length;
  return {opening:html.slice(0,end),rest:html.slice(end)};
}
