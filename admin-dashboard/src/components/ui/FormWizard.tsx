import React, { useState, createContext, useContext } from 'react'
import { Button } from './Button'
import { CheckIcon } from '@heroicons/react/20/solid'
import { cn } from '@/lib/utils'

export interface WizardStep {
  id: string
  title: string
  description?: string
  optional?: boolean
  component: React.ComponentType<any>
}

interface WizardContextValue {
  currentStepIndex: number
  currentStep: WizardStep
  steps: WizardStep[]
  goToStep: (index: number) => void
  nextStep: () => void
  prevStep: () => void
  isFirstStep: boolean
  isLastStep: boolean
  completedSteps: Set<number>
  markStepComplete: (index: number) => void
  markStepIncomplete: (index: number) => void
}

const WizardContext = createContext<WizardContextValue | null>(null)

export const useWizard = () => {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error('useWizard must be used within a FormWizard')
  }
  return context
}

interface FormWizardProps {
  steps: WizardStep[]
  onComplete?: () => void
  onCancel?: () => void
  className?: string
  children?: React.ReactNode
}

export const FormWizard: React.FC<FormWizardProps> = ({
  steps,
  onComplete,
  onCancel,
  className,
  children,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const currentStep = steps[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1

  const goToStep = (index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index)
    }
  }

  const nextStep = () => {
    if (!isLastStep) {
      markStepComplete(currentStepIndex)
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const prevStep = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const markStepComplete = (index: number) => {
    setCompletedSteps(prev => new Set([...prev, index]))
  }

  const markStepIncomplete = (index: number) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev)
      newSet.delete(index)
      return newSet
    })
  }

  const contextValue: WizardContextValue = {
    currentStepIndex,
    currentStep,
    steps,
    goToStep,
    nextStep,
    prevStep,
    isFirstStep,
    isLastStep,
    completedSteps,
    markStepComplete,
    markStepIncomplete,
  }

  return (
    <WizardContext.Provider value={contextValue}>
      <div className={cn("space-y-8", className)}>
        {/* Progress Bar */}
        <div className="border-b border-gray-200 pb-8">
          {/* Step titles row */}
          <div className="flex justify-between mb-4">
            {steps.map((step, index) => {
              const isActive = index === currentStepIndex
              return (
                <div key={`title-${step.id}`} className="flex-1 text-center">
                  <p
                    className={cn(
                      "text-sm font-medium leading-tight break-words px-2",
                      isActive ? "text-blue-600" : "text-gray-500"
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-gray-500 mt-1 leading-tight break-words px-2">
                      {step.description}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Progress navigation */}
          <nav aria-label="Progress">
            <ol className="flex items-center justify-between">
              {steps.map((step, index) => {
                const isActive = index === currentStepIndex
                const isCompleted = completedSteps.has(index)
                const isClickable = index <= currentStepIndex || completedSteps.has(index)

                return (
                  <li
                    key={step.id}
                    className="relative flex-1 flex justify-center"
                  >
                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                      <div
                        className="absolute left-1/2 top-4 w-full h-0.5 -translate-y-1/2"
                        aria-hidden="true"
                      >
                        <div
                          className={cn(
                            "h-full w-full",
                            isCompleted || currentStepIndex > index
                              ? "bg-blue-600"
                              : "bg-gray-200"
                          )}
                        />
                      </div>
                    )}

                    {/* Step Circle */}
                    <button
                      type="button"
                      onClick={() => isClickable && goToStep(index)}
                      disabled={!isClickable}
                      className={cn(
                        "relative flex h-8 w-8 items-center justify-center rounded-full z-10",
                        isActive
                          ? "bg-blue-600 text-white"
                          : isCompleted
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-white border-2 border-gray-300 text-gray-500",
                        isClickable && !isActive && "hover:border-gray-400",
                        !isClickable && "cursor-not-allowed"
                      )}
                    >
                      <span className="sr-only">{step.title}</span>
                      {isCompleted ? (
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isActive ? "text-white" : "text-gray-500"
                          )}
                        >
                          {index + 1}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ol>
          </nav>
        </div>

        {/* Step Content */}
        <div className="min-h-96">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {currentStep.title}
              {currentStep.optional && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (volitelné)
                </span>
              )}
            </h2>
            {currentStep.description && (
              <p className="mt-1 text-sm text-gray-600">
                {currentStep.description}
              </p>
            )}
          </div>

          {/* Render current step component */}
          <currentStep.component />
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <div>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Zrušit
              </Button>
            )}
          </div>

          <div className="flex space-x-3">
            {!isFirstStep && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
              >
                Zpět
              </Button>
            )}

            {!isLastStep ? (
              <Button
                type="button"
                onClick={nextStep}
              >
                Pokračovat
              </Button>
            ) : (
              <Button
                type="button"
                onClick={onComplete}
              >
                Dokončit
              </Button>
            )}
          </div>
        </div>

        {children}
      </div>
    </WizardContext.Provider>
  )
} 