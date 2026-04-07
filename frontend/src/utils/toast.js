import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Common toast configuration
const getToastConfig = (type) => {
  const configs = {
    success: {
      autoClose: 3000,
    },
    error: {
      autoClose: 5000,
    },
    info: {
      autoClose: 3000,
    },
    warning: {
      autoClose: 4000,
    },
  }
  
  return {
    position: 'top-right',
    autoClose: configs[type]?.autoClose || 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  }
}

// Unified toast function that always returns the same type
const createToast = (type, message) => {
  const config = getToastConfig(type)
  return toast[type](message, config)
}

// Individual toast functions - all return the same type (toast ID)
export const showSuccessToast = (message) => createToast('success', message)
export const showErrorToast = (message) => createToast('error', message)
export const showInfoToast = (message) => createToast('info', message)
export const showWarningToast = (message) => createToast('warning', message)

// Unified toast object with consistent interface
export const showToast = {
  success: showSuccessToast,
  error: showErrorToast,
  info: showInfoToast,
  warning: showWarningToast,
}

// Export the unified function as default for consistency
export default showToast
