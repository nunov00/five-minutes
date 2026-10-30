import {describe,expect,it} from 'vitest';
import {renderSafeMarkdown,renderCitationText,sanitizeRenderedHtml,parsePresentationFile} from '../../src/lib/content/safe-content';
import {validateCitations,validatePresentationCitations,verifySourceLinks} from '../../src/lib/content/citations.mjs';
import {mkdtemp,mkdir,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {stringify} from 'yaml';
import {validLesson} from '../fixtures/lesson-fixtures';
import {loadPublishedLessons} from '../../src/lib/content/loader';

describe('bounded lesson source citations',()=>{
  it('rejects missing or duplicated targets in built HTML',()=>{
    expect(()=>verifySourceLinks('<a href="#source-1">[1]</a>')).toThrow(/Missing/);
    expect(()=>verifySourceLinks('<a href="#source-1">[1]</a><li data-id="source-1"></li>')).toThrow(/Missing/);
    expect(()=>verifySourceLinks('<li id="source-1"></li><li id="source-1"></li>')).toThrow(/Duplicate/);
    expect(()=>verifySourceLinks('<a href="#source-1">[1]</a><li id="source-1"></li>')).not.toThrow();
  });
  it('uses the canonical loader to reject dangling body and figure citations',async()=>{
    const root=await mkdtemp(join(tmpdir(),'source-citations-')),dir=join(root,'2026','fixture');await mkdir(dir,{recursive:true});
    const lesson=validLesson();lesson.metadata.aliases=[];
    await writeFile(join(dir,'lesson.yaml'),stringify(lesson.metadata));
    const path=join(dir,'adult.md'),registry={[lesson.metadata.slug]:lesson.metadata.id};
    await writeFile(path,`---\n${stringify(lesson.adult)}---\nClaim.[^1]\n`);
    expect((await loadPublishedLessons(root,registry))[0].adultHtml).toContain('href="#source-1"');
    await writeFile(path,`---\n${stringify(lesson.adult)}---\nClaim.[^2]\n`);
    await expect(loadPublishedLessons(root,registry)).rejects.toThrow(/Citation 2/);
    const presentation={...lesson.adult,figure:{type:'seasons-orbit',data:{tiltDegrees:23.5},alt:'Schematic',caption:'Schematic.[^2]',description:'Description.'}};
    await writeFile(path,`---\n${stringify(presentation)}---\nClaim.[^1]\n`);
    await expect(loadPublishedLessons(root,registry)).rejects.toThrow(/Citation 2/);
  });
  it('links repeated and distinct references to metadata order without adding prose paragraphs',()=>{
    const html=renderSafeMarkdown('First.[^1] Again.[^1] Other.[^2]',{sourceCount:2});
    expect(html.match(/href="#source-1"/g)).toHaveLength(2);
    expect(html).toContain('href="#source-2"');
    expect(html.match(/<p>/g)).toHaveLength(1);
    expect(html).toContain('aria-label="Source 1"');
  });
  it.each(['[^0]','[^01]','[^1000]','[^x]','[^-1]','[^1','[^1 onclick=x]','[^1\"]<script>'])('rejects malformed references %s',token=>{
    expect(()=>renderSafeMarkdown(token,{sourceCount:2})).toThrow(/Citation/);
    expect(()=>validateCitations(token,2,true)).toThrow(/Citation/);
    expect(()=>renderCitationText(token,2)).toThrow(/Citation/);
  });
  it('fails on dangling references in prose and captions, including absent metadata',()=>{
    expect(()=>renderSafeMarkdown('Claim.[^2]',{sourceCount:1})).toThrow(/no matching/);
    expect(()=>renderSafeMarkdown('Claim.[^1]')).toThrow(/no matching/);
    expect(()=>validateCitations('Caption.[^2]',1)).toThrow(/no matching/);
    expect(()=>renderSafeMarkdown('[^1]: separate definition',{sourceCount:1})).toThrow(/definitions/);
  });
  it('keeps code and ordinary links literal in both Markdown paths',()=>{
    const text='`[^99]` [literal label](https://example.com/a_(b)[^88])\n\n```\n[^77]\n```\n\nActual.[^1]';
    expect(validateCitations(text,1,true)).toEqual([1]);
    const html=renderSafeMarkdown(text,{sourceCount:1});
    expect(html.match(/class="source-citation"/g)).toHaveLength(1);
    expect(html).toContain('<code>[^99]</code>');
    expect(html).toContain('literal label');
  });
  it.each(['## Heading [^1]','[label [^9]](https://example.com)','a [ [^9] and [b](https://example.com)'])('rejects hidden or misplaced markers: %s',text=>{
    expect(()=>validateCitations(text,1,true)).toThrow(/headings|link labels/);
    expect(()=>renderSafeMarkdown(text,{sourceCount:1})).toThrow(/headings|link labels/);
  });
  it.each([
    {title:'Title [^1]'},{description:'Lead [^1]'},{takeaway:'Answer [^1]'},{question:'Question [^1]'},{answer:'Answer [^1]'},
    {searchTerms:['term [^1]']},{figure:{alt:'Alt [^1]'}},{figure:{data:{steps:[{label:'Step [^1]'}]}}},
    {activity:{prompt:'Prompt [^1]',options:['A','B']}},
  ])('rejects reserved syntax in unsupported presentation fields: %j',presentation=>{
    expect(()=>validatePresentationCitations(presentation,1)).toThrow(/Citation tokens/);
    const source=`---\n${stringify(presentation)}---\nBody.\n`;
    expect(()=>parsePresentationFile(source,1)).toThrow(/Citation tokens/);
  });
  it('validates captions in collections and singular figures while rejecting collection alt markers',()=>{
    expect(()=>validatePresentationCitations({figures:[{figure:{caption:'Caption.[^1]',description:'Description.[^1]'}}]},1)).not.toThrow();
    expect(()=>validatePresentationCitations({figures:[{figure:{alt:'Alt [^1]'}}]},1)).toThrow(/figures.0.figure.alt/);
    expect(()=>validatePresentationCitations({figure:{caption:'Caption.[^2]'}},1)).toThrow(/Citation 2/);
  });
  it('escapes figure copy and retains only application-owned numeric fragments',()=>{
    const html=renderCitationText('<img onerror=x> *plain* [^1]',1);
    expect(html).toContain('&lt;img onerror=x&gt; *plain*');
    expect(html).not.toContain('<img');
    expect(sanitizeRenderedHtml('<a href="#source-1" onclick="x">[1]</a>')).not.toContain('onclick');
    expect(sanitizeRenderedHtml('<a href="#other">x</a>')).toContain('&lt;a');
    expect(()=>renderSafeMarkdown('[x](#source-1)')).toThrow(/Unsafe link/);
    expect(()=>renderSafeMarkdown('[x](javascript:alert(1))')).toThrow(/Unsafe link/);
  });
});
