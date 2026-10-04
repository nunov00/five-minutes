const activities=[...document.querySelectorAll<HTMLDetailsElement>('[data-activity]')];
function resetActivity(activity: HTMLDetailsElement) {
  activity.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach(input=>input.checked=false);
  const reveal=activity.querySelector<HTMLDetailsElement>('[data-activity-reveal]');
  const selection=activity.querySelector<HTMLElement>('[data-activity-selection]');
  if(reveal)reveal.open=false;
  if(selection)selection.textContent='';
  activity.open=false;
}
for(const activity of activities) {
  const reveal=activity.querySelector<HTMLDetailsElement>('[data-activity-reveal]');
  const selection=activity.querySelector<HTMLElement>('[data-activity-selection]');
  const fieldset=activity.querySelector<HTMLFieldSetElement>('[data-activity-choices]');
  if(!reveal||!selection||!fieldset)continue;
  fieldset.addEventListener('change', event=>{
    const input=event.target;
    if(!(input instanceof HTMLInputElement)||input.type!=='radio'||!input.checked)return;
    const label=input.closest('label')?.querySelector('span')?.textContent;
    selection.textContent=`You chose: ${label ?? ''}`;
    reveal.open=true;
  });
  resetActivity(activity);
  activity.querySelectorAll<HTMLElement>('[data-activity-static]').forEach(element=>element.hidden=true);
  activity.querySelectorAll<HTMLElement>('[data-activity-js]').forEach(element=>element.hidden=false);
  fieldset.hidden=false;
}
// Neither choices nor reveals persist; cover ordinary reload and bfcache restoration.
window.addEventListener('pageshow',()=>activities.forEach(resetActivity));
