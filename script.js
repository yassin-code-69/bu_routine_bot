let courseMapping = {};
let teacherMapping = {};
let rawExcelData = [];

// ১. সম্পূর্ণ ডাটাবেজ (Full Data Provided)
const initialCourses = `CSE-1101: Introduction of Computer Science
CSE-1102: Analog Electronics
CSE-1103: Analog Electronics (Lab)
CSE-1104: Math-I (Differential Calculus & Coordinate Geometry)
CSE-1105: English I
CSE-1106: Business Organization
CSE-1201: Structural Programming Language
CSE-1202: Structural Programming Language Lab
CSE-1204: Digital Logic
CSE-1205: Digital Logic (Lab)
CSE-1203: Integral Calculus & Differential Equation
CSE-1206: English II
CSE-1301: Physics
CSE-1302: Physics (Lab)
CSE-1303: Electronic Device & Circuit
CSE-1304: Electronic Device & Circuit (Lab)
CSE-1305: Object Oriented Programming
CSE-1306: Object Oriented Programming (Lab)
CSE-1307: Government
CSE-2101: Programming Language (Java)
CSE-2102: Programming Language (Java) Lab
CSE-2103: Data Structure
CSE-2104: Data Structure (Lab)
CSE-2105: Discrete Mathematics
CSE-2106: Linear Algebra, Complex Variable
CSE-2201: Algorithm
CSE-2202: Algorithm (Lab)
CSE-2203: Microprocessor & Assembly Language
CSE-2204: Microprocessor & Assembly Language (Lab)
CSE-2205: Statistics & Probability
CSE-2301: Theory of Computation
CSE-2302: Data Communication
CSE-2303: Electrical Drives and Instrumentation
CSE-2304: Electrical Drives and Instrumentation (Lab)
CSE-2305: Web Programming
CSE-3101: Database System
CSE-3102: Database System (Lab)
CSE-3103: Operating System
CSE-3104: Operating System (Lab)
CSE-3105: Accounting
CSE-3106: VLSI Design
CSE-3201: Compiler Design
CSE-3202: Compiler Design (Lab)
CSE-3203: Digital System Design
CSE-3204: Digital System Design (Lab)
CSE-3205: Digital Electronics & Pulse Technique
CSE-3206: Software Engineering
CSE-3301: Pattern Recognition
CSE-3302: Pattern Recognition (Lab)
CSE-3303: Computer Network
CSE-3304: Computer Network (Lab)
CSE-3305: E-Commerce
CSE-3306: Numerical Method
CSE-4101: Project & Thesis I
CSE-4102: Artificial Intelligence
CSE-4103: Artificial Intelligence (Lab)
CSE-4104: Accounting & Introduction to Finance & International Trade
CSE-4105: Elective Major I
CSE-4201: Project & Thesis II
CSE-4202: Computer Graphics
CSE-4203: Computer Graphics (Lab)
CSE-4204: System Analysis & Design
CSE-4205: System Analysis & Design (Lab)
CSE-4301: Project & Thesis III
CSE-4302: Elective Major II (System Programming)
CSE-4303: Peripheral and Interfacing
CSE-4304: Computer Organization & Architecture`;

const initialTeachers = `AK: Ashraful Kabir
AKP: Akash Kumar Pal
ARK: Mohammad Arifin Rahman Khan
AS: Antor Sarkar
DZH: Dr. Zakir Hossain
FAN: Faria Afrin Niha
FH: Md. Fahad Hossain
IHS: Md. Ibrahim Hosen Sojib
KTT: Khandaker Tanha Tasnia
MH: Md. Mesbahuddin Hasib
MM: Mohammad Mamun
MMA: Mohammad Mamun
MN: Mahmud Naeem
NAN: Nurul Amin Nahid
PSC: Pabon Shaha Chowdhury
QJA: Quazi Jamil Azher
RAS: Reshma Ahmed Swarna
RK: Rokeya Khatun
RU: Md. Riaz Uddin
RUZ: Rifat Uz Zaman
SAM: Sarah Mohsin
SI: Md. Sadiq Iqbal
SJ: Sumaia Jahan
SM: Shishir Mallick
SSN: Siam Sadik Nayem
TH: Tanveer Hasan
UKP: Prof Dr. Uzzal Kumar Prodhan
US: Umme Salma`;

// ২. ইনিশিয়ালাইজেশন
window.onload = () => {
    document.getElementById('courseMapData').value = localStorage.getItem('course_map') || initialCourses;
    document.getElementById('teacherMapData').value = localStorage.getItem('teacher_map') || initialTeachers;
    
    const savedTheme = localStorage.getItem('routine_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('themeToggle').innerText = savedTheme === 'dark' ? '☀️' : '🌙';
    
    syncMappings();
};

document.getElementById('themeToggle').onclick = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    document.getElementById('themeToggle').innerText = newTheme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('routine_theme', newTheme);
};

