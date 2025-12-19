document.addEventListener("DOMContentLoaded", () => {

    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const today = days[new Date().getDay()];

    let data = JSON.parse(localStorage.getItem("planner")) || [];
    let completedCount = Number(localStorage.getItem("completedCount")) || 0;
    let totalStudyHours = Number(localStorage.getItem("totalStudyHours")) || 0;

    const subject = document.getElementById("subject");
    const hours = document.getElementById("hours");
    const day = document.getElementById("day");
    const addBtn = document.getElementById("addBtn");
    const list = document.getElementById("studyList");
    const progress = document.getElementById("progress");
    const percent = document.getElementById("percent");
    const canvas = document.getElementById("chart");
    const ctx = canvas.getContext("2d");
    const badgeBox = document.getElementById("badges");
    const themeBtn = document.getElementById("themeBtn");
    const focusBtn = document.getElementById("focusBtn");

    let focusMode = false;

    addBtn.onclick = addStudy;
    focusBtn.onclick = () => {
        focusMode = !focusMode;
        focusBtn.textContent = focusMode ? "🔍 Show All" : "🎯 Focus Today";
        render();
    };
    themeBtn.onclick = () => {
        document.body.classList.toggle("dark");
        themeBtn.textContent = document.body.classList.contains("dark") ? "☀️ Light Mode" : "🌙 Dark Mode";
    };

    function addStudy() {
        if (!subject.value || hours.value <= 0) return alert("Enter valid data");

        if (data.some(d => d.subject.toLowerCase() === subject.value.toLowerCase())) {
            return alert("Subject already exists");
        }

        data.push({
            subject: subject.value,
            hours: Number(hours.value),
            day: day.value,
            moved: 0,
            color: `hsl(${Math.random()*360},70%,85%)`
        });

        subject.value = "";
        hours.value = "";
        save();
        render();
    }

    function nextDay(d) {
        return days[(days.indexOf(d) + 1) % 7];
    }

    function render() {
        list.innerHTML = "";
        let total = 0;

        data.forEach((item,i) => {
            total += item.hours;

            const li = document.createElement("li");
            li.style.background = item.color;

            if(focusMode && item.day !== today) {
                li.style.opacity = "0.3";
                li.style.filter = "blur(1px)";
            }

            li.innerHTML = `
                <span><b>${item.subject}</b> (${item.day}) - ${item.hours}h <small>Moved:${item.moved}</small></span>
                <div class="actions">
                    <button class="done">✔</button>
                    <button class="next">➡</button>
                </div>
            `;

            li.querySelector(".done").onclick = () => {
                completedCount++;
                totalStudyHours += item.hours;
                data.splice(i,1);
                save();
                render();
            };

            li.querySelector(".next").onclick = () => {
                item.day = nextDay(item.day);
                item.moved++;
                save();
                render();
            };

            list.appendChild(li);
        });

        updateProgress(total);
        drawChart(total);
        updateBadges();
    }

    function updateProgress(total){
        const p = total===0?0:(totalStudyHours/(totalStudyHours+total))*100;
        progress.style.width = p+"%";
        percent.textContent = Math.round(p)+"%";
    }

    function drawChart(total){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        if(total===0) return;

        const cx = canvas.width/2;
        const cy = canvas.height/2;
        const r = 65;

        const angle = (totalStudyHours/(totalStudyHours+total))*Math.PI*2;

        ctx.beginPath();
        ctx.moveTo(cx,cy);
        ctx.arc(cx,cy,r,0,angle);
        ctx.fillStyle="#ff69b4";
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cx,cy);
        ctx.arc(cx,cy,r,angle,Math.PI*2);
        ctx.fillStyle="#eee";
        ctx.fill();

        ctx.fillStyle="#000";
        ctx.font="bold 16px Arial";
        ctx.fillText(Math.round((angle/(Math.PI*2))*100)+"%",cx-15,cy+5);
    }

    function updateBadges(){
        badgeBox.innerHTML="";
        if(completedCount>=3) badgeBox.innerHTML+="🌟 ";
        if(totalStudyHours>=10) badgeBox.innerHTML+="🏆 ";
        if(completedCount>=5) badgeBox.innerHTML+="🔥 ";
    }

    function save(){
        localStorage.setItem("planner",JSON.stringify(data));
        localStorage.setItem("completedCount",completedCount);
        localStorage.setItem("totalStudyHours",totalStudyHours);
    }

    // Auto dark mode for night
    if(new Date().getHours()>=18) document.body.classList.add("dark");

    render();
});
