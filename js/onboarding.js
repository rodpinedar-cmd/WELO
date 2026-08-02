// WELO — Onboarding
(function(){
  // Init Supabase
  if(typeof initSupabase === 'function') initSupabase();

  // If already logged in, skip to app
  if(getProfile()) {
    document.getElementById('onboarding').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    if(getProfile().role === 'el') document.body.classList.add('male');
    return;
  }

  // Set default date
  const d = new Date(); d.setDate(d.getDate()-5);
  const dateInput = document.getElementById('inp-lastperiod');
  if(dateInput) dateInput.value = d.toISOString().split('T')[0];

  // Step navigation
  function showStep(id) {
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  // Event delegation for all buttons
  document.getElementById('onboarding').addEventListener('click', function(e) {
    const btn = e.target.closest('[data-action], [data-role]');
    if(!btn) return;

    const action = btn.dataset.action;
    const role = btn.dataset.role;

    if(action === 'signup') {
      const email = document.getElementById('inp-email').value;
      const pass = document.getElementById('inp-pass').value;
      if(email && pass && supabase) {
        // Real signup with Supabase
        signUp(email, pass, 'pending').then(res => {
          if(res.error) { showToast('Error: ' + res.error); return; }
          showToast('✅ Cuenta creada');
          showStep('step-role');
        });
      } else {
        // Offline mode (no email or no supabase)
        showStep('step-role');
      }
    }
    else if(role === 'ella') {
      showStep('step-cycle');
    }
    else if(role === 'el') {
      document.body.classList.add('male');
      showStep('step-connect');
    }
    else if(action === 'savecycle') {
      const lp = document.getElementById('inp-lastperiod').value || d.toISOString().split('T')[0];
      const cl = parseInt(document.getElementById('inp-cyclelength').value) || 28;
      const pd = parseInt(document.getElementById('inp-periodduration').value) || 5;
      const code = genCode();
      setProfile({role:'ella', lastPeriodStart:lp, cycleLength:cl, periodDuration:pd, coupleCode:code, sharePhase:true, shareMood:true});
      // Create couple in Supabase
      if(supabase) createCouple(code).then(()=>console.log('Couple created in DB'));
      document.getElementById('display-code').textContent = code;
      showStep('step-code');
    }
    else if(action === 'skipcycle') {
      const code = genCode();
      const dd = new Date(); dd.setDate(dd.getDate()-14);
      setProfile({role:'ella', lastPeriodStart:dd.toISOString().split('T')[0], cycleLength:28, periodDuration:5, coupleCode:code, sharePhase:true, shareMood:true});
      document.getElementById('display-code').textContent = code;
      showStep('step-code');
    }
    else if(action === 'connect') {
      const code = (document.getElementById('inp-code').value || 'WLO-TEST').toUpperCase();
      const dd = new Date(); dd.setDate(dd.getDate()-10);
      setProfile({role:'el', coupleCode:code, lastPeriodStart:dd.toISOString().split('T')[0], cycleLength:28, periodDuration:5, sharePhase:true, shareMood:true});
      // Join couple in Supabase
      if(supabase) joinCouple(code).then(res => {
        if(res.error) console.warn('Join couple:', res.error);
        else console.log('Joined couple in DB');
      });
      // Welcome bonus
      const co = getCouple();
      if(!co.glow) { co.glow = 20; co.streak = 1; co.lastActive = today(); setCouple(co); }
      document.getElementById('onboarding').style.display = 'none';
      document.getElementById('app').style.display = 'block';
      initApp();
    }
    else if(action === 'done') {
      // Welcome bonus
      const co = getCouple();
      if(!co.glow) { co.glow = 20; co.streak = 1; co.lastActive = today(); setCouple(co); }
      document.getElementById('onboarding').style.display = 'none';
      document.getElementById('app').style.display = 'block';
      initApp();
    }
    else if(action === 'copycode') {
      navigator.clipboard.writeText(document.getElementById('display-code').textContent);
    }
  });
})();
