"use client"

import { useState, useEffect } from "react"
import { Check, X } from "lucide-react"

interface PasswordRequirement {
  id: string
  label: string
  validator: (password: string) => boolean
}

interface PasswordStrengthProps {
  password: string
  requirements?: PasswordRequirement[]
}

export function PasswordStrength({ 
  password, 
  requirements = [
    {
      id: "length",
      label: "Al menos 8 caracteres",
      validator: (password) => password.length >= 8,
    },
    {
      id: "lowercase",
      label: "Al menos una letra minúscula",
      validator: (password) => /[a-z]/.test(password),
    },
    {
      id: "uppercase",
      label: "Al menos una letra mayúscula",
      validator: (password) => /[A-Z]/.test(password),
    },
    {
      id: "number",
      label: "Al menos un número",
      validator: (password) => /[0-9]/.test(password),
    },
    {
      id: "special",
      label: "Al menos un carácter especial",
      validator: (password) => /[^A-Za-z0-9]/.test(password),
    },
  ]
}: PasswordStrengthProps) {
  const [strength, setStrength] = useState(0)
  
  useEffect(() => {
    if (!password) {
      setStrength(0)
      return
    }
    
    const passedRequirements = requirements.filter(req => req.validator(password)).length
    const strengthPercentage = (passedRequirements / requirements.length) * 100
    setStrength(strengthPercentage)
  }, [password, requirements])
  
  const getStrengthColor = () => {
    if (strength < 30) return "#FF6767" // Rojo
    if (strength < 70) return "#FEA800" // Amarillo
    return "#1B237E" // Azul (fuerte)
  }
  
  return (
    <div className="space-y-3">
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-300 ease-in-out"
          style={{ 
            width: `${strength}%`, 
            backgroundColor: getStrengthColor() 
          }}
        />
      </div>
      
      <div className="space-y-2">
        {requirements.map((requirement) => (
          <div key={requirement.id} className="flex items-center text-sm">
            {requirement.validator(password) ? (
              <Check className="h-4 w-4 text-green-500 mr-2" />
            ) : (
              <X className="h-4 w-4 text-gray-400 mr-2" />
            )}
            <span className={requirement.validator(password) ? "text-[#573353]" : "text-gray-500"}>
              {requirement.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface EmailValidationProps {
  email: string
}

export function EmailValidation({ email }: EmailValidationProps) {
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  
  if (!email) return null
  
  return (
    <div className="flex items-center text-sm mt-1">
      {isValidEmail ? (
        <>
          <Check className="h-4 w-4 text-green-500 mr-2" />
          <span className="text-green-600">Correo electrónico válido</span>
        </>
      ) : (
        <>
          <X className="h-4 w-4 text-red-500 mr-2" />
          <span className="text-red-600">Correo electrónico inválido</span>
        </>
      )}
    </div>
  )
}

interface FormFieldErrorProps {
  message?: string
}

export function FormFieldError({ message }: FormFieldErrorProps) {
  if (!message) return null
  
  return (
    <div className="flex items-center text-sm mt-1">
      <X className="h-4 w-4 text-red-500 mr-2" />
      <span className="text-red-600">{message}</span>
    </div>
  )
}
