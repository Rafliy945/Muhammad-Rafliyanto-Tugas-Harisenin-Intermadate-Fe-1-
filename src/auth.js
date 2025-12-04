

export function getUsers() {
  try {
    const raw = localStorage.getItem('users');
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('getUsers error', err);
    return [];
  }
}

export function addUser({ username, password }) {
  if (!username || !password) throw new Error('Username dan password wajib diisi');
  const users = getUsers();
  const exists = users.some(u => u.username && u.username.toLowerCase() === username.toLowerCase());
  if (exists) {
    const err = new Error('USERNAME_EXISTS');
    err.code = 'USERNAME_EXISTS';
    throw err;
  }
  // Tambahkan properti premium: false secara default
  const newUser = { username, password, premium: false }; 
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  return newUser;
}

export function validateLogin(username, password) {
  const users = getUsers();
  const user = users.find(u => u.username.toLowerCase() === (username || '').toLowerCase());
  if (!user) return null;
  if (user.password !== password) return null;
  // Return user object tanpa password, termasuk status premium
  return { username: user.username, premium: user.premium || false };
}

export function saveCurrentUser(user) {
  try {
    localStorage.setItem('currentUser', JSON.stringify(user));
    return true;
  } catch (err) {
    console.error('saveCurrentUser', err);
    return false;
  }
}

export function getUser() {
  try {
    const raw = localStorage.getItem('currentUser');
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('getUser', err);
    return null;
  }
}

export function logoutUser() {
  try {
    localStorage.removeItem('currentUser');
    return true;
  } catch (err) {
    console.error('logoutUser', err);
    return false;
  }
}