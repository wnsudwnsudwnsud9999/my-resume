// ===============================
//  MySQL 사용자 정보 가져오기
// ===============================
async function loadUser() {
  try {
    const res = await fetch("http://localhost:3000/api/user/student1");
    const data = await res.json();

    if (data.error) {
      alert("MySQL 사용자 정보를 찾을 수 없습니다.");
      return;
    }

    console.log("MySQL 데이터 로드:", data);

    // DB→app.js로 데이터 전달
    window.updateProfileFromDB({
      name: data.display_name,
      role: "컴퓨터공학과 학생",
      email: data.email,
      bio: "MySQL에서 자동 불러온 사용자 정보입니다."
    });

  } catch (err) {
    console.error("loadUser 오류:", err);
    alert("MySQL 로드 실패");
  }
}


// ===============================
//  MongoDB 포트폴리오 가져오기
// ===============================
async function loadPortfolio() {
  try {
    const res = await fetch("http://localhost:3000/api/portfolio/list");
    const data = await res.json();

    console.log("MongoDB 포트폴리오:", data);

    const box = document.querySelector("#mongoResult");
    box.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    console.error("loadPortfolio 오류:", err);
    alert("MongoDB 로드 실패");
  }
}

// =============================================
// 📌 MySQL에 프로필 정보를 저장하는 함수
// =============================================
async function saveUserToMySQL(profile) {
  try {
    const sendData = {
      username: "student1",       // 현재 고정 사용자
      display_name: profile.name, // app.js의 profile.name
      email: profile.email        // app.js의 profile.email
    };

    const res = await fetch("http://localhost:3000/api/user/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sendData)
    });

    const result = await res.json();

    if (result.error) {
      alert("MySQL 업데이트 실패: " + result.error);
    } else {
      console.log("MySQL 업데이트 성공:", result);
    }
  } catch (err) {
    console.error("MySQL 저장 오류:", err);
  }
}

async function loadPortfolioToUI() {
  try {
    const res = await fetch("http://localhost:3000/api/portfolio/list");
    const list = await res.json();

    if (!Array.isArray(list)) {
      alert("MongoDB 목록을 불러올 수 없습니다.");
      return;
    }

    console.log("MongoDB 포트폴리오:", list);

    // ← app.js의 projects 배열에 MongoDB 데이터 주입
    if (window.updateProjectsFromDB) {
      window.updateProjectsFromDB(list);
    }

  } catch (err) {
    console.error("MongoDB 로드 오류:", err);
  }
}

// =============================================
// 📌 프로젝트를 MongoDB에 저장하는 함수
// =============================================
async function saveProjectToMongo(newProject) {
  try {
    const res = await fetch("http://localhost:3000/api/portfolio/create", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        title: newProject.title,
        period: newProject.period,
        role: newProject.role,
        summary: newProject.summary,
        stack: newProject.stack
      })
    });

    const data = await res.json();
    console.log("MongoDB 저장 결과:", data);
  } catch (err) {
    console.error("MongoDB 저장 오류:", err);
  }
}

