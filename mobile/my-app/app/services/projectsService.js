// app/services/projectsService.js

const BASE_URL = "http://YOUR_BACKEND_URL_HERE"; 
// 👆 غيريه برابط السيرفر عندك (localhost / ip / render / vercel)

export async function createProject(data) {
  try {
    const res = await fetch(`${BASE_URL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return await res.json();
  } catch (err) {
    console.log("createProject error:", err);
    return null;
  }
}

export async function getApprovedProjects() {
  try {
    const res = await fetch(`${BASE_URL}/projects?status=approved`);
    return await res.json();
  } catch (err) {
    console.log("getApprovedProjects error:", err);
    return [];
  }
}