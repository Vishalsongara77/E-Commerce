import React from 'react';
import { FiMapPin, FiCreditCard, FiCheckCircle } from 'react-icons/fi';

const CheckoutStepper = ({ activeStep }) => {
  const steps = [
    { id: 1, name: 'Shipping', icon: FiMapPin },
    { id: 2, name: 'Payment', icon: FiCreditCard },
    { id: 3, name: 'Review', icon: FiCheckCircle }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step circle with icon */}
            <div className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activeStep >= step.id 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                <step.icon className="text-lg" />
              </div>
              <span 
                className={`mt-2 text-sm font-medium ${
                  activeStep >= step.id ? 'text-amber-600' : 'text-gray-500'
                }`}
              >
                {step.name}
              </span>
            </div>
            
            {/* Connector line between steps */}
            {index < steps.length - 1 && (
              <div 
                className={`w-16 h-1 mx-2 ${
                  activeStep > index + 1 ? 'bg-amber-600' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CheckoutStepper;