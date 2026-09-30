// Firebase Configuration Setup
const firebaseConfig = {
apiKey: "AIzaSyDC1OdlhgdiU8GFFonoZ1zDRvs2eTdR4dM",
  authDomain: "edumaster-bd.firebaseapp.com",
  databaseURL: "https://edumaster-bd-default-rtdb.firebaseio.com",
  projectId: "edumaster-bd",
  storageBucket: "edumaster-bd.firebasestorage.app",
  messagingSenderId: "1022372537935",
  appId: "1:1022372537935:web:fcc6f205ef11563c5f2c3a",
  measurementId: "G-Q6VQEV4RY4"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// Local Storage Keys
const APP_KEYS = {
    USAGE: 'edumaster_usage_count',
    CURRENT_USER: 'edumaster_curr_user',
    ADMIN_ATTEMPTS: 'edumaster_admin_attempts',
    ADMIN_BLOCKED: 'edumaster_admin_blocked'
};

// 3 Admins Credentials
const ADMIN_ACCOUNTS = {
    "নাহিদুল ইসলাম": "১৯১৪৫৮৭৮৩১",
    "নাফচিন": "৩০০০৮৬",
    "নাইম উদ্দিন": "৫০৯৮৫৮"
};

// Complete Academic Syllabus Data
const SUBJECTS_DATA = {
    "HSC Science": [
        "বাংলা ১ম পত্র", "বাংলা ২য় পত্র", "ইংরেজি ১ম পত্র", "ইংরেজি ২য় পত্র", "তথ্য ও যোগাযোগ প্রযুক্তি (ICT)",
        "পদার্থবিজ্ঞান ১ম পত্র", "পদার্থবিজ্ঞান ২য় পত্র", "রসায়ন ১ম পত্র", "রসায়ন ২য় পত্র",
        "উচ্চতর গণিত ১ম পত্র", "উচ্চতর গণিত ২য় পত্র", "জীববিজ্ঞান ১ম পত্র", "জীববিজ্ঞান ২য় পত্র"
    ],
    "HSC Humanities": [
        "বাংলা ১ম পত্র", "বাংলা ২য় পত্র", "ইংরেজি ১ম পত্র", "ইংরেজি ২য় পত্র", "তথ্য ও যোগাযোগ প্রযুক্তি (ICT)",
        "পৌরনীতি ও সুশাসন ১ম পত্র", "পৌরনীতি ও সুশাসন ২য় পত্র", "অর্থনীতি ১ম পত্র", "অর্থনীতি ২য় পত্র",
        "যুক্তিবিদ্যা ১ম পত্র", "যুক্তিবিদ্যা ২য় পত্র", "ইতিহাস ১ম পত্র", "ইতিহাস ২য় পত্র",
        "ইসলামের ইতিহাস ও সংস্কৃতি ১ম পত্র", "ইসলামের ইতিহাস ও সংস্কৃতি ২য় পত্র", "সমাজবিজ্ঞান ১ম পত্র", "সমাজবিজ্ঞান ২য় পত্র"
    ],
    "HSC Business Studies": [
        "বাংলা ১ম পত্র", "বাংলা ২য় পত্র", "ইংরেজি ১ম পত্র", "ইংরেজি ২য় পত্র", "তথ্য ও যোগাযোগ প্রযুক্তি (ICT)",
        "হিসাববিজ্ঞান ১ম পত্র", "হিসাববিজ্ঞান ২য় পত্র", "ব্যবসায় সংগঠন ও ব্যবস্থাপনা ১ম পত্র", "ব্যবসায় সংগঠন ও ব্যবস্থাপনা ২য় পত্র",
        "ফিন্যান্স, ব্যাংকিং ও বিমা ১ম পত্র", "ফিন্যান্স, ব্যাংকিং ও বিমা ২য় পত্র", "উৎপাদন ব্যবস্থাপনা ও বিপণন ১ম পত্র", "উৎপাদন ব্যবস্থাপনা ও বিপণন ২য় পত্র"
    ],
    "NU Honours Management": [
        "১ম বর্ষ - Principles of Management", "১ম বর্ষ - Principles of Accounting", "১ম বর্ষ - Principles of Marketing", "১ম বর্ষ - Principles of Finance",
        "২য় বর্ষ - Human Resource Management", "২য় বর্ষ - Business Statistics", "২য় বর্ষ - Business Communication", "২য় বর্ষ - Macro Economics",
        "৩য় বর্ষ - Corporate Finance", "৩য় বর্ষ - Organizational Behavior", "৩য় বর্ষ - Marketing Management", "৩য় বর্ষ - Financial Management",
        "৪র্থ বর্ষ - Strategic Management", "৪র্থ বর্ষ - Supply Chain Management", "৪র্থ বর্ষ - Management Information System", "৪র্থ বর্ষ - Project Management"
    ]
};

// Global Arrays connected to Firebase
let mcqData = [];
let knowledgeQuestions = [];
let cqData = [];
let registeredStudents = [];

let usageCount = parseInt(localStorage.getItem(APP_KEYS.USAGE)) || 0;
let currentUser = JSON.parse(localStorage.getItem(APP_KEYS.CURRENT_USER)) || null;

let adminAttempts = parseInt(localStorage.getItem(APP_KEYS.ADMIN_ATTEMPTS)) || 0;
let isAdminBlocked = localStorage.getItem(APP_KEYS.ADMIN_BLOCKED) === 'true';
let currentLoggedInAdmin = null;

let activeSelectedSubject = "সকল বিষয়";

window.onload = function() {
    updateUserStatusUI();
    onDeptChange();
    onAdminDeptChange();
    checkAdminBlockState();
    listenToFirebaseData();
};

// Listen to Firebase Realtime Database
function listenToFirebaseData() {
    db.ref('mcqs').on('value', snapshot => {
        const data = snapshot.val();
        mcqData = data ? Object.keys(data).map(key => ({ fbKey: key, ...data[key] })) : [];
        renderMCQList();
        renderAdminManagePosts();
    });

    db.ref('knowledge').on('value', snapshot => {
        const data = snapshot.val();
        knowledgeQuestions = data ? Object.keys(data).map(key => ({ fbKey: key, ...data[key] })) : [];
        renderKnowledgeList();
        renderAdminManagePosts();
    });

    db.ref('cq').on('value', snapshot => {
        const data = snapshot.val();
        cqData = data ? Object.keys(data).map(key => ({ fbKey: key, ...data[key] })) : [];
        renderCQList();
        renderAdminManagePosts();
    });

    db.ref('students').on('value', snapshot => {
        const data = snapshot.val();
        registeredStudents = data ? Object.values(data) : [];
        renderStudentTable();
    });
}

function checkAdminBlockState() {
    if (isAdminBlocked) {
        document.getElementById('admin-login-box').classList.add('hidden');
        document.getElementById('admin-blocked-box').classList.remove('hidden');
    }
}

function handleUserAction(callback) {
    if (currentUser) {
        callback();
        return;
    }

    if (usageCount >= 5) {
        document.getElementById('reg-modal').classList.remove('hidden');
    } else {
        usageCount++;
        localStorage.setItem(APP_KEYS.USAGE, usageCount);
        updateUserStatusUI();
        callback();
    }
}

function registerStudent(e) {
    e.preventDefault();
    const newUser = {
        name: document.getElementById('reg-name').value,
        studentClass: document.getElementById('reg-class').value,
        roll: document.getElementById('reg-roll').value,
        gender: document.getElementById('reg-gender').value,
        username: document.getElementById('reg-username').value,
        pass: document.getElementById('reg-password').value
    };

    db.ref('students').push(newUser);

    currentUser = newUser;
    localStorage.setItem(APP_KEYS.CURRENT_USER, JSON.stringify(currentUser));

    document.getElementById('reg-modal').classList.add('hidden');
    updateUserStatusUI();
    alert('🎉 রেজিস্ট্রেশন সফল হয়েছে!');
}

function updateUserStatusUI() {
    const el = document.getElementById('user-nav-status');
    if (currentUser) {
        el.innerText = `👤 ${currentUser.name}`;
    } else {
        el.innerText = `🆓 ফ্রি ট্রায়াল: ${usageCount}/5`;
    }
}

// Navigation & Subject Selection
function showSection(sectionId) {
    const sections = ['home', 'curriculum', 'study', 'mcq', 'knowledge', 'cq', 'tracker', 'gpa', 'qbank'];
    sections.forEach(id => {
        const page = document.getElementById(`${id}-section`);
        if (page) page.classList.add('hidden');
    });

    document.getElementById(`${sectionId}-section`).classList.remove('hidden');

    if (sectionId === 'mcq') renderMCQList();
    if (sectionId === 'knowledge') renderKnowledgeList();
    if (sectionId === 'cq') renderCQList();
}

function selectDepartment(deptName) {
    document.getElementById('selected-dept-title').innerText = deptName;
    const container = document.getElementById('subject-cards-container');
    container.innerHTML = '';

    const subjects = SUBJECTS_DATA[deptName] || [];
    subjects.forEach(sub => {
        container.innerHTML += `
            <div class="card text-center">
                <h4>📘 ${sub}</h4>
                <button class="btn btn-outline-blue style-full" style="margin-top:10px;" onclick="goToSubjectContent('${deptName}', '${sub}')">পড়ুন ও পরীক্ষা দিন</button>
            </div>
        `;
    });

    showSection('curriculum');
}

function goToSubjectContent(dept, subject) {
    activeSelectedSubject = subject;
    document.getElementById('dept-select').value = dept;
    onDeptChange();
    document.getElementById('subject-select').value = subject;
    showSection('study');
}

function onDeptChange() {
    const dept = document.getElementById('dept-select').value;
    const subSelect = document.getElementById('subject-select');
    subSelect.innerHTML = '';
    
    const subjects = SUBJECTS_DATA[dept] || [];
    subjects.forEach(sub => {
        subSelect.innerHTML += `<option value="${sub}">${sub}</option>`;
    });
}

function startReading() {
    activeSelectedSubject = document.getElementById('subject-select').value;
    showSection('cq');
}

function startExam() {
    activeSelectedSubject = document.getElementById('subject-select').value;
    showSection('mcq');
}

// Render Questions
function renderMCQList() {
    const container = document.getElementById('mcq-container');
    const tag = document.getElementById('current-subject-tag');
    if (tag) tag.innerText = activeSelectedSubject;
    if (!container) return;

    container.innerHTML = '';

    const filtered = activeSelectedSubject === "সকল বিষয়" ? mcqData : mcqData.filter(x => x.subject === activeSelectedSubject);

    if (filtered.length === 0) {
        container.innerHTML = '<p class="text-muted">এই বিষয়ের জন্য কোনো নৈর্ব্যক্তিক প্রশ্ন পাওয়া যায়নি।</p>';
        return;
    }

    filtered.forEach((q, idx) => {
        let optsHtml = '';
        if(q.options) {
            q.options.forEach(opt => {
                optsHtml += `<label style="display:block; margin:4px 0;"><input type="radio" name="mcq_${idx}" value="${opt}"> ${opt}</label>`;
            });
        }

        container.innerHTML += `
            <div class="q-item" id="mcq_card_${idx}">
                <h4>${q.question}</h4>
                ${optsHtml}
                <div id="mcq_feedback_${idx}" class="hidden"></div>
                <button class="btn btn-outline-pink" style="margin-top:8px; font-size:0.8rem;" onclick="document.getElementById('mcq_ans_${idx}').classList.toggle('hidden')">👁️ উত্তর দেখুন</button>
                <div id="mcq_ans_${idx}" class="ans-box hidden">${q.answer}</div>
            </div>
        `;
    });
}

function submitMCQExam() {
    let score = 0;
    const filtered = activeSelectedSubject === "সকল বিষয়" ? mcqData : mcqData.filter(x => x.subject === activeSelectedSubject);
    
    filtered.forEach((q, idx) => {
        const selected = document.querySelector(`input[name="mcq_${idx}"]:checked`);
        const feedbackEl = document.getElementById(`mcq_feedback_${idx}`);

        if (feedbackEl) {
            feedbackEl.classList.remove('hidden', 'correct', 'wrong');

            if (selected) {
                const userVal = selected.value.trim().toLowerCase();
                const correctVal = q.answer.trim().toLowerCase();

                if (userVal === correctVal) {
                    score++;
                    feedbackEl.className = 'feedback-status correct';
                    feedbackEl.innerHTML = `✅ সঠিক উত্তর!`;
                } else {
                    feedbackEl.className = 'feedback-status wrong';
                    feedbackEl.innerHTML = `❌ ভুল হয়েছে! আপনার বাছাই: ${selected.value} | ✔️ সঠিক উত্তর: <strong>${q.answer}</strong>`;
                }
            } else {
                feedbackEl.className = 'feedback-status wrong';
                feedbackEl.innerHTML = `⚠️ কোনো অপশন দাগানো হয়নি! ✔️ সঠিক উত্তর: <strong>${q.answer}</strong>`;
            }
        }
    });

    const res = document.getElementById('mcq-score-card');
    res.innerText = `প্রাপ্ত নম্বর: ${score} / ${filtered.length}`;
    res.classList.remove('hidden');
}

function renderKnowledgeList() {
    const container = document.getElementById('knowledge-list');
    const tag = document.getElementById('knowledge-subject-tag');
    if (tag) tag.innerText = activeSelectedSubject;
    if (!container) return;

    container.innerHTML = '';

    const filtered = activeSelectedSubject === "সকল বিষয়" ? knowledgeQuestions : knowledgeQuestions.filter(x => x.subject === activeSelectedSubject);

    if (filtered.length === 0) {
        container.innerHTML = '<p class="text-muted">এই বিষয়ের জন্য কোনো জ্ঞানমূলক প্রশ্ন পাওয়া যায়নি।</p>';
        return;
    }

    filtered.forEach((item, idx) => {
        container.innerHTML += `
            <div class="card" style="margin-bottom:12px;">
                <h4>${item.q}</h4>
                <button class="btn btn-outline-blue" style="font-size:0.8rem;" onclick="document.getElementById('k_ans_${idx}').classList.toggle('hidden')">👁️ উত্তর দেখুন</button>
                <div id="k_ans_${idx}" class="ans-box hidden" style="margin-top:8px;">${item.a}</div>
            </div>
        `;
    });
}

function renderCQList() {
    const container = document.getElementById('cq-list');
    const tag = document.getElementById('cq-subject-tag');
    if (tag) tag.innerText = activeSelectedSubject;
    if (!container) return;

    container.innerHTML = '';

    const filtered = activeSelectedSubject === "সকল বিষয়" ? cqData : cqData.filter(x => x.subject === activeSelectedSubject);

    if (filtered.length === 0) {
        container.innerHTML = '<p class="text-muted">এই বিষয়ের জন্য কোনো সৃজনশীল প্রশ্ন পাওয়া যায়নি।</p>';
        return;
    }

    filtered.forEach((item, idx) => {
        let qaContent = '';
        if (Array.isArray(item.qaList)) {
            qaContent = item.qaList.map(qa => `<p style="white-space: pre-line; margin-bottom:8px;">${qa}</p>`).join('');
        }

        container.innerHTML += `
            <div class="card" style="margin-bottom:15px;">
                <div class="stem-box"><strong>উদ্দীপক:</strong><br>${item.stem}</div>
                <button class="btn btn-outline-pink" style="margin-bottom:10px; font-size:0.85rem;" onclick="document.getElementById('cq_ans_${idx}').classList.toggle('hidden')">📝 প্রশ্ন ও উত্তরসমূহ দেখুন</button>
                <div id="cq_ans_${idx}" class="hidden" style="background:#f8f9fa; padding:12px; border-radius:5px;">${qaContent}</div>
            </div>
        `;
    });
}

// ADMIN SECURITY & POST PUBLISHING
function checkAdminLogin() {
    if (isAdminBlocked) return;

    const selectedAdmin = document.getElementById('admin-name-select').value;
    const inputPass = document.getElementById('admin-pass-input').value;

    if (ADMIN_ACCOUNTS[selectedAdmin] && ADMIN_ACCOUNTS[selectedAdmin] === inputPass) {
        adminAttempts = 0;
        localStorage.setItem(APP_KEYS.ADMIN_ATTEMPTS, 0);

        currentLoggedInAdmin = selectedAdmin;
        document.getElementById('admin-display-name').innerText = currentLoggedInAdmin;
        document.getElementById('post-author-name').innerText = `${currentLoggedInAdmin} (Admin)`;

        document.getElementById('admin-login-box').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        renderStudentTable();
        renderAdminManagePosts();
    } else {
        adminAttempts++;
        localStorage.setItem(APP_KEYS.ADMIN_ATTEMPTS, adminAttempts);

        const remaining = 4 - adminAttempts;
        const errEl = document.getElementById('login-error');

        if (adminAttempts >= 4) {
            isAdminBlocked = true;
            localStorage.setItem(APP_KEYS.ADMIN_BLOCKED, 'true');
            checkAdminBlockState();
        } else {
            errEl.innerText = `ভুল পাসওয়ার্ড! আর মাত্র ${remaining} বার চেষ্টা করতে পারবেন।`;
            errEl.classList.remove('hidden');
        }
    }
}

function adminLogout() {
    location.reload();
}

function onAdminDeptChange() {
    const dept = document.getElementById('post-dept-select').value;
    const subSelect = document.getElementById('post-subject-select');
    subSelect.innerHTML = '';
    
    const subjects = SUBJECTS_DATA[dept] || [];
    subjects.forEach(sub => {
        subSelect.innerHTML += `<option value="${sub}">${sub}</option>`;
    });
}

function togglePostFormFields() {
    const type = document.getElementById('post-type-select').value;
    document.getElementById('form-fields-cq').classList.add('hidden');
    document.getElementById('form-fields-knowledge').classList.add('hidden');
    document.getElementById('form-fields-mcq').classList.add('hidden');

    document.getElementById(`form-fields-${type}`).classList.remove('hidden');
}

function publishPost() {
    const dept = document.getElementById('post-dept-select').value;
    const subject = document.getElementById('post-subject-select').value;
    const type = document.getElementById('post-type-select').value;

    if (type === 'cq') {
        const stem = document.getElementById('cq-stem-text').value;
        const qaFull = document.getElementById('cq-qa-full').value;

        if (!stem || !qaFull) return alert('উদ্দীপক এবং প্রশ্ন উত্তর লিখুন!');

        const qaList = qaFull.split('\n\n').filter(x => x.trim() !== '');
        db.ref('cq').push({ dept, subject, stem, qaList });

    } else if (type === 'knowledge') {
        const fullText = document.getElementById('k-qa-full').value;
        if (!fullText) return alert('প্রশ্ন ও উত্তর প্রদান করুন!');

        const blocks = fullText.split('\n\n');
        blocks.forEach(block => {
            const lines = block.split('\n');
            if (lines.length >= 2) {
                db.ref('knowledge').push({
                    dept, subject,
                    q: lines[0],
                    a: lines[1]
                });
            }
        });

    } else if (type === 'mcq') {
        const bulkText = document.getElementById('mcq-bulk-text').value;
        if (!bulkText) return alert('নৈর্ব্যক্তিক প্রশ্নমালা প্রদান করুন!');

        const blocks = bulkText.split('\n\n');
        blocks.forEach(block => {
            const lines = block.split('\n').map(l => l.trim()).filter(l => l !== '');
            if (lines.length >= 6) {
                db.ref('mcqs').push({
                    dept, subject,
                    question: lines[0],
                    options: [lines[1], lines[2], lines[3], lines[4]],
                    answer: lines[5].replace('উত্তর:', '').trim()
                });
            }
        });
    }

    alert('🚀 ক্লাউড ডেটাবেসে সফলভাবে আপলোড করা হয়েছে!');
}

// ADMIN POST MANAGEMENT & DELETE FUNCTIONALITY
function renderAdminManagePosts() {
    const container = document.getElementById('admin-posts-container');
    if (!container) return;
    container.innerHTML = '';

    let totalHtml = '<h4>📝 নৈর্ব্যক্তিক (MCQ) প্রশ্নসমূহ</h4>';
    if (mcqData.length === 0) totalHtml += '<p class="text-muted">কোনো নৈর্ব্যক্তিক পোস্ট নেই।</p>';
    mcqData.forEach((item) => {
        totalHtml += `
            <div class="admin-post-item">
                <div>
                    <strong>[${item.subject}]</strong> ${item.question}
                </div>
                <button class="btn btn-danger" style="font-size:0.8rem; padding:4px 10px;" onclick="deletePost('mcqs', '${item.fbKey}')">🗑️ ডিলিট</button>
            </div>
        `;
    });

    totalHtml += '<h4 style="margin-top:20px;">💡 জ্ঞানমূলক প্রশ্নসমূহ</h4>';
    if (knowledgeQuestions.length === 0) totalHtml += '<p class="text-muted">কোনো জ্ঞানমূলক পোস্ট নেই।</p>';
    knowledgeQuestions.forEach((item) => {
        totalHtml += `
            <div class="admin-post-item">
                <div>
                    <strong>[${item.subject}]</strong> ${item.q}
                </div>
                <button class="btn btn-danger" style="font-size:0.8rem; padding:4px 10px;" onclick="deletePost('knowledge', '${item.fbKey}')">🗑️ ডিলিট</button>
            </div>
        `;
    });

    totalHtml += '<h4 style="margin-top:20px;">📄 সৃজনশীল প্রশ্নসমূহ</h4>';
    if (cqData.length === 0) totalHtml += '<p class="text-muted">কোনো সৃজনশীল পোস্ট নেই।</p>';
    cqData.forEach((item) => {
        totalHtml += `
            <div class="admin-post-item">
                <div>
                    <strong>[${item.subject}]</strong> ${item.stem ? item.stem.substring(0, 50) : ''}...
                </div>
                <button class="btn btn-danger" style="font-size:0.8rem; padding:4px 10px;" onclick="deletePost('cq', '${item.fbKey}')">🗑️ ডিলিট</button>
            </div>
        `;
    });

    container.innerHTML = totalHtml;
}

function deletePost(node, fbKey) {
    if (!confirm('আপনি কি নিশ্চিত যে এই পোস্টটি মুছে ফেলতে চান?')) return;
    db.ref(`${node}/${fbKey}`).remove()
        .then(() => alert('🗑️ ডাটাবেস থেকে মুছে ফেলা হয়েছে!'))
        .catch(err => alert('ভুল হয়েছে: ' + err.message));
}

function renderStudentTable() {
    const tbody = document.getElementById('students-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (registeredStudents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">কোনো শিক্ষার্থী এখনও নিবন্ধিত হয়নি।</td></tr>';
        return;
    }
    registeredStudents.forEach(st => {
        tbody.innerHTML += `
            <tr>
                <td>${st.name}</td>
                <td>${st.studentClass}</td>
                <td>${st.roll}</td>
                <td>${st.gender}</td>
                <td>${st.username}</td>
            </tr>
        `;
    });
}