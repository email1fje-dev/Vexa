(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const fa = n => new Intl.NumberFormat('fa-IR').format(n);
  const store = {
    get(key, fallback){try{const v=localStorage.getItem('vexa:'+key);return v===null?fallback:JSON.parse(v)}catch{return fallback}},
    set(key,value){try{localStorage.setItem('vexa:'+key,JSON.stringify(value))}catch{}}
  };
  const seedPosts = [
    {id:'seed-1',name:'آوا راد',handle:'ava.design',initial:'آ',color:'purple',time:'۱۲ دقیقه پیش',text:'یه یادآوری کوچیک برای امروز: لازم نیست همه‌چیز رو همین الان بلد باشی. بعضی چیزها با ساختن یاد گرفته می‌شن، نه فقط فکر کردن بهشون. ✳\n\n#طراحی #زندگی',likes:18,comments:[{name:'نیما',text:'دقیقاً همین!'}],art:'MAKE',artClass:'purple',saved:false,liked:false},
    {id:'seed-2',name:'نیما کیانی',handle:'nimak',initial:'ن',color:'blue',time:'۳۴ دقیقه پیش',text:'دارم یه پروژه‌ی کوچیک رو از صفر می‌سازم و این بار تصمیم گرفتم کمتر دنبال بی‌نقص بودن باشم و بیشتر تمومش کنم. شما روی چی کار می‌کنین؟ 🚀\n\n#ساختن #بازی',likes:12,comments:[{name:'رها',text:'همین مسیر بهترین مسیره 🚀'}],saved:false,liked:false},
    {id:'seed-3',name:'رها',handle:'raha.notes',initial:'ر',color:'orange',time:'۱ ساعت پیش',text:'آهنگ خوب + یه لیوان چای + بارون پشت پنجره. گاهی برنامه‌ی کامل روز همینه. ☁️\n\n#زندگی',likes:27,comments:[],saved:false,liked:false}
  ];
  let posts = store.get('posts', seedPosts);
  let user = store.get('user', null);
  let currentPage = 'home', currentFeed = 'for-you', searchQuery = '', authMode='login', expandedComments=new Set(), toastTimer;
  const pageInfo = {
    home:['خانه','اینجا فکرها به هم می‌رسن.'],explore:['کاوش','یه چیز تازه پیدا کن.'],
    notifications:['اعلان‌ها','اتفاق‌های تازه‌ی گوشه‌ی تو.'],messages:['پیام‌ها','گفت‌وگوها به‌زودی به وکسا می‌رسن.'],
    bookmarks:['ذخیره‌شده‌ها','چیزهایی که خواستی نگه داری.'],profile:['پروفایل','گوشه‌ی شخصی تو در وکسا.']
  };
  function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600)}
  function savePosts(){store.set('posts',posts)}
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function formatText(text){return esc(text).replace(/(^|\s)(#[\u0600-\u06FF\w]+)/g,'$1<span class="post-tag">$2</span>').replace(/\n/g,'<br>')}
  function initials(name){return (name||'و').trim().slice(0,1)}
  function avatarClass(color){return ({green:'avatar-green',purple:'avatar-purple',orange:'avatar-orange',blue:'avatar-blue'})[color]||'avatar-green'}
  function visiblePosts(){
    let result=[...posts];
    if(currentPage==='bookmarks')result=result.filter(p=>p.saved);
    if(currentPage==='profile')result=result.filter(p=>user&&p.handle===user.handle);
    if(currentPage==='notifications'||currentPage==='messages')return [];
    if(currentPage==='explore'||searchQuery){const q=searchQuery.toLocaleLowerCase();result=result.filter(p=>(p.text+' '+p.name+' '+p.handle).toLocaleLowerCase().includes(q));}
    if(currentFeed==='following'&&currentPage==='home')result=result.filter(p=>p.handle!=='ava.design');
    return result;
  }
  function postTemplate(p){
    const liked=!!p.liked,saved=!!p.saved,commentsOpen=expandedComments.has(p.id);
    return '<article class="post-card" data-post="'+esc(p.id)+'"><div class="post-head"><div class="avatar '+avatarClass(p.color)+'">'+esc(p.initial||initials(p.name))+'</div><div class="post-author"><strong>'+esc(p.name)+'</strong><small>@'+esc(p.handle)+'</small></div><span class="post-time">'+esc(p.time||'همین الان')+'</span><button class="post-menu" data-action="post-menu" data-id="'+esc(p.id)+'" aria-label="گزینه‌های پست">···</button></div><div class="post-body">'+formatText(p.text)+'</div>'+(p.art?'<div class="post-art '+esc(p.artClass||'')+'"><span class="big-type">'+esc(p.art)+'</span></div>':'')+'<div class="post-actions"><button class="post-action '+(liked?'liked':'')+'" data-action="like" data-id="'+esc(p.id)+'"><span>'+(liked?'♥':'♡')+'</span><b>'+fa(p.likes||0)+'</b> پسند</button><button class="post-action" data-action="comments" data-id="'+esc(p.id)+'"><span>♧</span><b>'+fa((p.comments||[]).length)+'</b> دیدگاه</button><button class="post-action save-action '+(saved?'liked':'')+'" data-action="save" data-id="'+esc(p.id)+'"><span>'+(saved?'▣':'♧')+'</span>'+ (saved?'ذخیره شد':'ذخیره')+'</button></div>'+(commentsOpen?'<div class="comments-box">'+(p.comments||[]).map(c=>'<div class="comment-row"><b>'+esc(c.name)+'</b>'+esc(c.text)+'</div>').join('')+'<form class="comment-form" data-id="'+esc(p.id)+'"><input name="comment" maxlength="240" placeholder="یه دیدگاه بنویس..." required><button type="submit">ارسال</button></form></div>':'')+'</article>';
  }
  function render(){
    const info=pageInfo[currentPage]||pageInfo.home;$('#page-title').textContent=currentPage==='profile'&&user?user.name:info[0];$('#page-subtitle').textContent=currentPage==='profile'&&user?'پست‌های تو در وکسا':info[1];
    $$('.nav-item[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===currentPage));
    $('#feed-tabs').classList.toggle('hidden',currentPage!=='home');
    $('#composer').classList.toggle('hidden',!['home','profile'].includes(currentPage)||currentPage==='profile'&&!user);
    $('#search-panel').classList.toggle('hidden',currentPage!=='explore');
    $('#search-input').value=searchQuery;
    $('#feed').innerHTML='';
    if(currentPage==='notifications'){$('#feed').innerHTML='<div class="post-card"><div class="post-head"><div class="avatar avatar-green">✳</div><div class="post-author"><strong>به وکسا خوش اومدی!</strong><small>سیستم وکسا · همین الان</small></div></div><p class="post-body">اینجا اعلان‌های مربوط به لایک‌ها، دیدگاه‌ها و آدم‌هایی که دنبال می‌کنی نمایش داده می‌شن. این بخش به‌زودی کامل‌تر می‌شه.</p></div>'}
    else if(currentPage==='messages'){$('#feed').innerHTML='<div class="empty-state"><div class="empty-orb">▤</div><h3>گفت‌وگوها در راهن</h3><p>داریم این بخش رو برای گفت‌وگوهای واقعی آماده می‌کنیم.</p></div>'}
    else {const list=visiblePosts();$('#feed').innerHTML=list.map(postTemplate).join('');$('#empty-state').classList.toggle('hidden',list.length!==0);if(list.length===0&&currentPage==='explore'){$('#empty-state h3').textContent='چیزی پیدا نشد';$('#empty-state p').textContent='عبارت دیگه‌ای رو امتحان کن.'}else{$('#empty-state h3').textContent=currentPage==='bookmarks'?'هنوز چیزی ذخیره نکردی':'اینجا فعلاً ساکته';$('#empty-state p').textContent='اولین نفری باش که چیزی به اینجا اضافه می‌کنه.'}}
    $('#side-user').innerHTML='<div class="avatar '+(user?'avatar-purple':'avatar-green')+'">'+esc(user?initials(user.name):'و')+'</div><div class="user-meta"><b>'+esc(user?user.name:'مهمان وکسا')+'</b><span>@'+esc(user?user.handle:'guest')+'</span></div><button class="dots" data-action="'+(user?'logout':'open-auth')+'">'+(user?'خروج':'ورود')+'</button>';
    $('#composer-avatar').textContent=user?initials(user.name):'و';
    $$('.tab').forEach(b=>b.classList.toggle('active',b.dataset.feed===currentFeed));
    const activeTab=$('.tab.active'),line=$('.tab-line');if(activeTab&&line){line.style.right=activeTab.offsetRight+'px';line.style.width=activeTab.offsetWidth+'px';}
  }
  function go(page){currentPage=page;searchQuery='';$('#mobile-nav').classList.remove('open');render();window.scrollTo({top:0,behavior:'smooth'})}
  function openAuth(mode='login'){authMode=mode;$('#auth-modal').classList.remove('hidden');setAuthMode(mode);setTimeout(()=>$('#auth-email').focus(),100)}
  function setAuthMode(mode){authMode=mode;$$('[data-auth-mode]').forEach(b=>b.classList.toggle('active',b.dataset.authMode===mode));const signup=mode==='signup';$('#name-label').classList.toggle('hidden',!signup);$('#auth-name').classList.toggle('hidden',!signup);$('#auth-name').required=signup;$('#auth-title').textContent=signup?'یه گوشه برای خودت بساز.':'به فضای خودت خوش اومدی.';$('#auth-submit').innerHTML=signup?'ساخت حساب نمایشی <span>↗</span>':'ورود به وکسا <span>↗</span>';$('#auth-password').autocomplete=signup?'new-password':'current-password';}
  function publish(){const input=$('#post-input'),text=input.value.trim();if(!text)return;if(!user){openAuth('signup');toast('برای انتشار پست اول یه حساب نمایشی بساز.');return}posts.unshift({id:'p-'+Date.now(),name:user.name,handle:user.handle,initial:initials(user.name),color:'green',time:'همین الان',text,likes:0,comments:[],saved:false,liked:false});savePosts();input.value='';$('#char-count').textContent='۰/۵۰۰';$('#publish-post').disabled=true;currentPage='home';currentFeed='for-you';render();toast('پستت منتشر شد ✳')}
  document.addEventListener('click',e=>{
    const page=e.target.closest('[data-page]');if(page){e.preventDefault();go(page.dataset.page);return}
    const feed=e.target.closest('[data-feed]');if(feed){currentFeed=feed.dataset.feed;render();return}
    const mode=e.target.closest('[data-auth-mode]');if(mode){setAuthMode(mode.dataset.authMode);return}
    const trend=e.target.closest('[data-query]');if(trend){go('explore');searchQuery=trend.dataset.query;render();return}
    const action=e.target.closest('[data-action]');if(action){const a=action.dataset.action,id=action.dataset.id,p=posts.find(x=>x.id===id);
      if(a==='focus-compose'){if(!user){openAuth('signup');return}$('#composer').scrollIntoView({behavior:'smooth',block:'center'});$('#post-input').focus()}
      if(a==='open-auth')openAuth(user?'login':'signup');
      if(a==='close-about')$('#about-modal').classList.add('hidden');
      if(a==='like'&&p){p.liked=!p.liked;p.likes=Math.max(0,(p.likes||0)+(p.liked?1:-1));savePosts();render()}
      if(a==='save'&&p){p.saved=!p.saved;savePosts();render();toast(p.saved?'به ذخیره‌شده‌ها اضافه شد':'از ذخیره‌شده‌ها برداشته شد')}
      if(a==='comments'&&p){expandedComments.has(id)?expandedComments.delete(id):expandedComments.add(id);render();if(expandedComments.has(id))$('.comment-form input',$('[data-post="'+id+'"]'))?.focus()}
      if(a==='post-menu'&&p){if(user&&p.handle===user.handle){if(confirm('این پست حذف بشه؟')){posts=posts.filter(x=>x.id!==id);savePosts();render();toast('پست حذف شد')}}else toast('گزینه‌های بیشتر در نسخه‌های بعدی اضافه می‌شن.')}
      if(a==='logout'){user=null;store.set('user',null);render();toast('از حساب نمایشی خارج شدی.')}
      return;
    }
    if(e.target.id==='learn-more')$('#about-modal').classList.remove('hidden');
  });
  $('#close-auth').addEventListener('click',()=>$('#auth-modal').classList.add('hidden'));
  $('#auth-modal').addEventListener('click',e=>{if(e.target.id==='auth-modal')$('#auth-modal').classList.add('hidden')});
  $('#about-modal').addEventListener('click',e=>{if(e.target.id==='about-modal')$('#about-modal').classList.add('hidden')});
  $('#auth-form').addEventListener('submit',e=>{e.preventDefault();const email=$('#auth-email').value.trim().toLowerCase(),password=$('#auth-password').value,name=$('#auth-name').value.trim();if(password.length<6){toast('رمز عبور باید حداقل ۶ کاراکتر باشه.');return}if(authMode==='signup'&&!name){toast('یه نام نمایشی وارد کن.');return}const accounts=store.get('accounts',{});if(authMode==='signup'){if(accounts[email]){toast('برای این ایمیل حساب نمایشی وجود داره؛ وارد شو.');return}const account={name,handle:(email.split('@')[0]||'vexa_user').replace(/[^a-z0-9_.-]/g,'').slice(0,18)||'vexa_user',email,password};accounts[email]=account;store.set('accounts',accounts);user={name:account.name,handle:account.handle,email};store.set('user',user);toast('حساب نمایشی ساخته شد؛ خوش اومدی!')}else{const account=accounts[email];if(!account||account.password!==password){toast('اطلاعات با حساب نمایشی این دستگاه جور نیست.');return}user={name:account.name,handle:account.handle,email};store.set('user',user);toast('خوش برگشتی!')}$('#auth-modal').classList.add('hidden');$('#auth-form').reset();go('home')});
  $('#post-input').addEventListener('input',e=>{$('#char-count').textContent=fa(e.target.value.length)+'/۵۰۰';$('#publish-post').disabled=!e.target.value.trim()});
  $('#publish-post').addEventListener('click',publish);
  $('#search-input').addEventListener('input',e=>{searchQuery=e.target.value;render();const input=$('#search-input');input.focus();input.setSelectionRange(input.value.length,input.value.length)});
  $('#clear-search').addEventListener('click',()=>{searchQuery='';render();$('#search-input').focus()});
  $('#right-search').addEventListener('keydown',e=>{if(e.key==='Enter'){go('explore');searchQuery=e.target.value;render()}});
  $('#right-search').addEventListener('focus',()=>{});
  $('#theme-toggle').addEventListener('click',()=>{document.body.classList.toggle('light');store.set('theme',document.body.classList.contains('light')?'light':'dark')});
  $('#mobile-menu').addEventListener('click',()=>$('#mobile-nav').classList.toggle('open'));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#auth-modal').classList.add('hidden');$('#about-modal').classList.add('hidden');$('#mobile-nav').classList.remove('open')}if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();$('#right-search').focus()}});
  $('#feed').addEventListener('submit',e=>{const form=e.target.closest('.comment-form');if(!form)return;e.preventDefault();const p=posts.find(x=>x.id===form.dataset.id),input=$('[name="comment"]',form),text=input.value.trim();if(!p||!text)return;p.comments=p.comments||[];p.comments.push({name:user?user.name:'مهمان',text});savePosts();expandedComments.add(p.id);render();toast('دیدگاه اضافه شد')});
  const savedTheme=store.get('theme','dark');if(savedTheme==='light')document.body.classList.add('light');
  if(!store.get('posts',null))store.set('posts',posts);
  render();
})();