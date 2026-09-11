(() => {
  const open = async (type) => {
    try {
      const mod = await import('./components/modals.js');
      mod.openModal(type);
    } catch (e) {
      console.error(e);
      alert('The portal interface could not be loaded. Please hard-refresh the page.');
    }
  };
  window.selectRole = (role) => {
    const token = localStorage.getItem('token');
    const current = localStorage.getItem('userRole');
    if (token && current === role) {
      if (role === 'admin') location.href = '/adminDashboard/' + encodeURIComponent(token);
      else if (role === 'doctor') location.href = '/doctorDashboard/' + encodeURIComponent(token);
      else location.href = '/pages/patientDashboard.html';
      return;
    }
    if (role === 'admin') return open('adminLogin');
    if (role === 'doctor') return open('doctorLogin');
    if (role === 'patient') return open('login');
  };
  const bind = () => document.querySelectorAll('[data-role]').forEach(btn => {
    btn.onclick = () => window.selectRole(btn.dataset.role);
    btn.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.selectRole(btn.dataset.role); } };
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, {once:true}); else bind();
})();
