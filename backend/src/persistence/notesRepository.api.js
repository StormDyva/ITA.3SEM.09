const BASE_URL = "https://fake.jsonmockapi.com/vehicles?length=10";

// Helper to strip userId from API responses to match our { id, title, body } contract
function stripUserId(post) {
  if (!post) return null;
  const { userId, ...rest } = post;
  return rest;
}

async function findAll() {
  const response = await fetch(BASE_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch notes");
  }

  const posts = await response.json();
  return posts.map(stripUserId);
}

async function findById(id) {
  const response = await fetch(`${BASE_URL}/${id}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch note");
  }

  const post = await response.json();
  return stripUserId(post);
}

async function create(title, body) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title,
      body
    })
  });

  if (!response.ok) {
    throw new Error("Failed to create note");
  }

  const post = await response.json();
  return stripUserId(post);
}

module.exports = {
  findAll,
  findById,
  create
};
