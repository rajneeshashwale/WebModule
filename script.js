
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const form = $('#resumeForm');
const pv = {
    name: $('#pvName'),
    contact: $('#pvContact'),
    summarySec: $('#pvSummarySec'),
    summary: $('#pvSummary'),
    skillSec: $('#pvSkillSec'),
    skills: $('#pvSkills'),
    eduSec: $('#pvEduSec'),
    edu: $('#pvEdu'),
    expSec: $('#pvExpSec'),
    exp: $('#pvExp')
};

const progressBar = $('#progressBar');
const progressText = $('#progressText');
const progressTips = $('#progressTips');

const eduList = $('#eduList');
const expList = $('#expList');
const eduTpl = $('#eduTemplate');
const expTpl = $('#expTemplate');

const quickSkills = [
    'HTML', 'CSS', 'JavaScript', 'React', 'Tailwind', 'Node.js', 'Express', 'MongoDB', 'SQL', 'Git', 'Figma', 'Canva', 'Photoshop', 'Premiere Pro', 'After Effects', 'Python', 'Java'
];

// Render quick skill buttons
const quickWrap = $('#quickSkills');
quickSkills.forEach(s => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn'; b.textContent = s;
    b.addEventListener('click', () => addSkillChip(s));
    quickWrap.appendChild(b);
});

// Skill chips
const skillChips = $('#skillChips');
const skillInput = $('#skillInput');
const addSkillBtn = $('#addSkillBtn');

function addSkillChip(txt) {
    const val = (txt ?? skillInput.value).trim();
    if (!val) return;
    // prevent duplicates (case-insensitive)
    const exists = $$('.chip', skillChips).some(ch => ch.dataset.val?.toLowerCase() === val.toLowerCase());
    if (exists) {
        skillInput.value = ''; updatePreview(); return;
    }
    const chip = document.createElement('span');
    chip.className = 'chip'; chip.dataset.val = val;
    chip.innerHTML = `${val} <button title="Remove">×</button>`;
    chip.querySelector('button').addEventListener('click', () => { chip.remove(); updatePreview(); });
    skillChips.appendChild(chip);
    skillInput.value = '';
    updatePreview();
}
addSkillBtn.addEventListener('click', () => addSkillChip());
skillInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addSkillChip(); } });

// Add/Remove Education & Experience blocks
$('#addEdu').addEventListener('click', () => { addBlock(eduList, eduTpl); });
$('#addExp').addEventListener('click', () => { addBlock(expList, expTpl); });

function addBlock(listEl, tpl) {
    const node = tpl.content.cloneNode(true);
    listEl.appendChild(node);
    listEl.querySelectorAll('input').forEach(inp => inp.addEventListener('input', updatePreview));
    listEl.querySelectorAll('.btnRemove').forEach(btn => btn.onclick = (e) => { e.currentTarget.closest('.panel').remove(); updatePreview(); });
    updatePreview();
    listEl.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Base inputs -> live update
['name', 'email', 'phone', 'location', 'summary'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', updatePreview);
});

