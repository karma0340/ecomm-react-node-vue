// import React, { useEffect, useState, useRef } from 'react';
// import axios from 'axios';
// import { motion, AnimatePresence } from 'framer-motion';
// import { ToastContainer, toast } from 'react-toastify';
// import { FaEye, FaEyeSlash, FaEdit } from 'react-icons/fa';
// import Brightness4Icon from '@mui/icons-material/Brightness4';
// import Brightness7Icon from '@mui/icons-material/Brightness7';
// import PaletteIcon from '@mui/icons-material/Palette';
// import 'react-toastify/dist/ReactToastify.css';
// import defaultAvatar from '../assets/images/default-avatar.png';

// const THEMES = {
//   light: {
//     '--app-bg': '#fff',
//     '--app-text': '#141414',
//     '--primary': '#4955f6',
//     '--card-bg': '#fbfbfb',
//   },
//   dark: {
//     '--app-bg': '#121212',
//     '--app-text': '#ededed',
//     '--primary': '#7783fa',
//     '--card-bg': '#232324',
//   },
//   grey: {
//     '--app-bg': '#c0c1c6',
//     '--app-text': '#242324',
//     '--primary': '#353941',
//     '--card-bg': '#e8e8ea',
//   }
// };

// const dropdownAnim = {
//   initial: { opacity: 0, y: 30, scale: 0.97 },
//   animate: { opacity: 1, y: 0, scale: 1 },
//   exit: { opacity: 0, y: 30, scale: 0.97 }
// };

// export default function Settings() {
//   // USER/PROFILE STATE
//   const [user, setUser] = useState(null);
//   const [form, setForm] = useState({ name: '', email: '', phone: '' });
//   const [loading, setLoading] = useState(true);
//   const [editMode, setEditMode] = useState(false);

//   // THEME
//   const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

//   // PASSWORD
//   const [showPasswordPanel, setShowPasswordPanel] = useState(false);
//   const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '' });
//   const [showPw, setShowPw] = useState(false);
//   const [pwLoading, setPwLoading] = useState(false);

//   // DELETE ACCOUNT
//   const [confirmDelete, setConfirmDelete] = useState(false);
//   const [deleting, setDeleting] = useState(false);

//   // AVATAR
//   const [avatarPreview, setAvatarPreview] = useState('');
//   const fileInputRef = useRef(null);

//   // Fetch user on mount
//   useEffect(() => {
//     async function fetchUser() {
//       try {
//         setLoading(true);
//         const token = localStorage.getItem('token');
//         const res = await axios.get('http://localhost:3000/api/users/me', {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setUser(res.data);
//         setForm({
//           name: res.data.name || '',
//           email: res.data.email || '',
//           phone: res.data.phone || ''
//         });
//         setAvatarPreview(res.data.avatarUrl || res.data.avatar || '');
//       } catch {
//         setUser(null);
//       }
//       setLoading(false);
//     }
//     fetchUser();
//   }, []);

//   // Theme
//   useEffect(() => {
//     const vars = THEMES[theme];
//     Object.entries(vars).forEach(([key, val]) => {
//       document.documentElement.style.setProperty(key, val);
//     });
//     localStorage.setItem('theme', theme);
//   }, [theme]);
//   function cycleTheme() {
//     setTheme(t => t === 'light' ? 'dark' : t === 'dark' ? 'grey' : 'light');
//   }

//   // Handle Input
//   function handleInput(e) {
//     const { name, value } = e.target;
//     setForm(f => ({ ...f, [name]: value }));
//     setEditMode(true);
//   }

//   // Handle Avatar Upload
//   function handleAvatarChange(e) {
//     const file = e.target.files[0];
//     if (!file) return;
//     setAvatarPreview(URL.createObjectURL(file));
//     setForm(f => ({ ...f, avatar: file }));
//     setEditMode(true);
//   }

//   // Submit Profile/Edit form
//   async function handleSave(e) {
//     e.preventDefault();
//     if (!form.name.trim() || !form.email.trim()) {
//       toast.error("Name and email required");
//       return;
//     }
//     const fd = new FormData();
//     if (form.name) fd.append('name', form.name.trim());
//     if (form.email) fd.append('email', form.email.trim());
//     if (form.phone) fd.append('phone', form.phone.trim());
//     if (form.avatar && typeof form.avatar !== 'string') fd.append('avatar', form.avatar);
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
//       const res = await axios.put('http://localhost:3000/api/users/me', fd, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setUser(res.data);
//       setAvatarPreview(res.data.avatarUrl || res.data.avatar || '');
//       setEditMode(false);
//       toast.success('Profile updated!');
//     } catch (err) {
//       toast.error(err.response?.data?.error || "Update failed.");
//     }
//     setLoading(false);
//   }

