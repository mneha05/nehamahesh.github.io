// dark mode toggle with localStorage
const btn = document.getElementById('themeToggle');
const root = document.documentElement;

function setTheme(mode){
  if(mode === 'light'){
    document.body.classList.add('light');
    localStorage.setItem('theme','light');
    btn.textContent = '☀️';
  }else{
    document.body.classList.remove('light');
    localStorage.setItem('theme','dark');
    btn.textContent = '🌙';
  }
}

const saved = localStorage.getItem('theme');
if(saved){ setTheme(saved); }
else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches){
  setTheme('light');
}else{
  setTheme('dark');
}

btn.addEventListener('click', ()=>{
  const current = localStorage.getItem('theme') || 'dark';
  setTheme(current === 'dark' ? 'light' : 'dark');
});

// year in footer
document.getElementById('year').textContent = new Date().getFullYear();