// Clear / Download
$('#btnClear').addEventListener('click', () => {
    if (!confirm('Clear the form and reset the preview?')) return;
    form.reset();
    skillChips.innerHTML = '';
    eduList.innerHTML = '';
    expList.innerHTML = '';
    updatePreview(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
$('#btnDownload').addEventListener('click', () => {
    // Use print to PDF (cross-browser friendly). Print styles will hide the form.
    window.print();
});

function sanitize(str = '') { return str.replace(/[<>]/g, s => ({ '<': '&lt;', '>': '&gt;' }[s])); }

function updatePreview(reset = false) {
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const phone = $('#phone').value.trim();
    const loc = $('#location').value.trim();
    const summary = $('#summary').value.trim();

    pv.name.textContent = name || 'Your Name';
    const contactBits = [email, phone, loc].filter(Boolean);
    pv.contact.textContent = contactBits.join(' · ') || 'you@example.com · +91 00000 00000 · City';

    // Summary section
    pv.summarySec.style.display = summary ? '' : 'none';
    pv.summary.textContent = summary;

    // Skills -> preview chips
    pv.skills.innerHTML = '';
    const skills = $$('.chip', skillChips).map(ch => ch.dataset.val);
    pv.skillSec.style.display = skills.length ? '' : 'none';
    skills.forEach(s => {
        const chip = document.createElement('span');
        chip.className = 'chip'; chip.textContent = s;
        pv.skills.appendChild(chip);
    });

    // Education preview
    pv.edu.innerHTML = '';
    const eduPanels = $$('#eduList > .panel');
    pv.eduSec.style.display = eduPanels.length ? '' : 'none';
    eduPanels.forEach(p => {
        const degree = $('input[name="degree"]', p).value.trim();
        const school = $('input[name="school"]', p).value.trim();
        const start = $('input[name="start"]', p).value.trim();
        const end = $('input[name="end"]', p).value.trim();
        const grade = $('input[name="grade"]', p).value.trim();
        const notes = $('input[name="notes"]', p).value.trim();

        const item = document.createElement('div');
        item.className = 'edu-item';
        const left = document.createElement('div');
        left.innerHTML = `<div class="item-role">${sanitize(degree || 'Degree / Course')}</div>
                          <div class="item-meta">${sanitize(school || 'Institution')}</div>
                          ${notes ? `<div style="margin-top:4px">${sanitize(notes)}</div>` : ''}`;
        const right = document.createElement('div');
        right.className = 'item-meta'; right.textContent = [start, end, grade].filter(Boolean).join(' · ');
        item.append(left, right);
        pv.edu.appendChild(item);
    });

    // Experience preview
    pv.exp.innerHTML = '';
    const expPanels = $$('#expList > .panel');
    pv.expSec.style.display = expPanels.length ? '' : 'none';
    expPanels.forEach(p => {
        const title = $('input[name="title"]', p).value.trim();
        const company = $('input[name="company"]', p).value.trim();
        const start = $('input[name="start"]', p).value.trim();
        const end = $('input[name="end"]', p).value.trim();
        const bullets = $('input[name="bullets"]', p).value.split(';').map(s => s.trim()).filter(Boolean);

        const item = document.createElement('div');
        item.className = 'exp-item';
        const left = document.createElement('div');
        left.innerHTML = `<div class="item-role">${sanitize(title || 'Job Title')}</div>
                          <div class="item-meta">${sanitize(company || 'Company')}</div>`;
        const right = document.createElement('div');
        right.className = 'item-meta'; right.textContent = [start, end].filter(Boolean).join(' — ');
        item.append(left, right);
        if (bullets.length) {
            const ul = document.createElement('ul'); ul.className = 'bullets';
            bullets.forEach(b => { const li = document.createElement('li'); li.textContent = b; ul.appendChild(li); });
            item.appendChild(ul);
        }
        pv.exp.appendChild(item);
    });

    if (!reset) bounce('#resume');
    updateProgress();
}

function bounce(sel) {
    const el = document.querySelector(sel);
    if (!el) return;
    el.style.animation = 'none';
    // reflow trick to restart animation
    void el.offsetWidth;
    el.style.animation = '';
}

function updateProgress() {
    // Consider these fields + dynamic ones
    const consider = [$('#name'), $('#email'), $('#phone'), $('#location'), $('#summary')];
    const eduInputs = $$('#eduList input');
    const expInputs = $$('#expList input');
    const skillsCount = $$('#skillChips .chip').length; // treat each chip as a field

    const all = [...consider, ...eduInputs, ...expInputs];
    const filled = all.filter(el => el.value.trim().length > 0).length + skillsCount;
    const total = Math.max(6, all.length + 3); // avoid 0; +3 to include skills capacity baseline
    let pct = Math.min(100, Math.round((filled / total) * 100));

    progressBar.style.width = pct + '%';
    progressText.textContent = pct + '% complete';

    progressTips.textContent = tipForProgress(pct);
}

function tipForProgress(p) {
    if (p < 15) return 'Tip: Add your email and phone next.';
    if (p < 30) return 'Tip: Write a crisp 2–3 line profile summary.';
    if (p < 50) return 'Tip: Add at least one education entry.';
    if (p < 70) return 'Tip: Add your key skills—aim for 6–8.';
    if (p < 85) return 'Tip: Add a recent experience with 2–3 achievements.';
    if (p < 100) return 'Almost there! Review details and click Download PDF.';
    return 'Great job! Save your PDF now.';
}

// Initialize with a sample education & experience row for guidance
addBlock(eduList, eduTpl);
addBlock(expList, expTpl);
updatePreview();
