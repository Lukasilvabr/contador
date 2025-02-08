(function() {
  const SUPABASE_URL = 'https://jvaksnlzifsiuxzijyit.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2YWtzbmx6aWZzaXV4emlqeWl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk2NTg0NDUsImV4cCI6MjAyNTIzNDQ0NX0.GzpTJQO9nPRHgzWOJQ7I38LwFgXQZGahxp7hTZ9tE-E';
  
  // Cria o elemento de estilo
  const style = document.createElement('style');
  style.textContent = `
    #countdown-container {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      z-index: 9999;
      text-align: center;
      padding: 0.75rem 1rem;
      background: transparent;
      border-radius: 0.5rem;
      max-width: 260px;
      width: 90%;
      margin: 0 auto;
    }
    #countdown-timer {
      font-family: monospace;
      font-size: 1.5rem;
      color: white;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.9),
                   -1px -1px 3px rgba(0,0,0,0.9),
                   1px -1px 3px rgba(0,0,0,0.9),
                   -1px 1px 3px rgba(0,0,0,0.9);
      letter-spacing: 1px;
    }
    #countdown-message {
      font-size: 0.813rem;
      color: white;
      text-shadow: 2px 2px 3px rgba(0,0,0,0.9),
                   -1px -1px 2px rgba(0,0,0,0.9),
                   1px -1px 2px rgba(0,0,0,0.9),
                   -1px 1px 2px rgba(0,0,0,0.9);
      font-weight: 500;
    }
    @media (max-width: 640px) {
      #countdown-container {
        bottom: 1rem;
        padding: 0.625rem 0.875rem;
      }
      #countdown-timer {
        font-size: 1.25rem;
      }
      #countdown-message {
        font-size: 0.75rem;
      }
    }
  `;
  document.head.appendChild(style);

  // Cria o container do widget
  const container = document.createElement('div');
  container.id = 'countdown-container';
  container.style.display = 'none';
  
  // Cria os elementos do timer e mensagem
  const timerElement = document.createElement('div');
  timerElement.id = 'countdown-timer';
  
  const messageElement = document.createElement('div');
  messageElement.id = 'countdown-message';
  messageElement.textContent = 'não envie stickers quando o tempo zerar';
  
  container.appendChild(timerElement);
  container.appendChild(messageElement);
  document.body.appendChild(container);

  // Função para formatar o tempo
  function formatTime(minutes, seconds) {
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  // Função para buscar e atualizar o status do link
  async function updateLinkStatus() {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/slow_links?select=*&is_active=eq.true`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      const links = await response.json();
      const activeLink = links[0];

      if (activeLink) {
        const settingsResponse = await fetch(`${SUPABASE_URL}/rest/v1/system_settings?select=activation_duration`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        
        const settings = await settingsResponse.json();
        const activationDuration = settings[0]?.activation_duration || 15;
        
        const activationTime = new Date(activeLink.last_activated_at);
        const now = new Date();
        const elapsedMinutes = (now.getTime() - activationTime.getTime()) / (1000 * 60);
        const remainingTime = Math.max(0, activationDuration - elapsedMinutes);
        
        const minutes = Math.floor(remainingTime);
        const seconds = Math.round((remainingTime % 1) * 60);
        
        timerElement.textContent = formatTime(minutes, seconds);
        container.style.display = remainingTime > 0 ? 'flex' : 'none';
      } else {
        container.style.display = 'none';
      }
    } catch (error) {
      container.style.display = 'none';
    }
  }

  // Atualiza o status inicialmente e a cada 1 segundo
  updateLinkStatus();
  setInterval(updateLinkStatus, 1000);
})();