//   // Cancel form changes
//   function handleCancelEdit() {
//     setForm({
//       name: user.name || '',
//       email: user.email || '',
//       phone: user.phone || ''
//     });
//     setAvatarPreview(user.avatarUrl || user.avatar || '');
//     setEditMode(false);
//   }

//   // Password panel handlers
//   function handlePwInput(e) {
//     const { name, value } = e.target;
//     setPwForm(f => ({ ...f, [name]: value }));
//   }
//   async function handleChangePassword(e) {
//     e.preventDefault();
//     if (!pwForm.oldPassword || !pwForm.newPassword) {
//       toast.error('All fields required');
//       return;
//     }
//     if (pwForm.newPassword.length < 6) {
//       toast.error('Password min 6 characters');
//       return;
//     }
//     setPwLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       await axios.put(
//         'http://localhost:3000/api/users/me/change-password',
//         pwForm,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       toast.success('Password changed');
//       setShowPasswordPanel(false);
//       setPwForm({ oldPassword: '', newPassword: '' });
//     } catch (err) {
//       toast.error(err.response?.data?.error || "Failed to update password.");
//     }
//     setPwLoading(false);
//   }

//   // Delete Account
//   async function handleDeleteAccount() {
//     setDeleting(true);
//     try {
//       const token = localStorage.getItem('token');
//       await axios.delete('http://localhost:3000/api/users/me', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       localStorage.removeItem('token');
//       toast.success("Account deleted.");
//       window.location.href = "/";
//     } catch (err) {
//       toast.error(err.response?.data?.error || "Delete failed.");
//       setDeleting(false);
//     }
//   }

//   if (loading) return (
//     <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
//       <div className="spinner-border text-primary" /> <span className="ms-3">Loading settings...</span>
//     </div>
//   );

//   if (!user) return (
//     <div className="py-5 text-center">
//       <h3>User not authenticated</h3>
//       <p className="lead">Please log in to view settings.</p>
//     </div>
//   );