function syncMappings() {
    courseMapping = {}; teacherMapping = {};
    document.getElementById('courseMapData').value.split('\n').forEach(l => {
        const [k, v] = l.split(':'); if(k) courseMapping[k.trim()] = v?.trim() || "";
    });
    document.getElementById('teacherMapData').value.split('\n').forEach(l => {
        const [k, v] = l.split(':'); if(k) teacherMapping[k.trim()] = v?.trim() || "";
    });
}

function saveMappings() {
    localStorage.setItem('course_map', document.getElementById('courseMapData').value);
    localStorage.setItem('teacher_map', document.getElementById('teacherMapData').value);
    syncMappings();
    alert("Configurations Saved!");
    document.getElementById('mappingModal').classList.add('hidden');
}

function toggleModal() { document.getElementById('mappingModal').classList.toggle('hidden'); }

// ৩. ফাইল লোড
document.getElementById('fileInput').onchange = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    document.getElementById('fileStatus').innerText = `✅ ${file.name}`;
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (e) => {
        const wb = XLSX.read(e.target.result, {type: 'binary'});
        rawExcelData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {header: 1});
    };
};

// ৪. সার্চ লজিক
function searchRoutine() {
    const batch = document.getElementById('batch').value.trim();
    const section = document.getElementById('section').value.trim().toUpperCase();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Saturday"];
    const timeRegex = /\d{1,2}[:.]?(\d{2})?\s*(am|pm)/i;

    if(!rawExcelData.length) return alert("Upload Routine File First!");

    let results = [];

    for(let i=0; i<rawExcelData.length; i++) {
        for(let j=0; j<rawExcelData[i].length; j++) {
            let cell = rawExcelData[i][j]?.toString() || "";
            
            // STRICT FILTERING: Must contain 'CSE-' + Batch + Section
            if(cell.includes("CSE-") && cell.includes(batch) && cell.includes(`(${section})`)) {
                
                let day = "";
                for(let x=i; x>=0; x--) {
                    let d = rawExcelData[x].find(c => c && days.includes(c.toString().trim()));
                    if(d) { day = d.trim(); break; }
                }

                let time = "";
                for(let x=i; x>=0; x--) {
                    let t = rawExcelData[x][j]?.toString() || "";
                    if(t && timeRegex.test(t)) { time = t; break; }
                }

                results.push({
                    day, time,
                    room: rawExcelData[i][2]?.toString().split(' ')[0] || "N/A",
                    code: cell.match(/CSE-\d+/)?.[0] || "N/A",
                    init: cell.split(/\s+/).pop()
                });
            }
        }
    }
    renderGroupedUI(results, batch, section);
}

// ৫. UI রেন্ডার (Group by Day)
function renderGroupedUI(data, batch, sec) {
    const list = document.getElementById('routineList');
    list.innerHTML = "";
    document.getElementById('classCount').innerText = `${data.length} Classes Found`;
    document.getElementById('routineTitle').innerText = `Schedule: Batch ${batch}(${sec})`;

    if(data.length === 0) {
        list.innerHTML = "<div style='text-align:center; padding:40px; color:var(--subtext)'>No classes found. Check Batch/Section.</div>";
        document.getElementById('resultSection').classList.remove('hidden');
        return;
    }

    const dayOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Saturday"];

    dayOrder.forEach(day => {
        const dayClasses = data.filter(d => d.day === day);
        dayClasses.sort((a, b) => a.time.localeCompare(b.time));

        if (dayClasses.length > 0) {
            let dayHTML = `
                <div class="day-container">
                    <div class="day-title">📅 ${day}</div>
            `;

            dayClasses.forEach(item => {
                dayHTML += `
                    <div class="routine-card">
                        <div class="time-col">
                            <span class="time-display">🕒 ${item.time}</span>
                            <span class="room-badge">Room ${item.room}</span>
                        </div>
                        <div class="course-col">
                            <span class="course-code">${item.code}</span>
                            <span class="course-name">${courseMapping[item.code] || "University Course"}</span>
                        </div>
                        <div class="teacher-col">
                            <span class="teacher-name">${teacherMapping[item.init] || item.init}</span>
                            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" class="teacher-avatar">
                        </div>
                    </div>
                `;
            });

            dayHTML += `</div>`;
            list.innerHTML += dayHTML;
        }
    });

    document.getElementById('resultSection').classList.remove('hidden');
}

// ৬. PDF এবং ইমেজ সেভ ফাংশন
function saveAsPDF() {
    const originalTitle = document.title;
    const batch = document.getElementById('batch').value;
    const section = document.getElementById('section').value;
    document.title = `Routine_Batch_${batch}(${section})`;
    
    window.print();
    
    document.title = originalTitle;
}

function captureSchedule() {
    const element = document.getElementById('resultSection');
    const btn = document.querySelector('.btn-capture');
    const originalText = btn.innerText;
    btn.innerText = "⏳ Processing...";

    const options = {
        scale: 3, // HD Quality
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg'),
        useCORS: true,
        logging: false
    };

    html2canvas(element, options).then(canvas => {
        const link = document.createElement('a');
        link.download = `Routine_Batch_${document.getElementById('batch').value}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
        btn.innerText = originalText;
    });
}
