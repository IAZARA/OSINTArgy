// Utilidades para el manejo del disclaimer

export const DISCLAIMER_STORAGE_KEY = 'osintargy_disclaimer_accepted'
export const DISCLAIMER_VERSION = '1.0'

// Función para resetear el disclaimer (útil para testing)
export const resetDisclaimer = () => {
  try {
    localStorage.removeItem(DISCLAIMER_STORAGE_KEY)
    console.log('Disclaimer reseteado exitosamente')
    return true
  } catch (error) {
    console.error('Error al resetear disclaimer:', error)
    return false
  }
}

// Función para verificar el estado del disclaimer
export const checkDisclaimerStatus = () => {
  try {
    const stored = localStorage.getItem(DISCLAIMER_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        accepted: parsed.accepted === true,
        version: parsed.version,
        timestamp: parsed.timestamp,
        isCurrentVersion: parsed.version === DISCLAIMER_VERSION
      }
    }
    return {
      accepted: false,
      version: null,
      timestamp: null,
      isCurrentVersion: false
    }
  } catch (error) {
    console.error('Error al verificar disclaimer:', error)
    return {
      accepted: false,
      version: null,
      timestamp: null,
      isCurrentVersion: false
    }
  }
}

// Función para mostrar información del disclaimer en consola (debug)
export const debugDisclaimer = () => {
  const status = checkDisclaimerStatus()
  console.group('🛡️ OSINT Argy - Disclaimer Status')
  console.log('Accepted:', status.accepted)
  console.log('Version:', status.version)
  console.log('Current Version:', DISCLAIMER_VERSION)
  console.log('Is Current Version:', status.isCurrentVersion)
  console.log('Timestamp:', status.timestamp)
  console.groupEnd()
}

// Función para forzar mostrar el disclaimer (desarrollo)
export const forceShowDisclaimer = () => {
  resetDisclaimer()
  window.location.reload()
}

// Exponer funciones globalmente para debugging (solo en desarrollo)
if (import.meta.env.DEV) {
  window.disclaimerDebug = {
    reset: resetDisclaimer,
    check: checkDisclaimerStatus,
    debug: debugDisclaimer,
    forceShow: forceShowDisclaimer
  }
  
  console.log('🛠️ Disclaimer debug tools available at window.disclaimerDebug')
}