//   return (
//     <div className="container py-5" style={{ maxWidth: 550 }}>
//       <ToastContainer autoClose={2000} />
//       <AnimatePresence>
//         {/* Profile Card */}
//         <motion.div
//           key="profile-card"
//           initial={{ opacity: 0, y: 40, scale: 0.97 }}
//           animate={{ opacity: 1, y: 0, scale: 1 }}
//           exit={{ opacity: 0, y: 40, scale: 0.97 }}
//           transition={{ duration: 0.35, type: 'spring' }}
//           className="card shadow-lg"
//           style={{ background: "var(--card-bg)" }}
//         >
//           <div className="card-body">
//             <div className="d-flex align-items-center mb-4">
//               <div style={{ position: "relative" }}>
//                 <img
//                   src={avatarPreview || defaultAvatar}
//                   alt="Avatar"
//                   width={96} height={96}
//                   className="rounded-circle border shadow"
//                   style={{ objectFit: 'cover', background: '#fff' }}
//                 />
//                 {editMode && (
//                   <>
//                     <input
//                       type="file"
//                       accept="image/*"
//                       style={{ display: "none" }}
//                       ref={fileInputRef}
//                       onChange={handleAvatarChange}
//                     />
//                     <button type="button"
//                       className="btn btn-light btn-sm border rounded-circle"
//                       style={{ position: 'absolute', right: 0, bottom: 2, background: "#fff8" }}
//                       title="Upload new avatar"
//                       onClick={() => fileInputRef.current.click()}
//                     ><i className="bi bi-camera" /></button>
//                   </>
//                 )}
//               </div>
//               <div className="ms-4">
//                 <div className="h5 m-0">{user.name}</div>
//                 <div className="small text-muted">{user.email}</div>
//                 <button className="btn btn-link btn-sm mt-1" onClick={cycleTheme} style={{ textDecoration: "none" }}>
//                   {theme === "light" && <Brightness4Icon />}
//                   {theme === "dark" && <PaletteIcon />}
//                   {theme === "grey" && <Brightness7Icon />} Theme
//                 </button>
//               </div>
//             </div>
//             {/* --- VIEW & EDIT MODE --- */}
//             {!editMode ? (
//               <div className="mb-4">
//                 <div className="mb-2"><b>Name:</b> {user.name}</div>
//                 <div className="mb-2"><b>Email:</b> {user.email}</div>
//                 <div className="mb-2"><b>Phone:</b> {user.phone || <span className="text-muted">not set</span>}</div>
//                 <button type="button" className="btn btn-outline-primary btn-sm mt-2"
//                   onClick={() => setEditMode(true)}>
//                   <FaEdit className="me-1" /> Edit Profile
//                 </button>
//               </div>
//             ) : (
//               <form className="row g-3" onSubmit={handleSave}>
//                 <div className="col-12">
//                   <label className="form-label fw-semibold">Full Name</label>
//                   <input type="text" className="form-control"
//                     name="name" value={form.name}
//                     onChange={handleInput}
//                     disabled={loading}
//                     required minLength={2}
//                   />
//                 </div>
//                 <div className="col-12">
//                   <label className="form-label fw-semibold">Email</label>
//                   <input type="email" className="form-control"
//                     name="email" value={form.email}
//                     onChange={handleInput}
//                     disabled={loading}
//                     required
//                   />
//                 </div>
//                 <div className="col-md-7">
//                   <label className="form-label fw-semibold">Phone</label>
//                   <input type="text" className="form-control"
//                     name="phone" value={form.phone}
//                     onChange={handleInput}
//                     disabled={loading}
//                   />
//                 </div>
//                 <div className="col d-flex gap-2 align-items-end">
//                   <button type="submit"
//                     className="btn btn-primary"
//                     disabled={loading}
//                   >{loading ? "Saving..." : "Save Changes"}</button>
//                   <button type="button" className="btn btn-outline-secondary"
//                     disabled={loading}
//                     onClick={handleCancelEdit}
//                   >Cancel</button>
//                 </div>
//               </form>
//             )}
//             {/* Change password */}
//             <div className="mt-4">
//               <button className="btn btn-outline-secondary rounded-pill" type="button"
//                 onClick={() => setShowPasswordPanel(v => !v)}
//               >Change Password</button>
//               <AnimatePresence>
//                 {showPasswordPanel && (
//                   <motion.form
//                     key="pw-panel"
//                     variants={dropdownAnim}
//                     initial="initial"
//                     animate="animate"
//                     exit="exit"
//                     transition={{ duration: 0.19, type: 'spring' }}
//                     className="border rounded p-3 mt-3 bg-light-subtle"
//                     style={{ maxWidth: 450 }}
//                     onSubmit={handleChangePassword}
//                   >
//                     <div className="mb-2">
//                       <label className="form-label">Old Password</label>
//                       <input
//                         type={showPw ? "text" : "password"}
//                         className="form-control"
//                         name="oldPassword"
//                         value={pwForm.oldPassword}
//                         onChange={handlePwInput}
//                         required
//                       />
//                     </div>
//                     <div className="mb-2">
//                       <label className="form-label">New Password</label>
//                       <div className="input-group">
//                         <input
//                           type={showPw ? "text" : "password"}
//                           className="form-control"
//                           name="newPassword"
//                           value={pwForm.newPassword}
//                           onChange={handlePwInput}
//                           minLength={6}
//                           required
//                         />
//                         <button className="btn btn-outline-secondary"
//                           type="button" tabIndex={-1}
//                           onClick={() => setShowPw(v => !v)}
//                         >
//                           {showPw ? <FaEyeSlash /> : <FaEye />}
//                         </button>
//                       </div>
//                     </div>
//                     <div className="d-flex justify-content-end gap-2 mt-2">
//                       <button type="button"
//                         className="btn btn-outline-secondary btn-sm"
//                         onClick={() => setShowPasswordPanel(false)}
//                       >Cancel</button>
//                       <button type="submit"
//                         className="btn btn-primary btn-sm"
//                         disabled={pwLoading}
//                       >{pwLoading ? "Updating..." : "Update Password"}</button>
//                     </div>
//                   </motion.form>
//                 )}
//               </AnimatePresence>
//             </div>
//             {/* Delete account */}
//             <div className="mt-4">
//               <button className="btn btn-outline-danger"
//                 onClick={() => setConfirmDelete(true)}
//                 disabled={deleting}
//               >Delete My Account</button>
//               <AnimatePresence>
//                 {confirmDelete && (
//                   <motion.div
//                     key="delete-confirm"
//                     variants={dropdownAnim}
//                     initial="initial"
//                     animate="animate"
//                     exit="exit"
//                     transition={{ duration: 0.16, type: 'spring' }}
//                     className="border p-3 rounded bg-light-subtle mt-3"
//                   >
//                     <div className="text-danger fw-bold mb-2">
//                       Are you absolutely sure?
//                     </div>
//                     <div className="mb-2">
//                       This action is <u>permanent</u> and will delete your account, orders and all data. You can't undo it!
//                     </div>
//                     <div className="d-flex justify-content-end gap-2">
//                       <button className="btn btn-secondary btn-sm" disabled={deleting}
//                         onClick={() => setConfirmDelete(false)}
//                       >Cancel</button>
//                       <button className="btn btn-danger btn-sm" disabled={deleting}
//                         onClick={handleDeleteAccount}
//                       >{deleting ? "Deleting..." : "Yes, delete my account"}</button>
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           </div>
//         </motion.div>
//       </AnimatePresence>
//     </div>
//   );
// }
