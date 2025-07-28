import React, { useState } from 'react';
import '../css/subcription.css'

const Subscription = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 9.99,
      period: 'per month',
      features: [
        'Access to basic features',
        'Limited content',
        'Email support',
        '5GB storage'
      ],
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 19.99,
      period: 'per month',
      features: [
        'Full access to all features',
        'Unlimited content',
        'Priority email support',
        '50GB storage',
        'Advanced analytics'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 49.99,
      period: 'per month',
      features: [
        'All Pro features plus:',
        'Dedicated account manager',
        '24/7 phone support',
        '500GB storage',
        'Custom integrations',
        'Team access'
      ],
      popular: false
    }
  ];

  const faqs = [
    {
      question: 'Can I change my plan later?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time from your account settings.'
    },
    {
      question: 'Do you offer annual billing?',
      answer: 'Yes! We offer a 10% discount for annual billing. Contact our sales team for more information.'
    },
    {
      question: 'Is there a free trial available?',
      answer: 'We offer a 14-day free trial for all new users. No credit card required to start your trial.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers.'
    }
  ];

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    setShowPaymentOptions(true);
  };

  const handlePayment = (method) => {
    // In a real app, this would redirect to the actual payment gateway
    alert(`Redirecting to ${method} payment for ${plans.find(p => p.id === selectedPlan).name} plan...`);
    // Reset after payment simulation
    setTimeout(() => {
      setSelectedPlan(null);
      setShowPaymentOptions(false);
      alert('Payment successful! Thank you for your subscription.');
    }, 2000);
  };

  return (
    <div className="subscription-page">
      <header>
        <h1>Choose Your Plan</h1>
        <p className="subtitle">Select the subscription that fits your needs</p>
      </header>
      
      <div className="plans-container">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`plan ${plan.popular ? 'popular' : ''} ${selectedPlan === plan.id ? 'selected' : ''}`}
          >
            {plan.popular && <div className="popular-badge">MOST POPULAR</div>}
            <div className="plan-name">{plan.name}</div>
            <div className="plan-price">${plan.price.toFixed(2)}</div>
            <div className="plan-period">{plan.period}</div>
            <ul className="plan-features">
              {plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <button 
              className="btn" 
              onClick={() => handlePlanSelect(plan.id)}
            >
              {selectedPlan === plan.id ? 'Selected' : 'Get Started'}
            </button>
          </div>
        ))}
      </div>

      {showPaymentOptions && (
        <div className="payment-modal">
          <div className="payment-content">
            <h2>Complete Your Subscription</h2>
            <p>You've selected the <strong>{plans.find(p => p.id === selectedPlan).name}</strong> plan for <strong>${plans.find(p => p.id === selectedPlan).price.toFixed(2)}</strong></p>
            
            <div className="payment-methods">
              <h3>Select Payment Method</h3>
              <div className="payment-options">
                <button className="payment-btn gpay" onClick={() => handlePayment('Google Pay')}>
                  <span className="payment-icon">G</span> Google Pay
                </button>
                <button className="payment-btn phonepe" onClick={() => handlePayment('PhonePe')}>
                  <span className="payment-icon">P</span> PhonePe
                </button>
                <button className="payment-btn credit-card" onClick={() => handlePayment('Credit Card')}>
                  <span className="payment-icon">💳</span> Credit Card
                </button>
                <button className="payment-btn paypal" onClick={() => handlePayment('PayPal')}>
                  <span className="payment-icon">P</span> PayPal
                </button>
              </div>
            </div>
            
            <button className="close-btnn" onClick={() => setShowPaymentOptions(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      
      <div className="faq">
        <h2>Frequently Asked Questions</h2>
        
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <div className="faq-question">{faq.question}</div>
            <p>{faq.answer}</p>
          </div>
        ))}
      </div>
      
      <footer>
        <p>Need help deciding? <a href="mailto:support@example.com">Contact our team</a> for personalized recommendations.</p>
        <p>© {new Date().getFullYear()} Your Company Name. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Subscription;