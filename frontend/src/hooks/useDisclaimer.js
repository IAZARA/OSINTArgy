import { useState, useEffect } from 'react'
import { DISCLAIMER_STORAGE_KEY, DISCLAIMER_VERSION } from '@utils/disclaimerUtils'

export const useDisclaimer = () => {
  const [isAccepted, setIsAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkDisclaimerStatus = () => {
      try {
        const stored = localStorage.getItem(DISCLAIMER_STORAGE_KEY)
        
        if (stored) {
          const parsed = JSON.parse(stored)
          // Verificar si la versión coincide
          if (parsed.version === DISCLAIMER_VERSION && parsed.accepted === true) {
            setIsAccepted(true)
          }
        }
      } catch (error) {
        console.error('Error al verificar disclaimer:', error)
        // Si hay error, no aceptar por defecto
        setIsAccepted(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkDisclaimerStatus()
  }, [])

  const acceptDisclaimer = () => {
    try {
      const disclaimerData = {
        accepted: true,
        version: DISCLAIMER_VERSION,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      }
      
      localStorage.setItem(DISCLAIMER_STORAGE_KEY, JSON.stringify(disclaimerData))
      setIsAccepted(true)
    } catch (error) {
      console.error('Error al guardar disclaimer:', error)
    }
  }

  const declineDisclaimer = () => {
    try {
      // Remover cualquier aceptación previa
      localStorage.removeItem(DISCLAIMER_STORAGE_KEY)
      setIsAccepted(false)
    } catch (error) {
      console.error('Error al rechazar disclaimer:', error)
    }
  }

  const resetDisclaimer = () => {
    try {
      localStorage.removeItem(DISCLAIMER_STORAGE_KEY)
      setIsAccepted(false)
    } catch (error) {
      console.error('Error al resetear disclaimer:', error)
    }
  }

  return {
    isAccepted,
    isLoading,
    acceptDisclaimer,
    declineDisclaimer,
    resetDisclaimer
  }
}