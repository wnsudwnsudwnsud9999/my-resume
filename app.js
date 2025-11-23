

// 상태 저장소 
const store = {
  get(key, fallback){
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
};

// 초기 상태(비어있을 때 사용할 값)
const defaultProfile = {
  name: "홍길동",
  role: "컴퓨터공학 3학년 · 백엔드/풀스택 지망",
  email: "example@gmail.com",
  bio: "Node.js, MongoDB, Docker를 공부 중입니다."
};
const defaultSkills = ["JavaScript","HTML","CSS"];
const defaultProjects = [
  { title:"포트폴리오 사이트", period:"2025.03 ~ 2025.04", role:"프론트엔드", summary:"HTML/CSS/JS로 개인 포트폴리오 제작", stack:["HTML","CSS","JavaScript"] }
];

//  DOM 참조 
const els = {
  // 미리보기
  pName: document.querySelector('#preview-name'),
  pRole: document.querySelector('#preview-role'),
  pEmail: document.querySelector('#preview-email'),
  pBio: document.querySelector('#preview-bio'),

  // 폼
  fProfile: document.querySelector('#form-profile'),
  name: document.querySelector('#name'),
  role: document.querySelector('#role'),
  email: document.querySelector('#email'),
  bio: document.querySelector('#bio'),
  resetProfile: document.querySelector('#btn-reset-profile'),

  // 스킬
  skills: document.querySelector('#skills'),
  fSkill: document.querySelector('#form-skill'),
  skillInput: document.querySelector('#skill-input'),

  // 프로젝트
  fProject: document.querySelector('#form-project'),
  projTitle: document.querySelector('#proj-title'),
  projPeriod: document.querySelector('#proj-period'),
  projRole: document.querySelector('#proj-role'),
  projSummary: document.querySelector('#proj-summary'),
  projStack: document.querySelector('#proj-stack'),
  projectsWrap: document.querySelector('#projects'),
  clearProjects: document.querySelector('#btn-clear-projects'),

  // 공개 미리보기
  pubName: document.querySelector('#pub-name'),
  pubRole: document.querySelector('#pub-role'),
  pubBio: document.querySelector('#pub-bio'),
  pubProjects: document.querySelector('#pub-projects'),
  pubSkills: document.querySelector('#pub-skills'),

  // 기타
  themeBtn: document.querySelector('#btn-theme'),
  exportBtn: document.querySelector('#btn-export'),
};

//  앱 상태 
let profile = store.get('profile', defaultProfile);
let skills  = store.get('skills', defaultSkills);
let projects = store.get('projects', defaultProjects);

//  유틸 
function renderSkills(){
  els.skills.innerHTML = '';
  skills.forEach((s, idx) => {
    const li = document.createElement('li');
    li.textContent = s;
    li.title = '클릭하여 삭제';
    li.addEventListener('click', () => { skills.splice(idx,1); saveSkills(); renderAll(); });
    els.skills.appendChild(li);
  });
}
function renderProjects(){
  els.projectsWrap.innerHTML = '';
  projects.forEach((p, idx) => {
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <h3>${escapeHTML(p.title)}</h3>
      <p class="muted">${escapeHTML(p.period)} · ${escapeHTML(p.role)}</p>
      <p>${escapeHTML(p.summary || '')}</p>
      <small class="muted">${(p.stack||[]).join(', ')}</small>
      <div class="row" style="margin-top:8px;">
        <button class="btn" data-del="${idx}">삭제</button>
      </div>
    `;
    el.querySelector('[data-del]').addEventListener('click', () => {
      projects.splice(idx,1); saveProjects(); renderAll();
    });
    els.projectsWrap.appendChild(el);
  });
}

// 공개 미리보기 렌더
function renderPublic(){
  els.pubName.textContent = profile.name || '';
  els.pubRole.textContent = profile.role || '';
  els.pubBio.textContent  = profile.bio || '';

  // 프로젝트
  els.pubProjects.innerHTML = '';
  projects.forEach(p=>{
    const li = document.createElement('li');
    li.textContent = `${p.title} — ${p.role} (${p.period})`;
    els.pubProjects.appendChild(li);
  });

  // 스킬
  els.pubSkills.innerHTML = '';
  skills.forEach(s=>{
    const li = document.createElement('li');
    li.textContent = s;
    els.pubSkills.appendChild(li);
  });
}

function renderProfilePreview(){
  els.pName.textContent = profile.name || '';
  els.pRole.textContent = profile.role || '';
  els.pEmail.textContent = profile.email || '';
  els.pEmail.href = `mailto:${profile.email || ''}`;
  els.pBio.textContent = profile.bio || '';

  // 폼 반영
  els.name.value = profile.name || '';
  els.role.value = profile.role || '';
  els.email.value = profile.email || '';
  els.bio.value   = profile.bio || '';
}

// 전체 렌더
function renderAll(){
  renderProfilePreview();
  renderSkills();
  renderProjects();
  renderPublic();
}

// 저장
function saveProfile(){ store.set('profile', profile); }
function saveSkills(){ store.set('skills', skills); }
function saveProjects(){ store.set('projects', projects); }

// 단순 XSS 방지용 이스케이프
function escapeHTML(s){
  return String(s ?? '')
    .replaceAll('&','&amp;').replaceAll('<','&lt;')
    .replaceAll('>','&gt;').replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}

/////////  이벤트 바인딩 
// 프로필 저장
els.fProfile.addEventListener('submit', (e)=>{
  e.preventDefault();
  profile = {
    name: els.name.value.trim(),
    role: els.role.value.trim(),
    email: els.email.value.trim(),
    bio:  els.bio.value.trim()
  };
  saveProfile();
  renderAll();

    // <<<<<< 새로 추가됨 (MySQL 업데이트) >>>>>>
  if (window.saveUserToMySQL) {
    window.saveUserToMySQL(profile);
  }
});

// 프로필 초기화(기본값으로)
els.resetProfile.addEventListener('click', ()=>{
  profile = {...defaultProfile};
  saveProfile();
  renderAll();
});

// 스킬 추가
els.fSkill.addEventListener('submit', (e)=>{
  e.preventDefault();
  const v = els.skillInput.value.trim();
  if(!v) return;
  if(!skills.includes(v)) skills.push(v);
  els.skillInput.value = '';
  saveSkills();
  renderAll();
});

// 프로젝트 추가
els.fProject.addEventListener('submit', (e)=>{
  e.preventDefault();
  const p = {
    title: els.projTitle.value.trim(),
    period: els.projPeriod.value.trim(),
    role: els.projRole.value.trim(),
    summary: els.projSummary.value.trim(),
    stack: els.projStack.value.split(',').map(s=>s.trim()).filter(Boolean)
  };
  if(!p.title) return;
  projects.unshift(p);
  els.fProject.reset();
  saveProjects();
  renderAll();

// <<<<< MongoDB 저장 기능 추가 >>>>>
  if (window.saveProjectToMongo) {
    window.saveProjectToMongo(p);
  }

});

// 프로젝트 전체 삭제
els.clearProjects.addEventListener('click', ()=>{
  if(confirm('정말 모든 프로젝트를 삭제할까요?')) {
    projects = [];
    saveProjects();
    renderAll();
  }
});

// 다크모드 토글
els.themeBtn.addEventListener('click', ()=>{
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// JSON 내보내기(다운로드)
els.exportBtn.addEventListener('click', ()=>{
  const data = { profile, skills, projects };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'portfolio.json';
  a.click();
  URL.revokeObjectURL(url);
});

//  초기 로딩 
(function init(){
  // 테마
  const theme = localStorage.getItem('theme') || 'light';
  document.body.classList.toggle('dark', theme === 'dark');

  // 렌더
  renderAll();
})();

// ===============================
//    DB → UI 자동 업데이트 기능
// ===============================
window.updateProfileFromDB = function(newProfile) {
  profile = {
    ...profile,
    ...newProfile
  };

  saveProfile();
  renderAll();

  alert("MySQL 사용자 정보가 UI에 자동 반영되었습니다!");
}

// =======================================
// 📌 MongoDB → 프로젝트 UI 자동 업데이트
// =======================================
window.updateProjectsFromDB = function(list) {
  projects = list.map(p => ({
    title: p.title,
    period: p.created_at?.slice(0, 10) || "",
    role: p.owner,
    summary: p.description,
    stack: p.skills || []
  }));

  saveProjects();
  renderAll();

  alert("MongoDB 프로젝트가 UI에 반영되었습니다!");
}
