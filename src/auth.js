// src/auth.js
const USERS_KEY = "chill_users";

// Get all users from localStorage
export const getUsers = () => {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Save users to localStorage
const saveUsers = (users) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error("Failed to save users", e);
  }
};

// Add a new user
export const addUser = ({ username, email, password, phone = "" }) => {
  const users = getUsers();
  
  // Check if username already exists
  if (users.find((u) => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error("USERNAME_EXISTS");
  }
  
  // Check if email already exists
  if (users.find((u) => u.email && u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("EMAIL_EXISTS");
  }
  
  const newUser = { 
    username, 
    email,
    password, 
    phone, 
    premium: false 
  };
  
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

// Validate login (username or email)
export const validateLogin = (identifier, password) => {
  const users = getUsers();
  const lowerIdentifier = identifier.toLowerCase();
  
  const user = users.find(
    (u) => 
      (u.username.toLowerCase() === lowerIdentifier || 
       (u.email && u.email.toLowerCase() === lowerIdentifier)) &&
      u.password === password
  );
  
  if (user) {
    return { 
      username: user.username, 
      email: user.email,
      phone: user.phone,
      premium: user.premium || false 
    };
  }
  return null;
};

// Save current logged-in user
export const saveCurrentUser = (user) => {
  try {
    localStorage.setItem("currentUser", JSON.stringify(user));
  } catch (e) {
    console.error("Failed to save current user", e);
  }
};

// Get current logged-in user
export const getUser = () => {
  try {
    const data = localStorage.getItem("currentUser");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// Update user data
export const updateUser = (username, updates) => {
  const users = getUsers();
  const index = users.findIndex((u) => u.username === username);
  
  if (index !== -1) {
    // Check if email is being updated and already exists
    if (updates.email && updates.email !== users[index].email) {
      const emailExists = users.find(
        (u, i) => i !== index && u.email && u.email.toLowerCase() === updates.email.toLowerCase()
      );
      if (emailExists) {
        throw new Error("EMAIL_EXISTS");
      }
    }
    
    users[index] = { ...users[index], ...updates };
    saveUsers(users);
    
    // Update current user in localStorage if it's the same user
    const currentUser = getUser();
    if (currentUser && currentUser.username === username) {
      saveCurrentUser(users[index]);
    }
    
    return users[index];
  }
  return null;
};

// Upgrade to premium
export const upgradeToPremium = (username) => {
  return updateUser(username, { premium: true });
};