import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const questions = [
    {
      id: 'marriage_timeline',
      title: 'When do you intend to marry?',
      subtitle: 'We prioritize matches who share your timeline to ensure mutual seriousness.',
      type: 'single',
      options: [
        { value: 'asap', label: 'As soon as possible' },
        { value: '6-12months', label: 'Within 6-12 months' },
        { value: '1-2years', label: '1-2 years' },
        { value: 'passive', label: 'Passively looking' }
      ]
    },
    {
      id: 'profile_manager',
      title: 'Who will primarily manage this profile?',
      subtitle: 'We value clarity and transparency. Knowing who is communicating helps build trust from the very first interaction.',
      type: 'single',
      options: [
        { value: 'self', label: 'I will manage it myself', description: 'Direct communication with potential matches.' },
        { value: 'family', label: "I will manage it with my family's involvement", description: 'Shared responsibility for thoughtful decisions.' },
        { value: 'family-assist', label: 'My family will assist, but I make final decisions', description: 'Family-supported search, personal choice.' }
      ]
    },
    {
      id: 'family_involvement',
      title: 'How involved do you expect families to be in the decision process?',
      subtitle: 'Family dynamics play a crucial role. We match you with partners who share similar expectations.',
      type: 'single',
      options: [
        { value: 'minimal', label: 'Minimal', description: 'After initial conversations' },
        { value: 'moderate', label: 'Moderate', description: 'Families involved alongside us' },
        { value: 'high', label: 'High', description: 'Family approval is essential' }
      ]
    },
    {
      id: 'lifestyle_preferences',
      title: 'Do you have any non-negotiable lifestyle preferences?',
      subtitle: 'Select all that apply.',
      type: 'multiple',
      options: [
        { value: 'diet', label: 'Diet preferences', icon: 'restaurant' },
        { value: 'religious', label: 'Religious practices', icon: 'temple_hindu' },
        { value: 'lifestyle', label: 'Lifestyle habits (smoking / drinking)', icon: 'local_bar' },
        { value: 'none', label: 'None — open-minded', icon: 'favorite' }
      ]
    },
    {
      id: 'living_arrangement',
      title: 'What living arrangement do you see after marriage?',
      subtitle: 'Honest preferences regarding home life help us find compatible partners.',
      type: 'single',
      options: [
        { value: 'nuclear', label: 'Independent / nuclear family' },
        { value: 'joint', label: 'Joint family' },
        { value: 'open', label: 'Open to both' },
        { value: 'depends', label: 'Depends on circumstances' }
      ]
    },
    {
      id: 'life_priority',
      title: 'Which best describes your current life priority?',
      subtitle: 'We prioritize clarity to ensure your future partner shares your lifestyle vision.',
      type: 'single',
      options: [
        { value: 'career', label: 'Career-focused, family planning alongside' },
        { value: 'balanced', label: 'Balanced focus on career and family' },
        { value: 'family-first', label: 'Family-first, career adjusted accordingly' }
      ]
    },
    {
      id: 'relocation',
      title: 'Are you open to relocating after marriage?',
      subtitle: 'Being transparent about your flexibility helps us find partners whose life plans align with yours.',
      type: 'single',
      options: [
        { value: 'yes', label: 'Yes, open to relocation' },
        { value: 'region', label: 'Only within my current region' },
        { value: 'city', label: 'Prefer to stay in my current city' },
        { value: 'depends', label: 'Depends on partner and opportunity' }
      ]
    }
  ];

  const totalSteps = questions.length;
  const currentQuestion = questions[currentStep];

  const handleOptionSelect = (value) => {
    if (currentQuestion.type === 'multiple') {
      const currentAnswers = answers[currentQuestion.id] || [];
      if (currentAnswers.includes(value)) {
        setAnswers({
          ...answers,
          [currentQuestion.id]: currentAnswers.filter(v => v !== value)
        });
      } else {
        setAnswers({
          ...answers,
          [currentQuestion.id]: [...currentAnswers, value]
        });
      }
    } else {
      setAnswers({
        ...answers,
        [currentQuestion.id]: value
      });
    }
  };

  const isOptionSelected = (value) => {
    if (currentQuestion.type === 'multiple') {
      return (answers[currentQuestion.id] || []).includes(value);
    }
    return answers[currentQuestion.id] === value;
  };

  const handleContinue = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save answers to localStorage and navigate to profile creation
      localStorage.setItem('onboardingAnswers', JSON.stringify(answers));
      navigate('/create-profile');
    }
  };

  const handleSkip = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/create-profile');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf8f9] via-white to-[#fef9f0] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[-5%] w-[300px] h-[400px] bg-gradient-to-br from-pink-100/40 to-transparent rounded-3xl transform rotate-[-15deg] blur-sm"></div>
        <div className="absolute top-[30%] right-[-5%] w-[280px] h-[350px] bg-gradient-to-bl from-amber-50/60 to-transparent rounded-3xl transform rotate-[15deg] blur-sm"></div>
        <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-amber-50/30 to-transparent"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-4 border-b border-gray-100/50 bg-white/50 backdrop-blur-sm">
        <Link to="/">
          <Logo size="sm" />
        </Link>
        
        {/* Progress Indicator */}
        <div className="flex items-center gap-1.5">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index <= currentStep 
                  ? 'w-6 bg-primary' 
                  : 'w-1.5 bg-gray-200'
              }`}
            />
          ))}
        </div>

        <Link 
          to="/" 
          className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
        >
          Exit
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 py-12 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-xl mx-auto">
          {/* Question Counter */}
          <div className="text-center mb-6">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary">
              Question {String(currentStep + 1).padStart(2, '0')} of {String(totalSteps).padStart(2, '0')}
            </span>
          </div>

          {/* Question Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-center text-gray-900 mb-4 leading-tight">
            {currentQuestion.title}
          </h1>

          {/* Question Subtitle */}
          <p className="text-center text-gray-500 mb-10 max-w-md mx-auto">
            {currentQuestion.subtitle}
          </p>

          {/* Options */}
          <div className={`space-y-3 mb-8 ${
            currentQuestion.options.length === 4 && !currentQuestion.options[0].description
              ? 'grid grid-cols-2 gap-4 space-y-0'
              : ''
          }`}>
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOptionSelect(option.value)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  isOptionSelected(option.value)
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {option.icon && (
                      <span className={`material-symbols-outlined text-xl ${
                        isOptionSelected(option.value) ? 'text-primary' : 'text-gray-400'
                      }`}>
                        {option.icon}
                      </span>
                    )}
                    <div>
                      <p className={`font-medium ${
                        isOptionSelected(option.value) ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {option.label}
                      </p>
                      {option.description && (
                        <p className="text-sm text-gray-400 mt-0.5">{option.description}</p>
                      )}
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isOptionSelected(option.value)
                      ? 'border-primary bg-primary'
                      : 'border-gray-300'
                  }`}>
                    {isOptionSelected(option.value) && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Continue Button */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleContinue}
              disabled={!answers[currentQuestion.id] || (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length === 0)}
              className={`w-full max-w-xs py-3.5 px-8 rounded-full font-semibold text-white transition-all duration-200 ${
                answers[currentQuestion.id] && (!Array.isArray(answers[currentQuestion.id]) || answers[currentQuestion.id].length > 0)
                  ? 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Continue
            </button>
            
            <button
              onClick={handleSkip}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Skip for now
            </button>
            
            {/* Trust Badge - moved inline */}
            <p className="text-xs text-gray-400 flex items-center gap-1.5 uppercase tracking-wider mt-4">
              <span className="material-symbols-outlined text-sm">lock</span>
              This helps us limit matches to serious members only
            </p>
            
            {currentStep > 0 && (
              <p className="text-xs text-primary font-medium uppercase tracking-wide mt-3">
                Skipping may reduce match quality
              </p>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="absolute bottom-6 left-0 right-0 flex items-center justify-between px-6 md:px-12 text-xs text-gray-400">
          <div>
            <p className="font-medium">Exclusive Membership</p>
            <p>ID: #892-001</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            <span>Secure Session</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
